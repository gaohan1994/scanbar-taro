/**
 * @Author: Ghan 
 * @Date: 2019-11-12 14:01:28 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-27 16:25:20
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "./style/pay.less";
import '../product/style/product.less';
import classnames from 'classnames';
import { AtActivityIndicator, AtButton } from 'taro-ui';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { getPayReceive, PayReducer } from '../../reducers/app.pay';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import getBaseUrl from '../../common/request/base.url';
import numeral from 'numeral';
import invariant from 'invariant';
import productSdk from '../../common/sdk/product/product.sdk';
import { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import { ResponseCode } from '../../constants/index';

const Items = [
  {
    title: '收款码',
    image: '//net.huanmusic.com/weapp/cash.png',
    tab: 'receive',
  },
  {
    title: '收款码',
    image: '//net.huanmusic.com/weapp/cash.png',
    tab: 'scan',
  },
  {
    title: '现金',
    image: '//net.huanmusic.com/weapp/cash.png',
    tab: 'cash'
  },
];

const cssPrefix = 'pay';

interface Props { 
  payDetail: PayReducer.PayReceive;
}
interface State { 
  tab: 'receive' | 'cash';
  receiveCash: string;
}

class PayReceive extends Taro.Component<Props, State> {

  static defaultProps: Props = {
    payDetail: {
      transPayload: undefined,
      transResult: undefined,
    }
  };
  
  readonly state: State = {
    tab: 'receive',
    receiveCash: '',
  };

  public onChangeCash = (value: string) => {
    this.setState({receiveCash: value});
  }

  /**
   * @todo [修改当前页面tab]
   *
   * @memberof PayReceive
   */
  public onChangeTab = (tab: 'receive' | 'cash') => {
    this.setState({ tab });
  }

  /**
   * @todo [点击tab事件]
   *
   * @memberof PayReceive
   */
  public onTabClick = (tab: any) => {
    if (tab === 'scan') {
      Taro.showToast({ title: '调用扫一扫' });
    } else {
      this.onChangeTab(tab);
    }
  }

  /**
   * @todo [选择现金收款点击确定事件]
   *
   * @memberof PayReceive
   */
  public onCashReceive = async () => {
    try {
      Taro.showLoading();
      const { payDetail } = this.props;
      invariant(payDetail.transPayload !== undefined, '参数设置错误');
      invariant(payDetail.transResult !== undefined, '参数设置错误');
      if (payDetail.transPayload !== undefined && payDetail.transResult !== undefined) {
        const payload: ProductCartInterface.ProductPayPayload = {
          ...payDetail.transPayload,
          order: {
            ...payDetail.transPayload.order,
            payType: 0,
            orderNo: payDetail.transResult.orderNo
          },
          transProp: false
        };
        const result = await productSdk.cashierPay(payload);
        Taro.hideLoading();
        invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
        Taro.showToast({
          title: '现金收款',
          icon: 'success'
        });
        setTimeout(() => {
          Taro.navigateTo({
            url: `/pages/pay/pay.result`
          });
        }, 500);
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    return (
      <View className={`container ${cssPrefix}-receive`}>
        <View className={`${cssPrefix}-receive-header`}>
          {
            Items.map((item) => {
              return (
                <View 
                  key={item.title} 
                  className={classnames(
                    `${cssPrefix}-receive-header-item`,
                    {
                      [`${cssPrefix}-receive-header-item-active`]: this.state.tab === item.tab
                    }
                  )} 
                  onClick={() => this.onTabClick(item.tab)}
                >
                  <Image src={item.image} className={`${cssPrefix}-receive-header-item-image`} />
                  <Text 
                    className={classnames(`${cssPrefix}-receive-header-item-text`)}
                  >
                    {item.title}
                  </Text>
                </View>
              );
            })
          }
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
    const { tab } = this.state;
    const { payDetail } = this.props;

    if (tab === 'receive') {
      return (
        <View className={`${cssPrefix}-receive-content`}>
          <View className={`${cssPrefix}-receive-content-code`}>
            {payDetail.transResult !== undefined ? (
              <Image 
                className={`${cssPrefix}-receive-content-code-image`}
                src={`${getBaseUrl('').replace('api', '')}${payDetail.transResult.codeUrl}`} 
              />
            ) : (
              <AtActivityIndicator mode='center' />
            )}
          </View>
          <Text className={`${cssPrefix}-receive-content-text`}>请用手机扫一扫二维码，进行付款</Text>
          {payDetail.transPayload !== undefined && (
            <View className={`${cssPrefix}-receive-content-price`}>￥{numeral(payDetail.transPayload.order.transAmount).format('0.00')}</View>
          )}
        </View>
      );
    } else if (tab === 'cash') {
      const { receiveCash } = this.state;
      const { payDetail } = this.props;
      if (payDetail.transPayload !== undefined) {
        const cashForm: FormRowProps[] = [
          {
            title: '应收金额',
            extraText: `￥${payDetail.transPayload.order.transAmount}`
          },
          {
            title: '找零金额',
            extraText: `￥${numeral(numeral(receiveCash).value() - numeral(payDetail.transPayload.order.transAmount).value()).format('0.00')}`
          },
          {
            title: '收款',
            isInput: true,
            inputValue: receiveCash,
            inputOnChange: this.onChangeCash
          }
        ];
        return (
          <View className={`${cssPrefix}-receive-content-cash`}>
            <FormCard items={cashForm} shadow={false} />
            <View className={`${cssPrefix}-receive-content-cash-button`}>
              <AtButton 
                className="theme-pay-button"
                onClick={this.onCashReceive}
              >
                确定
              </AtButton>
            </View>
          </View>
        );
      }
      return (
        <View/>
      );
    }
  }
}

const select = (state: AppReducer.AppState) => ({
  payDetail: getPayReceive(state),
});

export default connect(select)(PayReceive);