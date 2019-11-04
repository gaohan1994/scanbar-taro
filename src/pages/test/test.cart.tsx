import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import CartBar from '../../component/cart/cart';

export class TestCart extends Taro.Component {
  render () {
    return (
      <View>
        <CartBar />
      </View>
    );
  }
}