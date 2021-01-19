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
        return { deliveryStatus: "0" };
      case 1:
        return { deliveryStatus: "2" };
      case 2:
        return { deliveryStatus: "1" };
      case 3:
        return { afterSaleStatus: "1" };
      default:
        return {};
    }
  };

  /**
   * 获取订单状态
   */
  getListItem = (value, list) => {
    if (typeof value !== "number") {
      return undefined;
    }
    const res = list.find((item) => item.id === value);
    return res;
  };

  getAfterSaleStatus = (afterSaleStatus) => {
    const res = this.getListItem(afterSaleStatus, AFTER_SALE_STATUS);
    if (!res) {
      return null;
    }
    return {
      type: "after_sale_status",
      ...res,
    };
  };

  getDeliveryStatus = (deliveryStatus) => {
    const res = this.getListItem(deliveryStatus, DELIVERY_STATUS);
    if (!res) {
      return null;
    }
    return {
      type: "delivery_status",
      ...res,
    };
  };
  getTransFlag = (transFlag) => {
    const res = this.getListItem(transFlag, TRANS_FLAG);
    if (!res) {
      return null;
    }
    return {
      type: "trans_flag",
      ...res,
    };
  };

  orderStatus = (r, orderDetail: any = {}) => {
    const transFlag = orderDetail.order && orderDetail.order.transFlag;
    const deliveryStatus =
      orderDetail.order && orderDetail.order.deliveryStatus;
    const afterSaleStatus =
      orderDetail.order && orderDetail.order.afterSaleStatus;

    // 如果只有交易状态显示交易状态
    if (
      typeof deliveryStatus !== "number" &&
      typeof afterSaleStatus !== "number"
    ) {
      const status = this.getTransFlag(transFlag);
      if (status) {
        return { ...status };
      }
    }

    // 如果只有交易以及物流显示物流
    if (typeof afterSaleStatus !== "number" && deliveryStatus !== 3) {
      const status = this.getDeliveryStatus(deliveryStatus);
      if (status) {
        return { ...status };
      }
    }

    // 售后的三种情况直接显示
    if ([0, 1, 4].indexOf(afterSaleStatus) !== -1) {
      const status = this.getAfterSaleStatus(afterSaleStatus);
      if (status) {
        return { ...status };
      }
    }

    // 售后其他情况状态显示上一次的(除了0 )，描述显示售后的
    let status;
    if (transFlag === 1) {
      status = this.getDeliveryStatus(deliveryStatus);
    }

    if (transFlag === 2) {
      status = {
        type: "trans_flag",
        id: 2,
        title: "交易关闭",
        detail: "该订单已关闭",
        status: false,
        bg: "cancel",
      };
    }

    if (transFlag === 3) {
      status = {
        type: "trans_flag",
        id: 3,
        title: "交易完成",
        detail: "订单已完成",
        status: true,
        bg: "complete",
      };
    }

    const { detail } = this.getAfterSaleStatus(afterSaleStatus) || { detail: '订单已完成'};
    if (status) {
      return { ...status, detail };
    }

    // 都不符合
    return {
      type: "trans_flag",
      id: 3,
      title: "交易完成",
      detail: "订单已完成",
      status: true,
      bg: "complete",
    }
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
    const type = typeof params === "number" ? params : params.order && params.order.payType;
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

type IOrderStatus = {
  id: number; // 状态值
  title: string; // 状态
  detail: string; // 状态描述
  showTime?: string; // 描述是否带时间(值表示时间值取决于哪个字段)
  status: boolean; //
  bg: "wait" | "cancel" | "complete" | "refound"; // 线上订单详情背景图
  selectable: boolean; // 提供给筛选，有些没有必要展示出给用户筛选
};
// 交易状态	trans_flag
export const TRANS_FLAG: IOrderStatus[] = [
  {
    id: -1,
    title: "支付失败",
    detail: "请重新下单",
    status: false,
    bg: "cancel",
    selectable: true
  },
  {
    id: -2,
    title: "订单异常",
    detail: "请重新下单",
    status: false,
    bg: "cancel",
    selectable: true
  },
  {
    id: 0,
    title: "待支付",
    detail: "买家已下单",
    status: false,
    bg: "wait",
    showTime: "createTime",
    selectable: true
  },
  // {
  //   id: 1,
  //   title: "支付完成",
  //   detail: "支付完成",
  //   status: false,
  //   bg:''
  // },
  {
    id: 2,
    title: "交易关闭",
    detail: "该订单已关闭",
    status: false,
    bg: "cancel",
    selectable: true
  },
  {
    id: 3,
    title: "交易完成",
    detail: "订单已完成",
    status: true,
    bg: "complete",
    selectable: true
  },
  {
    id: 4,
    title: "交易取消",
    detail: "交易取消",
    status: false,
    bg: "cancel",
    selectable: true
  },
  {
    id: 5,
    title: "支付中",
    detail: "支付中",
    status: false,
    bg: "wait",
    selectable: false
  },
];

// 配送状态 delivery_status
export const DELIVERY_STATUS: IOrderStatus[] = [
  {
    id: 0,
    title: "待发货",
    detail: "买家已付款",
    status: false,
    bg: "wait",
    showTime: "transTime",
    selectable: true
  },
  {
    id: 1,
    title: "待自提",
    detail: "买家已付款",
    status: false,
    bg: "wait",
    showTime: "transTime",
    selectable: true
  },
  {
    id: 2,
    title: "待收货",
    detail: "待收货",
    status: false,
    bg: "wait",
    selectable: true
  },
  {
    id: 3,
    title: "配送完成",
    detail: "",
    status: false,
    bg: "complete",
    selectable: false
  },
];

// 售后状态 after_sale_status
export const AFTER_SALE_STATUS: IOrderStatus[] = [
  {
    id: 0,
    title: "申请取消订单",
    detail: "买家已付款",
    status: false,
    bg: "wait",
    showTime: "transTime",
    selectable: true
  },
  {
    id: 1,
    title: "申请退货",
    detail: "买家申请退货",
    status: false,
    bg: "wait",
    selectable: true
  },
  {
    id: 2,
    title: "用户撤销取消订单",
    detail: "用户撤销取消订单",
    status: false,
    bg: "cancel",
    selectable: false
  },
  {
    id: 3,
    title: "用户撤销退货退款订单",
    detail: "用户撤销退货退款订单",
    status: false,
    bg: "cancel",
    selectable: false
  },
  {
    id: 4,
    title: "退货退款中",
    detail: "退货退款中",
    status: false,
    bg: "wait",
    selectable: true
  },
  {
    id: 5,
    title: "商家拒绝退货退款申请",
    detail: "商家拒绝退货退款申请",
    status: false,
    bg: "complete",
    selectable: false
  },
  {
    id: 6,
    title: "交易完成",
    detail: "已退货退款",
    status: true,
    bg: "complete",
    selectable: false
  },
  {
    id: 7,
    title: "商家拒绝取消订单",
    detail: "商家拒绝取消订单申请",
    status: false,
    bg: "complete",
    selectable: false
  },
];