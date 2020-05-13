import Taro, { useState, useRouter, useDidShow } from "@tarojs/taro";
import { View } from "@tarojs/components";
import numeral from "numeral";
import invariant from "invariant";
import "../style/order.less";
import "./component/index.less";
import FormCard from "../../component/card/form.card";
import ButtonFooter from "../../component/button/button.footer";
import FormRow from "../../component/card/form.row";
import { store } from "../../app";
import { OrderInterface } from "src/constants";
import orderService from "../../constants/order/order.service";
import { ResponseCode } from "../../constants/index";
import orderAction from "../../actions/order.action";

const prefix = "component-order-product";
const cssPrefix = "order";

function OrderRefundConfirm() {
  const [orderDetail, setOrderDetail] = useState(undefined as any);
  const [cartList, setCartList] = useState([] as any[]);
  const [damageList, setDamageList] = useState([] as any[]);
  const [isCash, setIsCash] = useState(true);
  const router = useRouter();

  useDidShow(() => {
    console.log("router", router);
    const od = store.getState().order.orderDetail;
    setOrderDetail(od);
    setCartList(JSON.parse(router.params.cartList as any));
    setDamageList(JSON.parse(router.params.damageList as any));
  });

  const onRefund = async () => {
    try {
      console.log("orderDetail", orderDetail);

      let priceNumber = 0;
      cartList.map(item => {
        priceNumber +=
          numeral(item.sellNum).value() *
          numeral(item.changePrice || item.unitPrice).value();
      });

      const payload: OrderInterface.RefundByOrderPayload = {
        order: {
          orderNo: orderDetail.orderNo,
          refundByPreOrder: !isCash,
          orderSource: 0,
          payType: 0,
          terminalCd: "",
          terminalSn: "",
          transAmount: priceNumber
        },
        productInfoList: cartList.map(item => {
          const itemPrice = item.changePrice || item.unitPrice;
          const damageToken = damageList.findIndex(d => d === item.productId);
          return {
            changeNumber: item.sellNum,
            isDamaged: damageToken !== -1,
            orderDetailId: item.id,
            priceChangeFlag: !!item.changePrice,
            remark: "",
            unitPrice: itemPrice
          };
        })
      };
      const result = await orderService.orderRefund(payload);
      invariant(result.code === ResponseCode.success, result.msg || " ");
      Taro.showToast({
        title: "退款成功",
        duration: 1000
      });

      setTimeout(() => {
        Taro.navigateBack({ delta: 2 });
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  let priceNumber = 0;
  cartList.map(item => {
    priceNumber +=
      numeral(item.sellNum).value() *
      numeral(item.changePrice || item.unitPrice).value();
  });

  const form: any[] = [
    {
      title: `应退金额`,
      extraText: `￥ ${numeral(priceNumber).format("0.00")}`,
      extraTextStyle: "title",
      extraTextColor: "#FC4E44",
      extraTextBold: "bold"
    }
  ];

  const form2: any[] = [
    {
      title: "退款方式"
    }
  ];

  const selected = [
    {
      title: "现金",
      selected: isCash,
      onClick: () => {
        setIsCash(true);
      }
    },
    {
      title: `原路径退回（${orderAction.orderPayType(orderDetail)}）`,
      selected: !isCash,
      onClick: () => {
        setIsCash(false);
      }
    }
  ];

  return (
    <View className="container" style="background-color: #f2f2f2">
      <View className={`${cssPrefix}-detail-card`}>
        <FormCard items={form} />
      </View>
      <View className={`${cssPrefix}-detail-card`}>
        <FormCard items={form2}>
          {selected.map(item => {
            return (
              <FormRow
                key={item.title}
                title={item.title}
                onClick={item.onClick}
              >
                <View className={`${prefix}-extra`}>
                  {!item.selected ? (
                    <View
                      className={`${prefix}-extra-icon`}
                      style="background-image: url(//net.huanmusic.com/weapp/bt_normal.png)"
                    />
                  ) : (
                    <View
                      className={`${prefix}-extra-icon`}
                      style="background-image: url(//net.huanmusic.com/weapp/bt_selected.png)"
                    />
                  )}
                </View>
              </FormRow>
            );
          })}
        </FormCard>
      </View>

      <ButtonFooter
        buttons={[
          {
            title: "退款",
            onPress: () => onRefund()
          }
        ]}
      />
    </View>
  );
}

export default OrderRefundConfirm;
