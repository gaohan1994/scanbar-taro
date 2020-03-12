import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.less';
import numeral from 'numeral';
import { CartItem } from '../order.refund';

const prefix = 'component-order-product';

type Props = {
  
};

class OrderComponent extends Taro.Component<Props> {

  render () {
    return (
      <View className={`${prefix}-footer`}>
        {this.renderUser()}
        {this.props.children}
      </View>
    );
  }

  private renderUser = () => {
    return (
      <View className={`${prefix}-`}>
        
      </View>
    );
  }
}

export default OrderComponent;