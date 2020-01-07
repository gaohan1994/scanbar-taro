import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import './order.less';
import { OrderInterface } from '../../constants';
import numeral from 'numeral';
import dayJs from 'dayjs';

const cssPrefix = 'component-order-item';

type Props = {
  data: OrderInterface.OrderDetail;
};
type State = {};

class OrderItem extends Taro.Component<Props, State> {

  static defaultProps = {
    data: {}
  };

  public onClickOrder = (order: OrderInterface.OrderDetail) => {
    Taro.navigateTo({url: `/pages/order/order.detail?id=${order.order.orderNo}`});
  }

  render () {
    const { data } = this.props;
    return (
      <View 
        className={`${cssPrefix}`}
        onClick={() => this.onClickOrder(data)}
      >
        {data.order && (
          <View className={`${cssPrefix}-left`}>
            <View className={`${cssPrefix}-left-detail`}>
              <View className={`${cssPrefix}-no`}>{`${data.order.orderNo}`}</View>
              <View className={`${cssPrefix}-time`}>{`${dayJs(data.order.transTime).format('HH:mm:ss')}`}</View>
            </View>
          </View>
        )}
        
        <View className={`${cssPrefix}-right`}>
          <View className={`${cssPrefix}-price`}>{`￥ ${numeral(data.order && data.order.transAmount || 0).format('0.00')}`}</View>
        </View>
      </View>
    );
  }
}

export default OrderItem;