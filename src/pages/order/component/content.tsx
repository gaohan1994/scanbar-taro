import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import '../index.less';
import numeral from 'numeral';
import { OrderInterface } from 'src/constants';
import classnames from 'classnames';
import dayJs from 'dayjs';
import { OrderAction } from '../../../actions';
const cssPrefix = 'order-detail';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

class OrderComponent extends Taro.Component<Props> {

  render () {
    const { orderDetail } = this.props;
    const { order } = orderDetail;
    const items: any[] = order && [
      {
        title: '订单号码',
        extraText: `${order.orderNo}`,
      },
      {
        title: '创建时间',
        extraText: `${dayJs(order.createTime || '').format('YYYY/MM/DD HH:mm')}`,
      },
      {
        title: '付款时间',
        extraText: `${dayJs(order.transTime || '').format('YYYY/MM/DD HH:mm')}`,
      },
      {
        title: '支付方式',
        extraText: `${OrderAction.orderPayType(orderDetail)}支付`,
        border: false,
      },
    ];
    return (
      <View>
        <View className={`${cssPrefix}-card ${cssPrefix}-card-order`} style='margin-bottom: 0px'>
          {
            items && items.length > 0 && items.map((item) => {
              return (
                <View
                  key={item.title}
                  className={classnames(`${cssPrefix}-card-order-item`, {
                    [`${cssPrefix}-card-order-item-border`]: !(item.border === false)
                  })}
                >
                  <Text className={`${cssPrefix}-card-order-item-title`}>
                    {item.title}
                  </Text>
                  <Text className={`${cssPrefix}-card-order-item-content`}>
                    {item.extraText}
                  </Text>
                </View>
              );
            })
          }
        </View>
        
        {orderDetail.refundOrderList && (
          <View className={`${cssPrefix}-card ${cssPrefix}-card-order`} style='margin-bottom: 0px'>
            {orderDetail.refundOrderList.map((item, index) => {
              return (
                <View
                  key={`d${index}`}
                  className={classnames(`${cssPrefix}-card-order-item`, {
                    [`${cssPrefix}-card-order-item-border`]: !((index + 1) === (orderDetail.refundOrderList as any).length)
                  })}
                  onClick={() => {
                    Taro.navigateTo({
                      url: `/pages/order/order.online?id=${item.orderNo}`
                    });
                  }}
                >
                  <View className={`${cssPrefix}-card-order-item-box`}>
                    <Text className={`${cssPrefix}-card-order-item-refund`}>
                      退货订单
                    </Text>
                    <Text className={`${cssPrefix}-card-order-item-time`}>
                      {dayJs(item.createTime).format('YYYY/MM/DD MM:ss')}
                    </Text>
                  </View>
                  <View className={`${cssPrefix}-card-order-item-content`} style="color: #FC4E44;">
                    {`￥${numeral(item.transAmount).format('0.00')}`}

                    <View className={`${cssPrefix}-card-order-item-content-arrow`} />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  }
}

export default OrderComponent;