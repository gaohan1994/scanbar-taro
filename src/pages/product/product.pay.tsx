import Taro from "@tarojs/taro";
import { View, Text, Image, Input } from "@tarojs/components";
import { AppReducer } from "../../reducers";
import { getProductCartList } from "../../common/sdk/product/product.sdk.reducer";
import { connect } from "@tarojs/redux";
import productSdk, {
  ProductCartInterface
} from "../../common/sdk/product/product.sdk";
import "../../component/card/form.card.less";
import "../style/product.less";
import "../style/order.less";
import "../../styles/theme.less";
import "../../component/cart/cart.less";
import classnames from "classnames";
import FormCard from "../../component/card/form.card";
import { FormRowProps } from "../../component/card/form.row";
import invariant from "invariant";
import {
  ResponseCode,
  MemberInterface,
  MemberInterfaceMap
} from "../../constants/index";
import { store } from "../../app";
import { ProductInterfaceMap } from "../../constants";
import Modal from "../../component/modal/modal";
import numeral from "numeral";
import memberService from "../../constants/member/member.service";
import merge from "lodash.merge";
import { PayReducer } from "../../reducers/app.pay";
import { getSelectMember } from "../../reducers/app.member";
import { ModalInput } from "../../component/modal/modal";
import ProductPayListView from "../../component/product/product.pay.listview";
import merchantAction from "../../actions/merchant.action";
import { getCouponList, getSelectCoupon } from "../../reducers/app.merchant";
import { MerchantInterface } from "src/constants";
import MemberModal from "../../component/modal/member.modal";
import merchantService from "../../constants/merchant/merchant.service";
import memberAction from "../../actions/member.action";
import { checkNumberInput } from "../../common/util/common";

const cssPrefix = "product";

export interface SelectMember extends MemberInterface.MemberInfo {
  perference?: MemberInterface.MemberPerference[];
  orderInfo?: MemberInterface.MemberOrderInfo;
  couponList?: MerchantInterface.Coupon[];
}

interface Props {
  productCartList: ProductCartInterface.ProductCartInfo[];
  addSelectMember?: MemberInterface.MemberInfo;
  couponList: MerchantInterface.Coupon[];
  selectCoupon?: MerchantInterface.Coupon;
}

interface State {
  eraseModal: boolean;
  eraseValue: string;
  memberModal: boolean;
  memberLayout: boolean;
  memberValue: string;
  usePoint: boolean;
  selectMember?: SelectMember;
  receiveValue: string; // 应收金额
  receiveDiscount: string; // 整单折扣
  selectCoupon?: MerchantInterface.Coupon;
}

class ProductPay extends Taro.Component<Props, State> {
  config: Taro.Config = {
    navigationBarTitleText: "结算"
  };

  readonly state: State = {
    eraseModal: false,
    eraseValue: "",
    memberModal: false,
    memberValue: "",
    memberLayout: false,
    receiveValue: "",
    receiveDiscount: "",
    usePoint: false,
    selectMember: undefined,
    selectCoupon: undefined
  };

  public componentDidShow = async () => {
    const { addSelectMember, selectCoupon } = this.props;

    /**
     * @todo 获取满减信息
     */
    await merchantAction.activityInfoList();

    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER);
    /**
     * 每次进入结算页面的时候重置数据并清空 productsdk
     */
    this.setState({
      eraseModal: false,
      eraseValue: "",
      memberModal: false,
      memberValue: "",
      memberLayout: false,
      receiveValue: "",
      receiveDiscount: ""
    });
    productSdk.setErase(undefined);

