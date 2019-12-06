import Taro from '@tarojs/taro';
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
}

class PayResult extends Taro.Component<Props, State> {

  readonly state: State = {
    status: false,
    loading: true
  };

  async componentDidShow () {
    const { params } = this.$router.params;
    if (params) {
      const { status } = JSON.parse(params);
      this.setState({ 
        status,
        loading: false,
      });
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
    const {  } = this.props;
    Taro.showToast({
      title: 'rereceive'
    });
  }

  render () {
    const { loading, status } = this.state;
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
                <View className={`${cssPrefix}-result-container-title`}>微信收款成功</View>
                <View className={`${cssPrefix}-result-container-title`}>
                  {`￥ ${(payDetail.transPayload as ProductCartInterface.ProductPayPayload).order.transAmount}`}
                </View>
                <View className={`${cssPrefix}-result-container-button`}>
                  <AtButton
                    className="theme-button"
                    onClick={() => this.onNavHandle()}
                  >
                    {
                      isOrder === true ? '继续开单' : '继续收款'
                    }
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
                <View className={`${cssPrefix}-result-container-title`}>微信收款失败</View>
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