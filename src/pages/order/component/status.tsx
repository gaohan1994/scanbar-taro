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
  time: number;
};

class OrderComponent extends Taro.Component<Props> {

  state: State = {
    time: -1
  };

  private timer: any;
  componentWillMount () {
    const { orderDetail } = this.props;
    const status = OrderAction.orderStatus([], orderDetail as any);
    if(status.showTime) {
      this.setTimer(orderDetail.order[status.showTime])
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

  public setTime = (time: number): string => {
    const hour = Math.floor(time / 60);
    const min = time % 60;
    return `${hour}时${min}分`;
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
          style={`background-image: url(//net.huanmusic.com/weapp/bg_order_${status.bg}.png)`}
        >
          <View className={`${prefix}-status-title`} >{status.title}</View>
          <View className={`${prefix}-status-tip`} >{status.detail}{status.showTime && this.setTime(time)}</View>
          
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