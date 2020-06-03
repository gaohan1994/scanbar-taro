import Taro from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import "./order.less";
import { OrderInterface } from "../../constants";
import numeral from "numeral";
import dayJs from "dayjs";

const cssPrefix = "component-order-item";

type Props = {
  data: OrderInterface.OrderDetail;
};
type State = {};

class OrderItem extends Taro.Component<Props, State> {
  static defaultProps = {
    data: {}
  };

  public onClickOrder = (order: OrderInterface.OrderDetail) => {
    Taro.navigateTo({
      url: `/pages/order/order.detail?id=${order.order.orderNo}`
    });
  };

  render() {
    const { data } = this.props;
    const imageClassName = `${cssPrefix}-left-img`;
    // 支付方式 0=现金,1=支付宝,2=微信,3=银行卡,4=刷脸
    return (
      <View className={`${cssPrefix}`} onClick={() => this.onClickOrder(data)}>
        {data.order && (
          <View className={`${cssPrefix}-left`}>
            {data.order.transFlag === -1 ? (
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_failorder.png"
                className={imageClassName}
              />
            ) : data.order.payType === 0 ? (
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_cash.png"
                className={imageClassName}
              />
            ) : data.order.payType === 1 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_aliplay.png"
                className={imageClassName}
              />
            ) : data.order.payType === 2 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_wechat.png"
                className={imageClassName}
              />
            ) : data.order.payType === 3 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_bank.png"
                className={imageClassName}
              />
            ) : data.order.payType === 4 ? (
              <Image
                src="//net.huanmusic.com/weapp/icon_wechat.png"
                className={imageClassName}
              />
            ) : (
              <Image
                src="//net.huanmusic.com/weapp/icon_wechat.png"
                className={imageClassName}
              />
            )}

            <View className={`${cssPrefix}-left-detail`}>
              {/*
               * 02 27
               * @todo 修改 退货订单爷显示成黑色
               *
               * 退货状态 refundStatus
               * -1=不能退货（如待支付或交易关闭，以及取消申请中,以及储蓄/直接收款）
               * 0=未退货（可能有退货记录包含退货中的，但没有实际退货成功的数量）
               * 1=部分退货
               * 2=全退
               */}
              <View className={`${cssPrefix}-no`}>
                {`${data.order.orderNo}`}
              </View>
              <View className={`${cssPrefix}-row`}>
                <View className={`${cssPrefix}-time`}>
                  {`${dayJs(data.order.createTime).format("HH:mm:ss")}`}
                </View>
                {data.order.transFlag === -1 ? (
                  <View className={`${cssPrefix}-flag ${cssPrefix}-flag-red`}>
                    交易失败
                  </View>
                ) : data.order.transType === 1 ? (
                  <View
                    className={`${cssPrefix}-flag ${cssPrefix}-flag-orange`}
                  >
                    退货订单
                  </View>
                ) : data.order.refundStatus === 1 ? (
                  <View className={`${cssPrefix}-flag`}>部分退货</View>
                ) : data.order.refundStatus === 2 ? (
                  <View className={`${cssPrefix}-flag`}>全部退货</View>
                ) : (
                  <View />
                )}
              </View>
            </View>
          </View>
        )}

        <View className={`${cssPrefix}-right`}>
          {data.order.transType === 1 ? (
            <View className={`${cssPrefix}-price-refund`}>{`-￥${numeral(
              (data.order && data.order.transAmount) || 0
            ).format("0.00")}`}</View>
          ) : (
            <View className={`${cssPrefix}-price`}>{`￥${numeral(
              (data.order && data.order.transAmount) || 0
            ).format("0.00")}`}</View>
          )}
        </View>
      </View>
    );
  }
}

export default OrderItem;
