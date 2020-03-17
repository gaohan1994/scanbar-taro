import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.less';
import { OrderInterface } from 'src/constants';
import { OrderAction } from '../../../actions';
import dayJs from 'dayjs';

const prefix = 'component-order-product';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

type State = {
  time: string;
};

class OrderComponent extends Taro.Component<Props> {

  state: State = {
    time: ''
  };

  private timer: any;
  componentWillMount () {
    const { orderDetail } = this.props;
    const status = OrderAction.orderStatus([], orderDetail as any);
    console.log('componentWillMount status: ', status);
    if (status.id === 0) {
      this.setTimer(orderDetail.order.createTime);
      return;
    }

    if (status.id === 10 || status.id === 13) {
      this.setTimer(orderDetail.order.transTime);
      return;
    }
  }

  setTimer = (time: string) => {
    if (this.timer) {
      clearInterval(this.timer);
    }
    const createTime = dayJs(time);
    const now = dayJs();
    const dif = now.diff(createTime, 'm');
    this.setState({time: dif });
    this.timer = setInterval(() => {
      const createTime = dayJs(time);
      const now = dayJs();
      const dif = now.diff(createTime, 'm');
      this.setState({time: dif });
    }, 1000 * 60);
  }

  componentWillUnmount = () => {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  public onPhone = () => {
    const { orderDetail } = this.props;

    if (orderDetail && orderDetail.order && orderDetail.order.receiverPhone) {
      Taro.makePhoneCall({
        phoneNumber: orderDetail.order.receiverPhone
      });
      return;
    }

    Taro.showToast({
      title: '买家暂未提供联系方式',
      icon: 'none'
    });
  }

  public statusImage = (status: any) => {
    // bg_order_wait
    // bg_order_cancel
    // bg_order_complete
    // bg_order_refound
    switch (status.id) {
      case -1:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 0:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
      case 1:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_complete.png)';
      case 2:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      case 3: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
      }
      case 4: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
      }
      case 5: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_refound.png)';
      }
      case 6: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_refound.png)';
      }
      case 7: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_refound.png)';
      }
      case 8: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_refound.png)';
      }
      case 9: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_refound.png)';
      }
      case 10: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
      }
      case 13: {
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_cancel.png)';
      }
      case 12:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
      case 11:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
      default:
        return 'background-image: url(//net.huanmusic.com/weapp/bg_order_wait.png)';
    }
  }

  render () {
    const { time } = this.state;
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
          {status.id === 0 
          ? (
            <View className={`${prefix}-status-tip`} >{`买家已下单${time}分`}</View>
          ) 
          : status.id === 10 || status.id === 13
            ? (
              <View className={`${prefix}-status-tip`} >{`买家已付款${time}分`}</View>
            )
            : (
            <View className={`${prefix}-status-tip`} >{status.detail}</View>
          )}
          
          <View 
            className={`${prefix}-status-button`}
            onClick={() => this.onPhone()}
          >
            联系买家
          </View>
        </View>
      </View>
    );
  }
}

export default OrderComponent;