import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.less';
import numeral from 'numeral';
import { CartItem } from '../order.refund';
import { OrderInterface } from 'src/constants';
import { OrderAction } from '../../../actions';

const prefix = 'component-order-product';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

class OrderComponent extends Taro.Component<Props> {

  public statusImage = (status: any) => {
    // bg_order_wait
    // bg_order_cancel
    switch (status.id) {
      case -1:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 0:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 1:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 2:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 3: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 4: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 5: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 6: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 7: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 8: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 9: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 10: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 13: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 12:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 11:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      default:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
    }
  }

  render () {
    const { orderDetail = {} } = this.props;
    const status = OrderAction.orderStatus([], orderDetail as any);
    return (
      <View>
        <View className={`${prefix}-status-bg`} />
        <View 
          className={`${prefix}-status-card`} 
          style={`${this.statusImage(status)}`}
        >
          <View className={`${prefix}-status-title`} >{status.title}</View>
          <View className={`${prefix}-status-tip`} >{status.detail}</View>
          <View className={`${prefix}-status-button`}>联系买家</View>
        </View>
      </View>
    );
  }
}

export default OrderComponent;