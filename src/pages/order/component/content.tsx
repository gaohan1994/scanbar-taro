import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "../index.less";
import numeral from "numeral";
import { OrderInterface } from "src/constants";
import classnames from "classnames";
import dayJs from "dayjs";
import { OrderAction } from "../../../actions";
const cssPrefix = "order-detail";
import OrderRefundComponent from "./refund";

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

class OrderComponent extends Taro.Component<Props> {

  public onCopy = (orderNo) => {
    Taro.setClipboardData({ data: orderNo }).then(() => {
      Taro.showToast({
        title: "复制成功"
      });
    });
  }

  render() {
    
    const { orderDetail } = this.props;
    const { order } = orderDetail;
    const status = OrderAction.orderStatus([], orderDetail as any);

    let items: any[] = [];

    if (
      status.id === 5 ||
      status.id === 6 ||
      status.id === 7 ||
      status.id === 8 ||
      status.id === 9
    ) {
      items = [
        {
          title: "退货订单号码",
          extraText: `${order.orderNo}`
        },
        {
          title: "申请退货时间",
          extraText: `${dayJs(order.transTime || "").format(
            "YYYY/MM/DD HH:mm"
          )}`,
          border: false
        }
      ];
    } else if (status.id === 0) {
      items = order && [
        {
          title: "订单号码",
          extraText: `${order.orderNo}`,
          // onClick: () => {
          //   Taro.setClipboardData({ data: order.orderNo }).then(() => {
          //     Taro.showToast({
          //       title: "复制成功"
          //     });
          //   });
          // }
          onClick: this.onCopy.bind(null, order.orderNo)
        },
        {
          title: "创建时间",
          extraText: `${dayJs(order.createTime || "").format(
            "YYYY/MM/DD HH:mm"
          )}`,
          border: false
        }
      ];
    } else {
      items = order && [
        {
          title: "订单号码",
          extraText: `${order.orderNo}`,
          onClick: this.onCopy.bind(null, order.orderNo)
        },
        {
          title: "创建时间",
          extraText: `${dayJs(order.createTime || "").format(
            "YYYY/MM/DD HH:mm"
          )}`
        },
        {
          title: "付款时间",
          extraText: `${dayJs(order.transTime || "").format(
            "YYYY/MM/DD HH:mm"
          )}`
        },
        {
          title: "支付方式",
          extraText: `${OrderAction.orderPayType(orderDetail)}支付`,
          border: false
        }
      ];
    }

    if (status.id === 12) {
      items[items.length - 1].border = true;
      items.push({
        title: "发货时间",
        extraText: `${dayJs(order.deliveryTime || "").format(
          "YYYY/MM/DD HH:mm"
        )}`,
        border: false
      });
    }
    
    return (
      <View>
        <View
          className={`${cssPrefix}-card ${cssPrefix}-card-order`}
          style="margin-bottom: 0px"
        >
          {items &&
            items.length > 0 &&
            items.map(item => {
              return (
                <View
                  key={item.title}
                  className={classnames(`${cssPrefix}-card-order-item`, {
                    [`${cssPrefix}-card-order-item-border`]: !(
                      item.border === false
                    )
                  })}
                  onClick={item.onClick}
                >
                  <Text className={`${cssPrefix}-card-order-item-title`}>
                    {item.title}
                  </Text>
                  <View className={`${cssPrefix}-card-order-item-content`}>
                    {item.extraText}
                    {item.title === "订单号码" && (
                      <View className={`${cssPrefix}-card-order-item-copy`} />
                    )}
                  </View>
                </View>
              );
            })}
        </View>
        <OrderRefundComponent orderDetail={orderDetail} />
        {/* {orderDetail.refundOrderList && (
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

                    <View
                      className={`${cssPrefix}-card-order-item-content-arrow`}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )} */}
      </View>
    );
  }
}

export default OrderComponent;
