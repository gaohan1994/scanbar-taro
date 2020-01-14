import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
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
    const imageClassName = `${cssPrefix}-left-img`;
    // 支付方式 0=现金,1=支付宝,2=微信,3=银行卡,4=刷脸
    return (
      <View 
        className={`${cssPrefix}`}
        onClick={() => this.onClickOrder(data)}
      >
        {data.order && (
          <View className={`${cssPrefix}-left`}>
            {data.order.payType === 0
            ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_cash.png"
                className={imageClassName}
              />
            )
            : data.order.payType === 1 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_aliplay.png"
                className={imageClassName}
              />
            )
            : data.order.payType === 2 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_wechat.png"
                className={imageClassName}
              />
            )
            : data.order.payType === 3 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_bank.png"
                className={imageClassName}
              />
            ) 
            : data.order.payType === 4 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_wechat.png"
                className={imageClassName}
              />
            )
            : (
              <Image
                src="//net.huanmusic.com/weapp/icon_wechat.png"
                className={imageClassName}
              />
            )}
            
            <View className={`${cssPrefix}-left-detail`}>
              <View className={`${cssPrefix}-no`}>{`${data.order.orderNo}`}</View>
              <View className={`${cssPrefix}-time`}>{`${dayJs(data.order.transTime).format('HH:mm:ss')}`}</View>
            </View>
          </View>
        )}
        
        <View className={`${cssPrefix}-right`}>
          <View className={`${cssPrefix}-price`}>{`￥${numeral(data.order && data.order.transAmount || 0).format('0.00')}`}</View>
        </View>
      </View>
    );
  }
}

export default OrderItem;