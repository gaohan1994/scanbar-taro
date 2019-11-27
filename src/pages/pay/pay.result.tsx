import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import "./style/pay.less";
import { AtButton } from 'taro-ui';

const cssPrefix = 'pay';

interface Props { }

interface State { }

class PayResult extends Taro.Component<Props, State> {

  public onNavHandle = () => {
    Taro.navigateTo({
      url: `/pages/product/product.order`
    });
  }

  render () {
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
              继续开单
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

export default PayResult;