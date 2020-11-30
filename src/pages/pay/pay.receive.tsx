/**
 * @Author: Ghan
 * @Date: 2019-11-12 14:01:28
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-20 14:31:25
 */
import Taro, { Config } from "@tarojs/taro";
import { View, Image, Text, Input } from "@tarojs/components";
import "../style/pay.less";
import "../style/product.less";
import classnames from "classnames";
import { AtActivityIndicator } from "taro-ui";
import FormCard from "../../component/card/form.card";
import { FormRowProps } from "../../component/card/form.row";
import { getPayReceive, PayReducer } from "../../reducers/app.pay";
import { AppReducer } from "../../reducers";
import { connect } from "@tarojs/redux";
import numeral from "numeral";
import invariant from "invariant";
import productSdk from "../../common/sdk/product/product.sdk";
import { ProductCartInterface } from "../../common/sdk/product/product.sdk";
import { ProductInterfaceMap } from "../../constants";
import {
  ResponseCode,
  ProductInterface,
  ProductService
} from "../../constants/index";
import { store } from "../../app";
import { checkNumberInput } from "../../common/util/common";

const Items = [
  {
    title: "收款码",
    image: "//net.huanmusic.com/weapp/icon_receipt.png",
    tab: "receive"
  },
  {
    title: "扫一扫",
    image: "//net.huanmusic.com/weapp/icon_sao.png",
    tab: "scan"
  },
  {
    title: "现金",
    image: "//net.huanmusic.com/weapp/cash.png",
    tab: "cash"
  }
];

const cssPrefix = "pay";

interface Props {
  payDetail: PayReducer.PayReceive;
  orderNo: string[];
}
interface State {
  tab: "receive" | "cash";
  receiveCash: string;
  codeUrl: string;
}

class PayReceive extends Taro.Component<Props, State> {
  static defaultProps: Props = {
    payDetail: {
      transPayload: undefined,
      transResult: undefined
    },
    orderNo: []
  };

  state: State = {
    tab: "receive",
    receiveCash: "",
    codeUrl: '',
  };

  config: Config = {
    navigationBarTitleText: "收款"
  };

