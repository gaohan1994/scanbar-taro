import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './order.online.less';
import { OrderInterface, ResponseCode } from '../../constants';
import numeral from 'numeral';
import dayJs from 'dayjs';
import { OrderAction, ProductAction } from '../../actions';
import classnames from 'classnames'
import invariant from 'invariant';
import productSdk from '../../common/sdk/product/product.sdk';
import orderAction from '../../actions/order.action';

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

  public orderCancle = async (order: OrderInterface.OrderInfo) => {
    const { currentType } = this.props;
    const { orderNo } = order;
    const payload = {
      orderNo: orderNo
    }
    try {
      const res = await OrderAction.orderCancle(payload);
      invariant(res.code === ResponseCode.success, '取消订单失败');
      Taro.showToast({
        title: '取消订单成功',
        icon: 'success'
      });
      OrderAction.orderList({ pageNum: 1, pageSize: 20, ...orderAction.getFetchType(currentType) });
      OrderAction.orderCount();
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onPay = async (order: OrderInterface.OrderInfo) => {
    const { orderNo } = order;
    const payment = await productSdk.requestPayment(orderNo)
    console.log('payment: ', payment)
    if (payment.code === ResponseCode.success) {
      Taro.navigateTo({
        url: `/pages/order/order.detail?id=${orderNo}`
      })
    } else {
      Taro.showToast({
        title: payment.msg,
        icon: 'none'
      });
    }
  }

  public orderOneMore = async (order: OrderInterface.OrderDetail) => {
    const { orderDetailList } = order;
    if (orderDetailList && orderDetailList.length > 0) {
      for (let i = 0; i < orderDetailList.length; i++) {
        const res = await ProductAction.productInfoDetail({ id: orderDetailList[i].productId });
        if (res.code === ResponseCode.success) {
          productSdk.manage({
            type: productSdk.productCartManageType.ADD,
            product: res.data,
            num: orderDetailList[i].num,
          });
          setTimeout(() => {
            Taro.switchTab({
              url: `/pages/cart/cart`
            });
          }, 1000);
        } else {
          if (res.msg) {
            Taro.showToast({
              title: res.msg,
              icon: 'none'
            });
          } else {
            Taro.showToast({
              title: '获取商品失败',
              icon: 'none'
            });
          }
        }
      }
    }
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
          <View className={`${cssPrefix}-card-header-text`}>
            {res.title}
          </View>
          <View
            className={classnames(`${cssPrefix}-card-status`, {
              [`${cssPrefix}-card-status-red`]: res.id === 0,
              [`${cssPrefix}-card-status-orange`]: res.id === '待收货' || res.title === '待自提',
              [`${cssPrefix}-card-status-blue`]: res.title === '已退货',
            })}
          >
            <View className={`${cssPrefix}-card-header-text-time`}>
              {dayJs(order.createTime).format('YYYY-MM-DD HH:MM') || ''}
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