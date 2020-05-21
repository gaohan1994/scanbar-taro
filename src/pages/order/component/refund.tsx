import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "../index.less";
import numeral from "numeral";
import classnames from "classnames";
import dayJs from "dayjs";
const cssPrefix = "order-detail";

function OrderComponent(props) {
  const { orderDetail } = props;
  if (!orderDetail.refundOrderList) {
    return <View />;
  }
  return (
    <View
      className={`${cssPrefix}-card ${cssPrefix}-card-order`}
      style="margin-bottom: 0px"
    >
      {orderDetail.refundOrderList.map((item, index) => {
        return (
          <View
            key={`d${index}`}
            className={classnames(`${cssPrefix}-card-order-item`, {
              [`${cssPrefix}-card-order-item-border`]: !(
                index + 1 ===
                (orderDetail.refundOrderList as any).length
              )
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
                {dayJs(item.createTime).format("YYYY/MM/DD MM:ss")}
              </Text>
            </View>
            <View
              className={`${cssPrefix}-card-order-item-content`}
              style="color: #FC4E44;"
            >
              {`￥${numeral(item.transAmount).format("0.00")}`}

              <View className={`${cssPrefix}-card-order-item-content-arrow`} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
export default OrderComponent;