  componentDidMount() {
    const { payDetail } = this.props
    productSdk.cashierPay({
      orderNo: (payDetail.transResult as ProductInterface.CashierPay).orderNo,
      payType: 1,
    })
      .then((res) => {
        if(res.code === ResponseCode.success) {
          this.setState({codeUrl: res.data.codeUrl})
          setTimeout(this.queryStatus.bind(null, payDetail.transResult && payDetail.transResult.orderNo), 5000)
        }
      })
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER);
  }

  componentWillUnmount() {
    const { payDetail } = this.props;
    // 退出的订单保存到redux中
    store.dispatch({
      type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_ORDERRNO,
      payload: (payDetail.transResult as ProductInterface.CashierPay).orderNo
    });
  }

  public queryStatus = async (orderNo: string) => {
    try {
      const { payDetail } = this.props;
      invariant(payDetail.transPayload !== undefined, "支付参数设置错误");
      invariant(payDetail.transResult !== undefined, "支付参数设置错误");
      const result = await ProductService.cashierQueryStatus({
        orderNo: (payDetail.transResult as ProductInterface.CashierPay).orderNo
      });

      if(result && result.errMsg === 'request:fail timeout') {
        this.queryStatus(orderNo)
        return
      }
      if (result && result.code === ResponseCode.success ) {
        const { data } = result;
        this.receiveCallback(data.status, payDetail.transResult as any);
      }else {
        throw new Error(result && result.msg || ' ')
      }
    } catch (error) {
      if(error && error.errMsg === 'request:fail timeout') {
        this.queryStatus(orderNo)
        return
      }
      Taro.showToast({
        title: error.message,
        icon: "none",
      });
    }
  };

  public onChangeCash = (value: string) => {
    const newValue = checkNumberInput(value);
    if (Number(newValue) > 99999999) {
      this.setState({ receiveCash: "99999999" });
      return "99999999";
    }
    this.setState({ receiveCash: checkNumberInput(value) });
  };

  /**
   * @todo [修改当前页面tab]
   *
   * @memberof PayReceive
   */
  public onChangeTab = (tab: "receive" | "cash") => {
    this.setState({ tab });
  };

  /**
   * @todo [点击tab事件]
   *
   * @memberof PayReceive
   */
  public onTabClick = (tab: any) => {
    try {
      const { payDetail } = this.props;
      if (payDetail.transPayload === undefined) {
        throw new Error("支付参数不正确");
      } else if (payDetail.transResult === undefined) {
        throw new Error("支付参数不正确");
      } else {
        if (tab === "scan") {
          Taro.scanCode()
            .then(async barcodeResult => {
              Taro.showLoading();
              const barcode = barcodeResult.result;
              if (barcode.indexOf("ALIPAY") !== -1) {
                throw new Error("暂不支持支付宝支付码");
              }
              const payload: ProductCartInterface.ProductPayForCashierPayload = {
                payType: 3,
                authCode: barcode,
                orderNo: (payDetail.transResult as ProductInterface.CashierPay).orderNo
              };
              const scanPayResult = await productSdk.cashierPay(payload);
              Taro.hideLoading();
              invariant(
                scanPayResult.code === ResponseCode.success,
                scanPayResult.msg || ResponseCode.error
              );
              this.receiveCallback(scanPayResult.data.status, payload);
            })
            .catch(error => {
              Taro.hideLoading();
              Taro.showModal({
                title: '提示',
                content: error.message || '收款失败',
                cancelText: '继续收款',
                confirmText: '重新收款',
                success: (res) => {
                  if (res.confirm) {
                    Taro.navigateBack()
                  } else if (res.cancel) {
                  }                  
                }
              })
            });
        } else {
          this.onChangeTab(tab);
        }
      }
    } catch (error) {
      Taro.hideLoading()
      Taro.showModal({
        title: '提示',
        content: error.message || '收款失败',
        cancelText: '继续收款',
        confirmText: '重新收款',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateBack()
          } else if (res.cancel) {
          }                  
        }
      })
    }
  };

  /**
   * @todo [收款成功之后的处理]
   * @todo [1.清空购物车]
   * @todo [2.跳转到收款结果页面]
   *
   * @memberof PayReceive
   */
  public receiveCallback = (
    success: boolean,
    payload: ProductCartInterface.ProductPayForCashierPayload
  ) => {
    const params = {
      status: success,
      orderNo: payload.orderNo,
      entry: "pay.receive"
    };
    // 如果退出的订单号中包含此订单，不执行
    if(this.props.orderNo.indexOf(payload.orderNo) !== -1) {
      return
    }
    if (success === true) {
      // 清空购物车
      store.dispatch({
        type: productSdk.reducerInterface.MANAGE_EMPTY_CART,
        payload: {}
      });

      Taro.redirectTo({
        url: `/pages/pay/pay.result?params=${JSON.stringify(params)}`
      });
    } else {
      // 收款失败
      Taro.showToast({ title: `收款失败` });
      Taro.navigateTo({
        url: `/pages/pay/pay.result?params=${JSON.stringify(params)}`
      });
    }
  };

  public validate = () => {
    const { receiveCash } = this.state;
    const { payDetail } = this.props;
    if (payDetail.transPayload && payDetail.transResult) {
      if (receiveCash === "") {
        return { success: false, result: "请输入收款金额" };
      } else if (
        numeral(receiveCash).value() < payDetail.transPayload.order.transAmount
      ) {
        return { success: false, result: "收款金额应大于支付金额" };
      } else {
        return { success: true, result: " " };
      }
    } else {
      return { success: false, result: "收款信息丢失" };
    }
  };

  /**
   * @todo [选择现金收款点击确定事件]
   *
   * @memberof PayReceive
   */
  public onCashReceive = async () => {
    try {
      const validateResult = this.validate();
      invariant(validateResult.success, validateResult.result);
      Taro.showLoading();
      const { payDetail } = this.props;
      invariant(payDetail.transPayload !== undefined, "参数设置错误");
      invariant(payDetail.transResult !== undefined, "参数设置错误");
      if (
        payDetail.transPayload !== undefined &&
        payDetail.transResult !== undefined
      ) {
        const payload: ProductCartInterface.ProductPayForCashierPayload = {
          payType: 0,
          orderNo: (payDetail.transResult as ProductInterface.CashierPay).orderNo
        };
        const result = await productSdk.cashierPay(payload);
        Taro.hideLoading();
        invariant(
          result.code === ResponseCode.success,
          result.msg || ResponseCode.error
        );
        this.receiveCallback(result.data.status, payload);
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  render() {
    return (
      <View className={`container ${cssPrefix}-receive`}>
        <View className={`${cssPrefix}-receive-header`}>
          {Items.map(item => {
            return (
              <View
                key={item.title}
                className={classnames(`${cssPrefix}-receive-header-item`, {
                  [`${cssPrefix}-receive-header-item-active`]:
                    this.state.tab === item.tab,
                  [`${cssPrefix}-receive-header-item-disabled`]:
                    this.state.tab !== item.tab
                })}
                onClick={() => this.onTabClick(item.tab)}
              >
                <Image
                  src={item.image}
                  className={`${cssPrefix}-receive-header-item-image`}
                />
                <Text
                  className={classnames(
                    `${cssPrefix}-receive-header-item-text`
                  )}
                >
                  {item.title}
                </Text>
              </View>
            );
          })}
        </View>
        {this.renderContent()}
      </View>
    );
  }

  /**
   * @todo [根据type渲染内容]
   *
   * @private
   * @memberof PayReceive
   */
  private renderContent = () => {
    const { tab, receiveCash, codeUrl } = this.state;
    const { payDetail } = this.props;

    if (tab === "receive") {
      return (
        <View className={`${cssPrefix}-receive-content`}>
          <View className={`${cssPrefix}-receive-content-code`}>
            {codeUrl ? (
              <Image
                className={`${cssPrefix}-receive-content-code-image`}
                // src={`${getBaseUrl('').replace('inventory-app/api', '')}${payDetail.transResult.codeUrl}`}
                src={`${codeUrl}`}
              />
            ) : (
              <AtActivityIndicator mode="center" />
            )}
          </View>
          <Text className={`${cssPrefix}-receive-content-text`}>
            请用手机扫一扫二维码，进行付款
          </Text>
          {payDetail.transPayload !== undefined && (
            <View className={`${cssPrefix}-receive-content-price`}>
              ￥
              {numeral(payDetail.transPayload.order.transAmount).format("0.00")}
            </View>
          )}
        </View>
      );
    } else if (tab === "cash") {
      if (payDetail.transPayload) {
        const cashForm: FormRowProps[] = [
          {
            title: "应收金额",
            extraText: `￥${numeral(
              payDetail.transPayload.order.transAmount
            ).format("0.00")}`
          },
          {
            title: "找零金额",
            hasBorder: false,
            extraTextStyle: "price",
            extraText: !!receiveCash
              ? `￥${numeral(
                  numeral(receiveCash).value() -
                    numeral(payDetail.transPayload.order.transAmount).value() >
                    0
                    ? numeral(receiveCash).value() -
                        numeral(
                          payDetail.transPayload.order.transAmount
                        ).value()
                    : 0
                ).format("0.00")}`
              : ""
          }
        ];
        return (
          <View className={`${cssPrefix}-receive-content-cash`}>
            <FormCard items={cashForm} shadow={false} />
            <View
              className={`${cssPrefix}-input-box ${cssPrefix}-receive-content-cash-box`}
            >
              <View className={`product-row-normal-title`}>收款金额</View>
              <View className={`${cssPrefix}-input-box-input`}>
                <View className={`${cssPrefix}-input-box-input-money`}>￥</View>
                <Input
                  // cursorSpacing={300}
                  focus={true}
                  className={`${cssPrefix}-input-box-input-input`}
                  value={receiveCash}
                  onInput={({ detail: { value } }) => this.onChangeCash(value)}
                  placeholder="请输入收款金额"
                  placeholderClass={`${cssPrefix}-input-box-input-input-placeholder`}
                  type="digit"
                />
              </View>
            </View>

            <View
              className={classnames(`${cssPrefix}-cash-button`, {
                [`${cssPrefix}-cash-button-disable`]: !receiveCash
              })}
              onClick={this.onCashReceive}
            >
              确定
            </View>
          </View>
        );
      }
    }
  };
}

const select = (state: AppReducer.AppState) => ({
  payDetail: getPayReceive(state),
  orderNo: state.pay.orderNo
});

export default connect(select)(PayReceive);
