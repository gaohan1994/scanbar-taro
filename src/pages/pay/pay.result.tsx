import Taro, { Config } from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import "../style/pay.less";
import { AtButton, AtActivityIndicator } from 'taro-ui';
import { connect } from '@tarojs/redux';
import { getPayReceive } from '../../reducers/app.pay';
import { PayReducer } from '../../reducers/app.pay';
import { ProductCartInterface } from 'src/common/sdk/product/product.sdk';

const cssPrefix = 'pay';

interface Props { 
  payDetail: PayReducer.PayReceive;
  isOrder: boolean;
}

interface State { 
  status: boolean; // 支付成功还是失败
  loading: boolean;
  time: number;
}

class PayResult extends Taro.Component<Props, State> {
  
  readonly state: State = {
    status: false,
    loading: true,
    time: 5000,
  };

  config: Config = {
    navigationBarTitleText: '收款'
  };

  private timer: any;

  async componentDidShow () {
    const { params } = this.$router.params;
    if (params) {
      const { status } = JSON.parse(params);
      this.setState({ 
        status,
        loading: false,
      });
      if (status === true) {
        // 成功设置计时器
        this.timer = setInterval(() => {
          this.setWaitTimer(this.state.time - 1000);
        }, 1000);
      }
    }
  }

  public setWaitTimer = (time: number) => {
    if (time < 0) {
      clearInterval(this.timer);
      this.onNavHandle();
    } else {
      this.setState({ time });
    }
  }

  componentWillUnmount () {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  public onNavHandle = () => {
    const { isOrder } = this.props;
    if (isOrder) {
      Taro.navigateBack({delta: 2});
      return;
    }
    Taro.navigateBack();
  }

  public reReceive = () => {
    const { params } = this.$router.params;
    const { entry } = JSON.parse(params);
    if (entry === 'pay.receive') {
      Taro.navigateBack({});
      return;
    }
    Taro.redirectTo({
      url: `/pages/product/product.pay`
    });
  }

  render () {
    const { loading, status, time } = this.state;
    const { isOrder, payDetail } = this.props;
    return (
      <View className="container">
        {
          loading ? (
            <AtActivityIndicator mode="center" />
          ) : 
            status ? (
              <View className={`${cssPrefix}-result-container`}>
                <Image 
                  src="//net.huanmusic.com/weapp/img_payment_success.png"
                  className={`${cssPrefix}-result-container-image`} 
                />
                <View className={`${cssPrefix}-result-container-title`}>
                  {payDetail && payDetail.transPayload && payDetail.transPayload.flag ? '现金' : '微信'}收款成功
                </View>
                <View className={`${cssPrefix}-result-container-title ${cssPrefix}-result-container-title-bold`}>
                  {`￥ ${(payDetail.transPayload as ProductCartInterface.ProductPayPayload).order.transAmount}`}
                </View>
                <View className={`${cssPrefix}-result-container-button`}>
                  <AtButton
                    className="theme-button"
                    onClick={() => this.onNavHandle()}
                  >
                    {isOrder === true ? `继续开单（${time / 1000}秒）` : `继续收款（${time / 1000}秒）`}
                  </AtButton>
                </View>
              </View>
            ) : (
              <View className={`${cssPrefix}-result-container`}>
                <Image 
                  src="//net.huanmusic.com/weapp/img_payment_success.png"
                  className={`${cssPrefix}-result-container-image`} 
                />
                <View className={`${cssPrefix}-result-container-title`}>Sorry ~</View>
                <View className={`${cssPrefix}-result-container-title ${cssPrefix}-result-container-title-bold`}>
                  {payDetail && payDetail.transPayload && payDetail.transPayload.flag ? '现金' : '微信'}收款失败
                </View>
                <View className={`${cssPrefix}-result-container-button`}>
                  <AtButton
                    className="theme-button"
                    onClick={() => this.reReceive()}
                  >
                    重新收款
                  </AtButton>
                </View>
              </View>
            )
        }
      </View>
    );
  }
}

const select = (state: any) => {
  const payDetail = getPayReceive(state);
  let isOrder: boolean = true;
  if (payDetail.transPayload !== undefined && payDetail.transResult !== undefined) {
    if (payDetail.transPayload.productInfoList.length === 0) {
      isOrder = false;
    }
  }
  return {
    payDetail,
    isOrder,
  };
};

export default connect(select)(PayResult);