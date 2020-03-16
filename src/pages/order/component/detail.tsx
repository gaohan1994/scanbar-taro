import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.less';
import numeral from 'numeral';
import { CartItem } from '../order.refund';
import { OrderInterface } from 'src/constants';

const prefix = 'component-order-product';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

class OrderComponent extends Taro.Component<Props> {

  render () {
    const { orderDetail } = this.props;

    /**
     * @todo [isDelivery] true是自提
     */
    const isDelivery = orderDetail && orderDetail.order && orderDetail.order.deliveryType === 0;

    return (
      <View className={`${prefix}-detail`}>
        <View className={`${prefix}-detail-item`}> 
          <View 
            className={`${prefix}-detail-icon`} 
            style='background-image: url(//net.huanmusic.com/weapp/icon_order_note.png)'
          />
          <View className={`${prefix}-detail-box`}>
            <View className={`${prefix}-detail-text`}>订单备注</View>
            <View className={`${prefix}-detail-title ${prefix}-detail-mar`}>{orderDetail.order && orderDetail.order.remark || '无备注'}</View>
          </View>
        </View>
        <View className={`${prefix}-detail-item`}> 
          <View 
            className={`${prefix}-detail-icon`} 
            style='background-image: url(//net.huanmusic.com/weapp/icon_order_time.png)'
          />
          <View className={`${prefix}-detail-box`}>
            <View className={`${prefix}-detail-text`}>
              {`${!!isDelivery ? '自提时间' : '配送时间'}`}
            </View>
            <View className={`${prefix}-detail-title ${prefix}-detail-mar`}>{orderDetail.order && orderDetail.order.planDeliveryTime}</View>
          </View>
        </View>
        {!isDelivery && (
          <View className={`${prefix}-detail-item`}> 
            <View 
              className={`${prefix}-detail-icon`} 
              style='background-image: url(//net.huanmusic.com/weapp/icon_order_location.png)'
            />
            <View className={`${prefix}-detail-box`}>
              <View className={`${prefix}-detail-box-text ${prefix}-detail-title ${prefix}-detail-mar`}>
                {orderDetail.order && orderDetail.order.receiver}
                <View className={`${prefix}-detail-text ${prefix}-detail-mar-l`}>{orderDetail.order && orderDetail.order.receiverPhone}</View>
              </View>
              <View className={`${prefix}-detail-title ${prefix}-detail-mar`}>{orderDetail.order && orderDetail.order.address}</View>
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default OrderComponent;