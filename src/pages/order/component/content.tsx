import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import '../index.less';
import numeral from 'numeral';
import { CartItem } from '../order.refund';
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
      },
    ];
    return (
      <View className={`${cssPrefix}-card ${cssPrefix}-card-order`}>
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
    );
  }
}

export default OrderComponent;