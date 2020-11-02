/**
 * @Author: Ghan
 * @Date: 2019-11-08 10:28:21
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-20 11:36:12
 */
import {
  ResponseCode,
  OrderService,
  OrderInterface,
  OrderInterfaceMap,
} from "../constants/index";
import { store } from "../app";
import { OrderReducer } from "../reducers/app.order";

class OrderAction {
  public orderFinishRefund = async (orderNo: string) => {
    const result = await OrderService.orderFinishRefund(orderNo);
    return result;
  };

  public orderSend = async (orderNo: string) => {
    const result = await OrderService.orderSend(orderNo);
    return result;
  };

  public orderConfirmRefund = async (orderNo: string) => {
    const result = await OrderService.orderConfirmRefund(orderNo);
    return result;
  };

  public orderRefuseRefund = async (orderNo: string) => {
    const result = await OrderService.orderRefuseRefund(orderNo);
    return result;
  };

  public orderReceive = async (orderNo: string) => {
    const result = await OrderService.orderReceive(orderNo);
    return result;
  };

  public emptyOrderSearchList = () => {
    const reducer: OrderReducer.Reducers.OrderListReducer = {
      type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_SEARCH_LIST,
      payload: {
        fetchFidle: {
          pageNum: 1,
        },
        rows: [],
      } as any,
    };
    store.dispatch(reducer);
  };

  public orderListSearch = async (
    params: OrderInterface.OrderListFetchFidle
  ) => {
    const result = await OrderService.orderList(params);

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderListReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_SEARCH_LIST,
        payload: {
          fetchFidle: params,
          ...(result.data as any),
        },
      };
      store.dispatch(reducer);
    }
    return result;
  };

  public getFetchType = (currentType: any) => {
    switch (currentType) {
      case 0:
        return { deliveryStatus: '0' };
      case 1:
        return { deliveryStatus: '2' };
      case 2:
        return { deliveryStatus: '1' };
      case 3:
        return { afterSaleStatus: '1' };
      default:
        return {};
    }
  };

  /**
   * @todo 根据订单的交易状态，物流状态，售后状态，确定订单状态
   * @param afterSaleStatus 
   * @param deliveryStatus 
   * @param transFlag 
   */
  getAfterSaleStatus = (afterSaleStatus, deliveryStatus, transFlag) => {
    if (afterSaleStatus === null || afterSaleStatus === undefined) {
      return this.getDeliveryStatus(deliveryStatus, transFlag);
    } else {
      return {
        type: "after_sale_status",
        typeList: AFTER_SALE_STATUS,
        value: afterSaleStatus,
      };
    }
  };
  getDeliveryStatus = (deliveryStatus, transFlag) => {
    if (
      deliveryStatus === null ||
      deliveryStatus === undefined ||
      deliveryStatus === 3
    ) {
      return this.getTransFlag(transFlag);
    } else {
      return {
        type: "delivery_status",
        typeList: DELIVERY_STATUS,
        value: deliveryStatus,
      };
    }
  };
  getTransFlag = (transFlag) => {
    return { type: "trans_flag", typeList: TRANS_FLAG, value: transFlag };
  };

  /**
   * @todo 获取订单对应的状态
   *
   * @memberof OrderAction
   * <DictBadge dictType={obj.type} text={val.order[obj.text]} />
   */
  public orderStatus = (
    orderAllStatus: any[],
    params: OrderInterface.OrderDetail,
    time?: number
  ): any => {
    const { order } = params;
    const obj = this.getAfterSaleStatus(
      order.afterSaleStatus,
      order.deliveryStatus,
      order.transFlag
    );
    if (obj.type === "trans_flag" && obj.value === -1) {
      return {
        type: "delivery_status",
        title: "支付失败",
        detail: "",
        id: -2,
      };
    }

    const res = obj.typeList &&
      obj.typeList.find((item: any) => item.dictValue === obj.value)
    return {
      type: obj.type,
      title: res && res.dictLabel,
      id: res && res.dictValue,
      detail: ''
    };
  };

  /**
   * @todo 获取各个状态的订单数量
   *
   * @memberof OrderAction
   */
  public orderCount = async () => {
    const result = await OrderService.orderCount();

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderDetailReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_COUNT,
        payload: {
          data: result.data,
        },
      };
      store.dispatch(reducer);
    }
    return result;
  };

  public orderList = async (params: OrderInterface.OrderListFetchFidle) => {
    const result = await OrderService.orderList(params);

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderListReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_LIST,
        payload: {
          fetchFidle: params,
          ...(result.data as any),
        },
      };
      store.dispatch(reducer);
    }
    return result;
  };

  public orderDetail = async (params: OrderInterface.OrderDetailFetchField) => {
    const result = await OrderService.orderDetail(params);

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderDetailReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_DETAIL,
        payload: {
          data: result.data,
        },
      };
      store.dispatch(reducer);
    }
    return result;
  };

  public orderPayType = (
    params: number | OrderInterface.OrderDetail
  ): string => {
    const type = typeof params === "number" ? params : params.order.payType;
    switch (type) {
      case 0: {
        return "现金";
      }
      case 1: {
        return "支付宝";
      }
      case 2: {
        return "微信";
      }
      case 3: {
        return "支付宝";
      }
      case 4: {
        return "微信";
      }
      case 5: {
        return "银行卡";
      }
      case 6: {
        return "刷脸";
      }
      case 7: {
        return "储蓄卡";
      }
      case 8: {
        return "小程序";
      }
      default: {
        return "微信";
      }
    }
  };
}

