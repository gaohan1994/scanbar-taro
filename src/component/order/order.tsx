import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './order.less';
import { OrderInterface } from '../../constants';
import numeral from 'numeral';

const cssPrefix = 'component-order-item';

type Props = {
  data: OrderInterface.OrderDetail;
};
type State = {};

class OrderItem extends Taro.Component<Props, State> {

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
            {/* {this.renderImage()} */}
            <View className={`${cssPrefix}-left-detail`}>
              <View>{`交易单号: ${data.order.orderNo}`}</View>
              <View>{`时间: ${data.order.transTime}`}</View>
            </View>
          </View>
        )}
        
        <View className={`${cssPrefix}-right`}>
          {data.order && data.order.transAmount && (
            <View>{`￥ ${numeral(data.order.transAmount).format('0.00')}`}</View>
          )}
        </View>
      </View>
    );
  }

  // private renderImage = () => {
  //   const { data } = this.props;
  //   // 0=现金,1=支付宝主扫,2=微信主扫,3=支付宝被扫,4微信被扫,5=银行卡,6=刷脸
  //   switch (data.order.payType) {
  //     case 0: {
  //       return <Image src="" />;
  //     }
  //     default: {
  //       return <View/>;
  //     }
  //   }
  // }
}

export default OrderItem;