import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './order.online.less';
import { OrderInterface, ResponseCode } from '../../constants';
import numeral from 'numeral';
import dayJs from 'dayjs';
import { OrderAction, ProductAction } from '../../actions';
import classnames from 'classnames';

const cssPrefix = 'component-order-item';

type Props = {
  data: OrderInterface.OrderDetail;
  orderAllStatus: any[];
  currentType?: number;
};
type State = {};

class OrderItem extends Taro.Component<Props, State> {

  static defaultProps = {
    data: {}
  };

  public onClickOrder = (order: OrderInterface.OrderDetail) => {
    Taro.navigateTo({
      url: `/pages/order/order.online?id=${order.orderNo}`
    });
  }

  public renderPrice = (num: number) => {
    const price = num ? numeral(num).format('0.00') : '0.00';
    return (
      <Text className={`${cssPrefix}-price`}>
        <Text>￥</Text>
        <Text className={`${cssPrefix}-price-integer`}>{price.split('.')[0]}</Text>
        <Text>{`.${price.split('.')[1]}`}</Text>
      </Text>
    );
  }

  render() {
    const { data, orderAllStatus } = this.props;
    const { order, orderDetailList } = data;
    const res = OrderAction.orderStatus(orderAllStatus, data);
    // const res: any = {title: '待支付'};
    let products: any[] = [];

    if (orderDetailList && orderDetailList.length > 3) {
      products = orderDetailList.slice(0, 3);
    } else if (orderDetailList) {
      products = orderDetailList;
    }

    return (
      <View className={`${cssPrefix}-card`}>
        <View className={`${cssPrefix}-card-header`}>
          <View 
            className={classnames(`${cssPrefix}-card-header-text`, {
              [`${cssPrefix}-card-status-red`]: res.id === 10 || res.id === 12 || res.id === 11,
              [`${cssPrefix}-card-status-orange`]: res.id === 8 || res.id === 5 || res.id === 13,
            })}
          >
            {res.title}
          </View>
          <View className={classnames(`${cssPrefix}-card-status`)} >
            <View className={`${cssPrefix}-card-header-text-time`}>
              {dayJs(order.createTime).format('YYYY-MM-DD HH:mm') || ''}
            </View>
          </View>
        </View>

        <View 
          className={`${cssPrefix}-card-center`} 
          onClick={() => { this.onClickOrder(data); }}
        >
          <View className={`${cssPrefix}-card-center-products`}>
            {
              products.map((product, index) => {
                return (
                  <View 
                    key={`p${index}`}
                    className={`${cssPrefix}-card-center-product`}
                  >
                    {
                      product.picUrl && product.picUrl.length > 0
                        ? (
                          <View
                            className={`${cssPrefix}-card-center-product-pic`}
                            style={`background-image: url(${product.picUrl})`}
                          />
                        )
                        : (
                          <View
                            className={`${cssPrefix}-card-center-product-pic`}
                          />
                        )
                    }

                    <Text className={`${cssPrefix}-card-center-product-text`}>
                      {product.productName}
                    </Text>
                  </View>
                )
              })
            }
          </View>

          <View className={`${cssPrefix}-card-center-info`}>
            {order && order.transAmount !== undefined ? this.renderPrice(order.transAmount) : this.renderPrice(0)}
            <Text className={`${cssPrefix}-card-center-info-total`}>共{order.totalNum}件</Text>
          </View>
        </View>
        <View className={`${cssPrefix}-card-button`}>
          <View
            className={`${cssPrefix}-card-button-common ${cssPrefix}-card-button-again`}
            onClick={() => { 
              Taro.navigateTo({
                url: `/pages/order/order.online?id=${order.orderNo}`
              });
            }}
          >
            查看详情
          </View>
        </View>
      </View>
    );

  }
}

export default OrderItem;