export default new OrderAction();

export const ORDER_STATUS = [
  {
    id: -1,
    title: "支付失败",
    detail: "请重新下单",
  },
  {
    id: 0,
    title: "待支付",
    detail: "",
  },
  {
    id: 1,
    title: "已完成",
    detail: "订单已完成",
  },
  {
    id: 2,
    title: "交易关闭",
    detail: "该订单已关闭",
  },
  {
    id: 3,
    title: "待邮寄",
    detail: "",
  },
  {
    id: 4,
    title: "邮寄中",
    detail: "",
  },
  {
    id: 6,
    title: "拒绝退货",
    detail: "",
  },
  {
    id: 5,
    title: "退货中	",
    detail: "",
  },
  {
    id: 7,
    title: "已退货",
    detail: "",
  },
  {
    id: 8,
    title: "申请退货",
    detail: "",
  },
  {
    id: 9,
    title: "买家取消退货",
    detail: "",
  },
  {
    id: 10,
    title: "待发货",
    detail: "",
  },
  {
    id: 13,
    title: "申请取消订单",
    detail: "",
  },
  {
    id: 12,
    title: "待收货",
    detail: "商品待商家配送，请耐心等待",
  },
  {
    id: 11,
    title: "待自提",
    detail: "请去门店自提商品",
  },
];


// 	trans_flag
export const TRANS_FLAG = [
  {
    dictValue: -1,
    dictLabel: "支付失败",
    detail: "请重新下单",
  },
  {
    dictValue: 0,
    dictLabel: "待支付",
    detail: "",
  },
  {
    dictValue: 1,
    dictLabel: "已完成",
    detail: "支付完成",
  },
  {
    dictValue: 2,
    dictLabel: "交易关闭",
    detail: "该订单已关闭",
  },
  {
    dictValue: 3,
    dictLabel: "已完成",
    detail: "订单已完成",
  },
];

// delivery_status
export const DELIVERY_STATUS = [
  {
    dictValue: 0,
    dictLabel: "待发货",
    detail: "",
  },
  {
    dictValue: 1,
    dictLabel: "待自提",
    detail: "",
  },
  {
    dictValue: 2,
    dictLabel: "待收货",
    detail: "",
  },
  {
    dictValue: 3,
    dictLabel: "配送完成",
    detail: "",
  },
];

// after_sale_status
export const AFTER_SALE_STATUS = [
  {
    dictValue: 0,
    dictLabel: "申请取消订单",
    detail: "",
  },
  {
    dictValue: 1,
    dictLabel: "申请退货",
    detail: "",
  },
  {
    dictValue: 2,
    dictLabel: "用户撤销取消订单",
    detail: "",
  },
  {
    dictValue: 3,
    dictLabel: "买家取消退货",
    detail: "",
  },
  {
    dictValue: 4,
    dictLabel: "退货中",
    detail: "",
  },
  {
    dictValue: 5,
    dictLabel: "拒绝退货",
    detail: "",
  },
  {
    dictValue: 6,
    dictLabel: "已退货",
    detail: "",
  },
  {
    dictValue: 7,
    dictLabel: "拒绝取消订单",
    detail: "",
  },
];