import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import "./style/pay.less";
import { AtButton } from 'taro-ui';
import { connect } from '@tarojs/redux';
import { getPayReceive } from '../../reducers/app.pay';
import { PayReducer } from '../../reducers/app.pay';

const cssPrefix = 'pay';

interface Props { 
  payDetail: PayReducer.PayReceive;
  isOrder: boolean;
}

interface State { }

class PayResult extends Taro.Component<Props, State> {

  public onNavHandle = () => {
    const { isOrder } = this.props;
    const navUrl = isOrder === true
      ? '/pages/product/product.order'
      : '/pages/pay/pay.input';
    Taro.redirectTo({
      url: navUrl
    });
  }

  render () {
    const { isOrder } = this.props;
    return (
      <View className="container">
        <View className={`${cssPrefix}-result-container`}>
          <Image 
            src="//net.huanmusic.com/weapp/img_payment_success.png"
            className={`${cssPrefix}-result-container-image`} 
          />
          <View className={`${cssPrefix}-result-container-title`}>微信收款成功</View>
          <View className={`${cssPrefix}-result-container-price`}>￥26.50</View>
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