    /**
     * @todo 如果是从添加会员页面回来则把新增的会员设置进去，如果是刚进入页面则重置会员状态
     */
    if (addSelectMember !== undefined) {
      this.setState({ selectMember: addSelectMember }, () => {
        this.setCoupons();
      });
      productSdk.setMember(addSelectMember);
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.SET_MEMBER_SELECT,
        payload: { selectMember: undefined }
      });
    } else if (!this.state.selectMember) {
      productSdk.setMember(undefined);
      this.setCoupons();
    } else {
      productSdk.setMember(this.state.selectMember);
      console.log("this.state.selectMember", this.state.selectMember);
      this.setCoupons();
    }

    /**
     * @time 0318
     * @todo [加入优惠券]
     * @todo [从购物车进入则清空优惠券]
     */
    if (!!selectCoupon) {
      this.setState({ selectCoupon });
      productSdk.setCoupon(selectCoupon);
      merchantAction.selectCoupon(undefined);
    } else {
      this.setState({ selectCoupon: undefined });
      productSdk.setCoupon(undefined);
    }
  };

  public changeModalVisible = (key: string, visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: typeof visible === "boolean" ? visible : !prevState[key]
      };
    });
  };

  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  };

  public setPoint = () => {
    const { usePoint } = this.state;
    const point: any = productSdk.getPointPrice();
    /**
     * @time 0428
     * @todo [不管选择还是取消选择，都取消改价]
     */
    this.setState({ eraseValue: "" });
    productSdk.setErase(undefined);
    if (usePoint === true) {
      // 当前为选中状态，则取消选中
      productSdk.setPoint(undefined);
      this.setState({ usePoint: false });
      return;
    }
    productSdk.setPoint(point.pointPrice);
    this.setState({ usePoint: true });
    return;
  };

  public onChangeReceive = (key: string, value: string) => {
    if (value === "") {
      productSdk.setErase(undefined);
      this.setState({
        receiveValue: "",
        receiveDiscount: "",
        eraseValue: ""
      });
      return;
    }

    /**
     * @todo [第一步，先拿到除了改价之外的最终价格]
     * @todo [第二步，计算整单改价的价格和比例]
     */
    const memberPrice: number = productSdk.getProductTransPrice(false);
    let nextReceiveValue: string = "";
    let nextReceiveDiscount: string = "";
    let nextEraseValue: string = "";
    if (key === "receiveValue") {
      const erasePrice = numeral(memberPrice - numeral(value).value()).value();
      productSdk.setErase(`${erasePrice}`);
      nextReceiveValue = value;
      nextReceiveDiscount = `${Math.floor(
        (numeral(value).value() / memberPrice) * 100
      )}`;
      nextEraseValue = `${erasePrice}`;
    } else {
      const erasePrice = numeral(
        memberPrice - (memberPrice * numeral(value).value()) / 100
      ).value();
      productSdk.setErase(`${erasePrice}`);
      nextReceiveValue = `${(memberPrice * numeral(value).value()) / 100}`;
      nextReceiveDiscount = value;
      nextEraseValue = `${erasePrice}`;
    }
    this.setState(prevState => {
      return {
        ...prevState,
        receiveValue: nextReceiveValue,
        receiveDiscount: nextReceiveDiscount,
        eraseValue: nextEraseValue
      };
    });
  };

  public getTransValue = (): number => {
    const { eraseValue } = this.state;
    productSdk.setErase(eraseValue);
    return productSdk.getProductTransPrice();
  };

  /**
   * @todo 扫描C端小程序二维码
   */
  public onScanMember = () => {
    Taro.scanCode({ onlyFromCamera: true })
      .then(async barcode => {
        Taro.showLoading();
        const memberPhone = barcode.result;
        const result = await memberService.memberDetailByPreciseInfo({
          identity: memberPhone
        });
        invariant(result.code === ResponseCode.success, "会员登录失败");
        /**
         * @param {selectMember} 选择的会员
         *
         * @param {memberPerference} 会员的消费偏好
         * @param {memberOrderInfo} 会员的消费信息
         */
        let selectMember: SelectMember = merge({}, result.data);
        const memberPerference = await memberService.memberPreference({
          id: result.data.id
        });
        if (memberPerference.code === ResponseCode.success) {
          selectMember.perference = memberPerference.data;
        }

        const memberOrderInfo = await memberService.memberOrderInfo({
          id: result.data.id
        });
        if (memberOrderInfo.code === ResponseCode.success) {
          selectMember.orderInfo = memberOrderInfo.data;
        }

        const memberCoupons = await merchantService.getMemberCoupons({
          phone: selectMember.phoneNumber
        });
        if (memberCoupons.code === ResponseCode.success) {
          selectMember.couponList = memberCoupons.data.rows;
        }

        const memberr = await memberAction.getMemberLevelInfo(result.data.id);
        console.log("memberr: ", memberr);

        Taro.hideLoading();
        productSdk.setMember(selectMember);
        Taro.showToast({ title: "登录成功" });
        /**
         * @todo [目前重新设置会员之后重置抹零]
         */
        productSdk.setErase(undefined);
        this.setState(
          {
            selectMember,
            memberModal: false,
            eraseValue: "",
            receiveValue: "",
            receiveDiscount: ""
          },
          () => {
            this.setCoupons();
          }
        );
      })
      .catch(error => {
        Taro.showToast({
          title: error.message,
          icon: "none"
        });
      });
  };

  /**
   * @time 0318
   * @todo [设置优惠券token为true时请求，为false时清空]
   */
  public setCoupons = async () => {
    const { selectMember } = this.state;
    const { productCartList } = this.props;
    if (!!selectMember) {
      /**
       * @time 0318
       * @todo [设置会员之后自动搜索该会员的优惠券有则显示]
       */
      const coupons = await merchantAction.couponList({
        phone: selectMember && selectMember.phoneNumber,
        amount: productSdk.getProductMemberPrice(),
        productIds: productCartList.map(item => item.id)
      });
      if (coupons.code !== ResponseCode.success) {
        /**
         * @todo [如果没有优惠券则清空]
         */
        merchantAction.emptyCoupon();
      }
    } else {
      merchantAction.emptyCoupon();
    }
  };

  public cancelMember = () => {
    productSdk.setMember(undefined);
    productSdk.setErase(undefined);
    this.setState(
      {
        memberLayout: false,
        selectMember: undefined,
        memberModal: false,
        eraseValue: "",
        receiveValue: "",
        receiveDiscount: ""
      },
      () => {
        this.setCoupons();
      }
    );
  };

  public changeMember = () => {
    this.changeModalVisible("memberLayout", false);
    this.changeModalVisible("memberModal", true);
  };

  public onSearchMember = async () => {
    try {
      const { memberValue } = this.state;
      if (memberValue === "") {
        return;
      }
      Taro.showLoading();
      const result = await memberService.memberDetailByPreciseInfo({
        identity: memberValue
      });
      invariant(
        result.code === ResponseCode.success,
        result.msg || ResponseCode.error
      );

      if (result.data === undefined) {
        Taro.hideLoading();
        Taro.showModal({
          title: "提示",
          content: `没有找到会员${memberValue}，是否新增？`,
          success: ({ confirm }) => {
            if (confirm) {
              const params = {
                phoneNumber: memberValue,
                needCallback: true
              };
              // 用户点击了确定
              Taro.navigateTo({
                url: `/pages/member/member.add?params=${JSON.stringify(params)}`
              });
            }
          }
        });
        return;
      }

      /**
       * @param {selectMember} 选择的会员
       *
       * @param {memberPerference} 会员的消费偏好
       * @param {memberOrderInfo} 会员的消费信息
       */
      let selectMember: SelectMember = merge({}, result.data);
      const memberPerference = await memberService.memberPreference({
        id: result.data.id
      });
      if (memberPerference.code === ResponseCode.success) {
        selectMember.perference = memberPerference.data;
      }

      const memberOrderInfo = await memberService.memberOrderInfo({
        id: result.data.id
      });
      if (memberOrderInfo.code === ResponseCode.success) {
        selectMember.orderInfo = memberOrderInfo.data;
      }

      const memberCoupons = await merchantService.getMemberCoupons({
        phone: selectMember.phoneNumber
      });
      if (memberCoupons.code === ResponseCode.success) {
        selectMember.couponList = memberCoupons.data.rows;
      }

      const memberr = await memberAction.getMemberLevelInfo(result.data.id);
      console.log("memberr: ", memberr);

      Taro.hideLoading();
      productSdk.setMember(selectMember);
      /**
       * @todo [目前重新设置会员之后重置抹零]
       */
      productSdk.setErase(undefined);
      this.setState(
        {
          selectMember,
          memberModal: false,
          eraseValue: "",
          receiveValue: "",
          receiveDiscount: ""
        },
        () => {
          this.setCoupons();
        }
      );
    } catch (error) {
      Taro.showLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
      this.changeModalVisible("memberModal", false);
    }
  };

  public onPayHandle = async () => {
    try {
      Taro.showLoading();
      const { eraseValue } = this.state;
      if (eraseValue !== "") {
        productSdk.setErase(eraseValue);
      }
      const payload = productSdk.getProductInterfacePayload();
      const result = await productSdk.cashierPay(payload);
      invariant(
        result.code === ResponseCode.success,
        result.msg || ResponseCode.error
      );
      Taro.hideLoading();

      const payReceive: PayReducer.PayReceive = {
        transPayload: payload,
        transResult: result.data
      };
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_DETAIL,
        payload: { payReceive }
      });
      /**
       * @todo 调用支付接口成功后把抹零和会员都清除
       * @time 0318
       * @todo [成功之后reset所有state]
       */
      productSdk.setErase(undefined);
      productSdk.setMember(undefined);
      productSdk.setCoupon(undefined);
      productSdk.setPoint(undefined);
      merchantAction.selectCoupon(undefined);
      Taro.navigateTo({
        url: `/pages/pay/pay.receive`
      });
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
      <View className="container">
        <View className={`${cssPrefix}-pay-container ${cssPrefix}-pay`}>
          {this.renderListDetail()}
          {this.renderListProductCard()}
        </View>
        {this.renderFooter()}
        {this.renderEraseModal()}
        {this.renderMemberModal()}
        {this.renderMemberLayout()}
      </View>
    );
  }

  private renderMemberLayout = () => {
    const { memberLayout, selectMember } = this.state;

    return (
      <MemberModal
        selectMember={selectMember as any}
        visible={memberLayout}
        buttons={[
          {
            title: "取消选择",
            type: "cancel",
            onPress: () => this.cancelMember()
          },
          {
            title: "更换会员",
            type: "confirm",
            onPress: () => this.changeMember()
          }
        ]}
        onClose={() => this.changeModalVisible("memberLayout", false)}
      />
    );
  };

  private setNumber = (num: number | string): string => {
    return numeral(num).format("0.00");
  };

  private renderMemberModal = () => {
    const { memberModal, memberValue } = this.state;
    const buttons = [
      {
        title: "取消",
        type: "cancel",
        onPress: () => {
          this.onChangeValue("memberModal", "");
          this.changeModalVisible("memberModal", false);
        }
      },
      {
        title: "确定",
        type: "confirm",
        onPress: () => this.onSearchMember()
      }
    ];
    return (
      <Modal
        onClose={() => this.changeModalVisible("memberModal", false)}
        isOpened={memberModal}
        buttons={buttons}
        header="选择会员"
      >
        <View className={`product-detail-modal`}>
          <View className={`${cssPrefix}-pay-member-input`}>
            <Input
              className={`${cssPrefix}-pay-member-input-box`}
              placeholder="请输入会员卡号、手机号"
              value={memberValue}
              type="number"
              placeholderClass={`${cssPrefix}-pay-member-input-place`}
              onInput={({ detail: { value } }) =>
                this.onChangeValue("memberValue", value)
              }
            />

            <View
              className={`${cssPrefix}-pay-member-input-icon`}
              style={`background-image: url(//net.huanmusic.com/weapp/icon_commodity_scan.png)`}
              onClick={() => this.onScanMember()}
            />
          </View>
        </View>
      </Modal>
    );
  };

  private renderEraseModal = () => {
    const { eraseModal, receiveValue, receiveDiscount } = this.state;
    const receivePrice = productSdk.getProductTransPrice(false);

    const eraseButtons = [
      {
        title: "取消",
        type: "cancel",
        onPress: () => {
          // this.onChangeValue('eraseValue', '');
          this.changeModalVisible("eraseModal", false);
        }
      },
      {
        title: "确定",
        type: "confirm",
        onPress: () => {
          const currentDiscount = numeral(receiveDiscount).value();
          if (currentDiscount > 100) {
            return;
          }

          if (numeral(receiveValue).value() <= 0) {
            Taro.showToast({
              title: "金额超过限制",
              icon: "none"
            });
            return;
          }

          this.changeModalVisible("eraseModal", false);
        }
      }
    ];
    const eraseInputs: ModalInput[] = [
      {
        title: "应收金额",
        value: receiveValue,
        type: "digit",
        prefix: "￥",
        onInput: ({ detail: { value } }) =>
          this.onChangeReceive("receiveValue", value),
        placeholder: `${this.setNumber(receivePrice)}`
        // focus: true,
      },
      {
        title: "整单折扣",
        type: "digit",
        endfix: "%",
        value: receiveDiscount,
        onInput: ({ detail: { value } }) =>
          this.onChangeReceive("receiveDiscount", value),
        placeholder: "100"
      }
    ];
    return (
      <Modal
        onClose={() => this.changeModalVisible("eraseModal", false)}
        isOpened={eraseModal}
        buttons={eraseButtons}
        header="整单优惠"
        tip={`当前金额：￥${this.setNumber(receivePrice)}`}
        inputs={eraseInputs}
      />
    );
  };

  private renderListProductCard = () => {
    const { selectMember } = this.state;
    const { productCartList } = this.props;
    return (
      <ProductPayListView
        productList={productCartList}
        selectMember={selectMember}
      />
    );
  };

  private renderListDetail = () => {
    const { selectMember, eraseValue, selectCoupon, usePoint } = this.state;
    const { couponList } = this.props;

    const priceForm: FormRowProps[] = [
      {
        title: "应收金额",
        extraText: `￥${this.setNumber(
          numeral(productSdk.getProductTransPrice()).value()
        )}`,
        extraTextColor: "#333333",
        extraTextBold: "bold",
        extraTextSize: "36",
        hasBorder: false
      }
    ];

    const totalActivityMoney = productSdk.getProductTotalActivityPrice();

    const formCard: FormRowProps[] = [
      {
        title: "商品数量",
        extraText: `${productSdk.getProductNumber()}`
      },
      {
        title: "原价金额",
        extraText: `￥${this.setNumber(
          numeral(productSdk.getProductsOriginPrice()).value()
        )}`
      }
    ];

    if (
      productSdk.getProductsOriginPrice() -
        productSdk.getProductMemberPrice() !==
      0
    ) {
      formCard.push({
        title: "商品优惠",
        extraText: `${
          productSdk.getProductsOriginPrice() -
            productSdk.getProductMemberPrice() !==
          0
            ? `${
                productSdk.getProductsOriginPrice() -
                  productSdk.getProductMemberPrice() >
                0
                  ? "-"
                  : "+"
              } ￥${this.setNumber(
                Math.abs(
                  productSdk.getProductsOriginPrice() -
                    productSdk.getProductMemberPrice()
                )
              )}`
            : "￥0.00"
        }`,
        extraTextStyle: "price"
      });
    }

    if (eraseValue !== "") {
      formCard.push({
        onClick: () => {},
        arrow: undefined,
        title: "整单优惠",
        extraText: `${
          eraseValue !== "" ? `- ￥${this.setNumber(eraseValue)}` : "￥0.00"
        }`,
        extraTextStyle: "price"
      });
    }

    formCard.push({
      title: "优惠券",
      extraText: `${
        !!selectCoupon && selectCoupon.id
          ? `-￥${numeral(
              selectCoupon.couponVO && selectCoupon.couponVO.discount
            ).format("0.00")}`
          : ""
      }`,
      extraTextStyle: "price",
      isCoupon: true,
      coupons: couponList,
      arrow: "right",
      onClick: () => {
        Taro.navigateTo({
          url: `/pages/pay/pay.coupon?entry=product.pay${
            !!selectMember ? `&phone=${selectMember.phoneNumber}` : ""
          }${!!selectCoupon ? `&selectId=${selectCoupon.id}` : ""}`
        });
      }
    });
    // console.log("totalActivityMoney", totalActivityMoney);
    if (totalActivityMoney !== 0) {
      formCard.push({
        title: "满减优惠",
        extraText: `${
          !!totalActivityMoney
            ? `- ￥${this.setNumber(totalActivityMoney)}`
            : "￥0.00"
        }`,
        extraTextStyle: "price"
      });
    }

    formCard.map((item, index) => {
      if (index !== formCard.length - 1) {
        return {
          ...item,
          hasBorder: true
        };
      }
      return {
        ...item,
        hasBorder: false
      };
    });

    const point: any = productSdk.getPointPrice();

    return (
      <View className={`${cssPrefix}-pay-pos`}>
        <FormCard items={priceForm} />
        <FormCard items={formCard}>
          {selectMember && !!point.pointPrice && (
            <View
              className={`${cssPrefix}-row ${cssPrefix}-content-item ${cssPrefix}-pay-item`}
              onClick={() => this.setPoint()}
            >
              <View
                className={`${cssPrefix}-pay-title  ${cssPrefix}-pay-item-box`}
              >
                {`积分抵现 `}
                <View className={`${cssPrefix}-pay-text`}>
                  {` (${Math.ceil(point.pointPrice / point.deductRate)}积分)`}
                </View>
              </View>
              <View
                className={`${cssPrefix}-row-price ${cssPrefix}-pay-item-box`}
              >
                -￥{numeral(point.pointPrice).format("0.00")}
                {!usePoint ? (
                  <View
                    className={`order-refund-title-icon`}
                    style="background-image: url(//net.huanmusic.com/weapp/bt_normal.png); margin-left: 5px"
                  />
                ) : (
                  <View
                    className={`order-refund-title-icon`}
                    style="background-image: url(//net.huanmusic.com/weapp/bt_selected.png); margin-left: 5px"
                  />
                )}
              </View>
            </View>
          )}
        </FormCard>
      </View>
    );
  };

  private renderFooter = () => {
    const { productCartList } = this.props;
    const { eraseValue, selectMember } = this.state;
    return (
      <View className={`${cssPrefix}-pay-footer`}>
        <View className={`${cssPrefix}-pay-footer-bg`}>
          <View className={`${cssPrefix}-pay-footer-left`}>
            <View
              className="cart-suspension-left-item"
              onClick={() => {
                if (selectMember !== undefined) {
                  this.changeModalVisible("memberLayout", true);
                } else {
                  this.changeModalVisible("memberModal", true);
                }
              }}
            >
              <Image
                src="//net.huanmusic.com/weapp/icon_member.png"
                className={`${cssPrefix}-pay-footer-left-item-icon`}
              />
              <Text className="cart-suspension-left-item-text">
                {`${(selectMember &&
                  (selectMember as MemberInterface.MemberInfo).username) ||
                  "会员"}`}
              </Text>
            </View>
            <View
              className="cart-suspension-left-item"
              onClick={() => this.changeModalVisible("eraseModal", true)}
            >
              <Image
                src="//net.huanmusic.com/weapp/icon_molin.png"
                className={`${cssPrefix}-pay-footer-left-item-erase`}
              />
              <Text className="cart-suspension-left-item-text">
                {eraseValue === "" ? "改价" : "已改价"}
              </Text>
            </View>
          </View>
          <View
            className={classnames(`${cssPrefix}-pay-footer-right`, {
              [`${cssPrefix}-pay-footer-right-active`]:
                productCartList.length > 0,
              [`${cssPrefix}-pay-footer-right-disabled`]:
                productCartList.length === 0
            })}
            onClick={() => this.onPayHandle()}
          >
            收款￥{this.setNumber(numeral(this.getTransValue()).value())}
          </View>
        </View>
      </View>
    );
  };
}

const select = (state: AppReducer.AppState) => ({
  productCartList: getProductCartList(state),
  addSelectMember: getSelectMember(state),
  selectCoupon: getSelectCoupon(state),
  couponList: getCouponList(state)
});

export default connect(select)(ProductPay as any);
