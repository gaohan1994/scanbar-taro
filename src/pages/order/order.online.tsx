/**
 * @todo [共12种状态]
 * 
 * @Author: Ghan 
 * @Date: 2020-03-10 15:29:23 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-18 17:56:15
 */
import Taro, { Config } from '@tarojs/taro';
import { View, ScrollView } from '@tarojs/components';
import { AtActivityIndicator } from 'taro-ui';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import "../style/order.less";
import "../style/product.less";
import { OrderAction } from '../../actions';
import invariant from 'invariant';
import { ResponseCode, OrderInterface, OrderService } from '../../constants/index';
import { getOrderDetail } from '../../reducers/app.order';
import ProductPayListView from './component/list';
import ButtonFooter from '../../component/button/button.footer';
import OrderStatus from './component/status';
import OrderDetail from './component/detail';
import OrderContent from './component/content';

const cssPrefix = 'order';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

type State = {
  loading: boolean;
}

class OrderOnline extends Taro.Component<Props> {
  config: Config = {
    navigationBarTitleText: '订单详情'
  };

  state: State = {
    loading: false
  };

  componentDidShow() {
    try {
      const { params: { id } } = this.$router;
      invariant(!!id, '请传入订单id');
      this.init(id);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public orderSend = async () => {
    try {
      const { orderDetail } = this.props;
      const { orderNo } = orderDetail;
      invariant(!!orderNo, '请传入订单id');
      const result = await OrderAction.orderSend(orderNo);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '已发货'
      });
      this.init(orderNo);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public orderConfirmRefund = async () => {
    try {
      const { orderDetail } = this.props;
      const { orderNo } = orderDetail;
      invariant(!!orderNo, '请传入订单id');
      const result = await OrderAction.orderConfirmRefund(orderNo);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '同意退货'
      });
      this.init(orderNo);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public orderRefuseRefund = async () => {
    try {
      const { orderDetail } = this.props;
      const { orderNo } = orderDetail;
      invariant(!!orderNo, '请传入订单id');
      const result = await OrderAction.orderRefuseRefund(orderNo);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '拒绝退货'
      });
      this.init(orderNo);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public orderReceive = async (message = '已送达') => {
    try {
      const { orderDetail } = this.props;
      const { orderNo } = orderDetail;
      invariant(!!orderNo, '请传入订单id');
      const result = await OrderAction.orderReceive(orderNo);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: message
      });
      this.init(orderNo);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public orderFinishRefund = async (message = '已退货') => {
    try {
      const { orderDetail } = this.props;
      const { orderNo } = orderDetail;
      invariant(!!orderNo, '请传入订单id');
      const result = await OrderAction.orderFinishRefund(orderNo);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: message
      });
      this.init(orderNo);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public orderRefund = async () => {
    try {
      const { orderDetail } = this.props;

      const payload: OrderInterface.RefundByOrderPayload = {
        order: {
          orderNo: orderDetail.orderNo,
          refundByPreOrder: true,
          orderSource: 0,
          payType: 0,
          terminalCd: "",
          terminalSn: "",
          transAmount: orderDetail.order.transAmount,
        },
        productInfoList: orderDetail.orderDetailList ? orderDetail.orderDetailList.map((item) => {
          return {
            changeNumber: item.num,
            isDamaged: false,
            orderDetailId: item.id,
            remark: "",
            unitPrice: item.unitPrice,
            priceChangeFlag: false
          };
        }) : []
      };
      console.log('payload: ', payload);
      const result = await OrderService.orderRefund(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '退款成功',
        duration: 1000
      });
      this.init(orderDetail.orderNo);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public init = async (id: string) => {
    try {
      this.setState({loading: true});
      const result = await OrderAction.orderDetail({ orderNo: id });
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      this.setState({loading: false});
    } catch (error) {
      this.setState({loading: false});
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public getButtons = () => {
    const { orderDetail } = this.props;
    const status = OrderAction.orderStatus([], orderDetail as any);

    if (status.id === 0) {
      return [{
        title: '取消订单',
        onPress: () => {
          Taro.showModal({
            title: '提示',
            content: '取消后买家无法付款，确定取消?',
            success: (result) => {
              if (result.confirm) {
                this.orderRefund();
              }
            }
          });
        }
      }];
    }

    // 退货中
    if (status.id === 5) {
      return [{
        title: '拒绝退货',
        type: 'cancel',
        onPress: () => this.orderRefuseRefund(),
      }, {
        title: '退款',
        onPress: () => {
          Taro.showModal({
            title: '',
            content: '钱款将退回买家账户，确定退款？',
            success: (result) => {
              if (result.confirm) {
                this.orderFinishRefund();
              }
            }
          });
        } 
      }, {
        title: '查看原订单',
        onPress: () => Taro.navigateTo({
          url: `/pages/order/order.online?id=${orderDetail.order.originOrderNo}`
        })
      }];
    }

    if (status.id === 10) {
      return [{
        title: '取消并退款',
        type: 'cancel',
        onPress: () => {
          Taro.showModal({
            title: '提示',
            content: '确认取消并退款吗?',
            success: (result) => {
              if (result.confirm) {
                this.orderRefund();
              }
            }
          });
        }
      }, {
        title: '发货',
        onPress: () => this.orderSend()
      }];
    }

    if (status.id === 11) {
      return [{
        title: '取消并退款',
        type: 'cancel',
        onPress: () => {
          Taro.showModal({
            title: '提示',
            content: '确认取消并退款吗?',
            success: (result) => {
              if (result.confirm) {
                this.orderRefund();
              }
            }
          });
        }
      }, {
        title: '已自提',
        onPress: () => this.orderReceive('已自提')
      }];
    }

    if (status.id === 12) {
      return [{
        title: '已送达',
        onPress: () => this.orderReceive()
      }];
    }

    // 申请取消订单
    if (status.id === 13) {
      return [{
        title: '拒绝',
        type: 'cancel',
        onPress: () => this.orderRefuseRefund(),
      }, {
        title: '同意并退款',
        onPress: () => {
          Taro.showModal({
            title: '提示',
            content: '钱款将退回买家账户，确定退款?',
            success: (result) => {
              if (result.confirm) {
                this.orderConfirmRefund();
              }
            }
          });
        } 
      }];
    }

    // 申请退货
    if (status.id === 8) {
      return [{
        title: '拒绝',
        type: 'cancel',
        onPress: () => this.orderRefuseRefund(),
      }, {
        title: '同意',
        onPress: () => this.orderConfirmRefund(),
      }, {
        title: '查看原订单',
        onPress: () => Taro.navigateTo({
          url: `/pages/order/order.online?id=${orderDetail.order.originOrderNo}`
        })
      }];
    }

    if (orderDetail.order.originOrderNo) {
      return [{
        title: '查看原订单',
        onPress: () => {
          Taro.navigateTo({
            url: `/pages/order/order.online?id=${orderDetail.order.originOrderNo}`
          });
        }
      }];
    }
  }

  render () {
    const { loading } = this.state;
    const { orderDetail } = this.props;
    const status = OrderAction.orderStatus([], orderDetail as any);
    return (
      <View className={`container ${cssPrefix}`}>

        {!loading ? (
          <ScrollView
            scrollY={true}
            className={`${cssPrefix}-list-online`}
          >
            <OrderStatus orderDetail={orderDetail} />
            <OrderDetail orderDetail={orderDetail} />
            <ProductPayListView
              productList={orderDetail.orderDetailList}
              type={1}
            />
            <OrderContent orderDetail={orderDetail} />
            <View style='width: 100%;height: 100px; background: #f2f2f2' />
          </ScrollView>
        ) : (
          <AtActivityIndicator mode='center' />
        )}
        
        {!loading && status.id !== -1 && status.id !== 2 && status.id !== 1 && (
          <ButtonFooter
            buttons={this.getButtons()}
          />
        )}
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  orderDetail: getOrderDetail(state),
});

export default connect(select)(OrderOnline);