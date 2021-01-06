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
  getListItem = (value: string | undefined, list: any[] = []) => {
    if(!value) {
      return undefined
    }
    const res = list.find((item: any) => item.dictValue === value)
    return res
  }
  getAfterSaleStatus = (afterSaleStatus, deliveryStatus, transFlag) => {
    const res = this.getListItem(afterSaleStatus, AFTER_SALE_STATUS)
    if(!res) {
      return this.getDeliveryStatus(deliveryStatus, transFlag)
    }
    return {
      type: 'AFTER_SALE_STATUS',
      title: res && res.dictLabel || '',
      id: res && res.dictValue || -1,
      detail: '',
      status: res && res.status || false
    };
  };
  getDeliveryStatus = (deliveryStatus, transFlag) => {
    const res = this.getListItem(deliveryStatus, DELIVERY_STATUS)
    if(!res) {
      return this.getTransFlag(transFlag)
    }
    return {
      type: "delivery_status",
      title: res && res.dictLabel || '',
      id: res && res.dictValue || -1,
      detail: '',
      status: res && res.status || false
    };
  };
  getTransFlag = (transFlag) => {
    const res = this.getListItem(transFlag, TRANS_FLAG)
    // 如果没找到就后面的默认值
    return {
      type: '',
      title: res && res.dictLabel || '',
      id: res && res.dictValue || -1,
      detail: '',
      status: res && res.status || false
    }
  };

  /**
   * @todo 获取订单对应的状态
   */
  public orderStatus = (
    orderAllStatus: any[],
    params: OrderInterface.OrderDetail,
  ): {title: string, type: string, detail: string, id: number, status: boolean} => {
    const { order } = params;
    console.log(
      'order.afterSaleStatus',order.afterSaleStatus,
      'order.deliveryStatus',order.deliveryStatus,
      'order.transFlag',order.transFlag,
    )
    const obj = this.getAfterSaleStatus(
      order.afterSaleStatus,
      order.deliveryStatus,
      order.transFlag
    );
    return obj;
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

// 交易状态	trans_flag
export const TRANS_FLAG = [
  {
    dictValue: -1,
    dictLabel: "支付失败",
    detail: "请重新下单",
    status: false
  },
  {
    dictValue: -2,
    dictLabel: "订单异常",
    detail: "订单异常",
    status: false
  },
  {
    dictValue: 0,
    dictLabel: "待支付",
    detail: "",
    status: false
  },
  // {
  //   dictValue: 1,
  //   dictLabel: "支付完成",
  //   detail: "支付完成",
  //   status: false
  // },
  {
    dictValue: 2,
    dictLabel: "交易关闭",
    detail: "该订单已关闭",
    status: false
  },
  {
    dictValue: 3,
    dictLabel: "交易完成",
    detail: "订单已完成",
    status: true
  },
  {
    dictValue: 4,
    dictLabel: "交易取消",
    detail: "交易取消",
    status: false
  },
  {
    dictValue: 5,
    dictLabel: "支付中",
    detail: "支付中",
    status: false
  }
];

// 配送状态 delivery_status
export const DELIVERY_STATUS = [
  {
    dictValue: 0,
    dictLabel: "待发货",
    detail: "",
    status: false
  },
  {
    dictValue: 1,
    dictLabel: "待自提",
    detail: "",
    status: false
  },
  {
    dictValue: 2,
    dictLabel: "待收货",
    detail: "",
    status: false
  },
  // {
  //   dictValue: 3,
  //   dictLabel: "配送完成",
  //   detail: "",
  //   status: false
  // },
];

// 售后状态 after_sale_status
export const AFTER_SALE_STATUS = [
  {
    dictValue: 0,
    dictLabel: "申请取消订单",
    detail: "",
    status: false
  },
  {
    dictValue: 1,
    dictLabel: "申请退货",
    detail: "",
    status: false
  },
  // {
  //   dictValue: 2,
  //   dictLabel: "用户撤销取消订单",
  //   detail: "",
  //   status: false,
  // },
  // {
  //   dictValue: 3,
  //   dictLabel: "买家取消退货",
  //   detail: "",
  //   status: false
  // },
  {
    dictValue: 4,
    dictLabel: "退货退款中",
    detail: "",
    status: false
  },
  // {
  //   dictValue: 5,
  //   dictLabel: "卖家拒绝退货",
  //   detail: "",
  //   status: false
  // },
  // {
  //   dictValue: 6,
  //   dictLabel: "交易完成",
  //   detail: "已退货",
  //   status: true
  // },
  // {
  //   dictValue: 7,
  //   dictLabel: "拒绝取消订单",
  //   detail: "",
  //   status: false
  // },
];



/**
 * C端订单状态逻辑
 */
// public orderStatus = (orderAllStatus: OrderInterface.OrderAllStatus[], params: OrderInterface.OrderDetail, time?: number): any => {
//   const { order } = params;
//   // const { transFlag } = order;
//   // 待发货的退款状态
//   if (order.deliveryStatus === 0 && order.transFlag === 1 && order.afterSaleStatus === 0) {
//     return {
//       title: "等待商家处理",
//       detail: "取消订单申请已提交，等待商家处理"
//     }
//   } 
//   else if (order.deliveryStatus === 0 && order.transFlag === 1 && order.afterSaleStatus === 2) {
//     return {
//       // title: "您已撤销取消订单申请",
//       title: "待发货",
//       detail: "您已撤销取消订单申请，等待商家发货"
//     };
//   }  
//   else if (order.deliveryStatus === 0 && order.transFlag === 1 && order.afterSaleStatus === 4) {
//     return {
//       title: "商家同意取消订单",
//       detail: "商家同意取消订单，金额将原路退回"
//     };
//   } else if (order.deliveryStatus === 0 && order.transFlag === 1 && order.afterSaleStatus === 5) {
//     return {
//       // title: "商家拒绝了取消订单",
//       title: "待发货",
//       detail: "商家拒绝了您的取消订单申请"
//     };
//   } else if (order.deliveryStatus === 0 && order.transFlag === 2 && order.afterSaleStatus === 6) {
//     return {
//       title: "取消订单成功",
//       detail: "取消订单成功，金额已原路退回"
//     };
//   }
//   // 待自提的退款状态
//    else if (order.deliveryStatus === 1 && order.transFlag === 1 && order.afterSaleStatus === 0) {
//     return {
//       title: "等待商家处理",
//       detail: "取消订单申请已提交，等待商家处理"
//     };
//   }
//   else if (order.deliveryStatus === 1 && order.transFlag === 1 && order.afterSaleStatus === 4) {
//     return {
//       title: "商家同意取消订单",
//       detail: "商家同意取消订单，金额将原路退回"
//     };
//   } else if (order.deliveryStatus === 1 && order.transFlag === 1 && order.afterSaleStatus === 5) {
//     return {
//       // title: "商家拒绝了取消订单",
//       title: "待自提",
//       detail: "商家拒绝了您的取消订单申请"
//     };
//   } else if (order.deliveryStatus === 1 && order.transFlag === 2 && order.afterSaleStatus === 6) {
//     return {
//       title: "取消订单成功",
//       detail: "取消订单成功，金额已原路退回"
//     };
//   }

//   // // 待收货
//   else if (order.deliveryStatus === 2 && order.transFlag === 1 && order.afterSaleStatus === 1) {
//     return {
//       title: "等待商家处理",
//       detail: "取消退货申请成功"
//     };
//   } 
//   else if (order.deliveryStatus === 2 && order.transFlag === 1 && order.afterSaleStatus === 3) {
//     return {
//       // title: "您已撤销退货申请",
//       title: "待收货",
//       detail: "您已撤销退货申请"
//     };
//   }  
//   else if (order.deliveryStatus === 2 && order.transFlag === 1 && order.afterSaleStatus === 4) {
//     if(order.refundStatus === 1) {
//       return {
//         title: "部分商品已成功退回",
//         detail: "退货金额已原路退回"
//       };
//     } else {
//       return {
//         title: "商家同意退货",
//         detail: "商家同意退货，请您将商品退回"
//       };
//     }
//   } else if (order.deliveryStatus === 1 && order.transFlag === 1 && order.afterSaleStatus === 5 || order.deliveryStatus === 2 && order.transFlag === 1 && order.afterSaleStatus === 5) {
//     return {
//       // title: "商家拒绝退货",
//       title: "待收货",
//       detail: "商家拒绝了您的退货申请"
//     };
//   } else if (order.deliveryStatus === 1 && order.transFlag === 2 && order.afterSaleStatus === 6) {
//     return {
//       title: "退货成功",
//       detail: "退货金额已原路退回"
//     };
//   }

//   // 配送完成
//   else if (order.deliveryStatus === 3 && order.transFlag === 3 && order.afterSaleStatus === 1) {
//     return {
//       title: "待商家处理",
//       detail: "申请退货"
//     };
//   } 
//   else if (order.deliveryStatus === 3 && order.transFlag === 3 && order.afterSaleStatus === 3) {
//     return {
//       title: "已完成",
//       detail: "您已撤销退货申请"
//     };
//   }  else if (order.deliveryStatus === 3 && order.transFlag === 3 && order.afterSaleStatus === 4) {
//     return {
//       title: "商家同意退货",
//       detail: "商家同意退货，请您将商品退回"
//     };
//   } else if (order.deliveryStatus === 3 && order.transFlag === 3 && order.afterSaleStatus === 5) {
//     return {
//       title: "商家拒绝退货",
//       detail: "商家拒绝了您的退货申请"
//     };
//   } else if (order.deliveryStatus === 3 && order.transFlag === 3 && order.afterSaleStatus === 6) {
//     return {
//       title: "退货成功",
//       detail: "退货金额已原路退回"
//     };
//   } else if (order.deliveryStatus === 2 && order.transFlag === 2 && order.afterSaleStatus === 6 && order.refundStatus === 2) {
//     return {
//       title: "退货成功",
//       detail: "退货金额已原路退回"
//     };
//   }
//   // 其他状态
//    else if (order.transFlag === -1 || order.transFlag === -2) {
//     return {
//       title: "支付失败",
//       detail: "请重新下单"
//     };
//   } else if (order.transFlag === 0) {
//     return {
//       title: "待支付",
//       detail: ""
//     };
//   } else if (order.transFlag === 1 && order.deliveryStatus === 0) {
//     return {
//       title: "待发货",
//       detail: "商品待商家配送，请耐心等待"
//     };
//   } else if (order.transFlag === 1 && order.deliveryStatus === 1) {
//     return {
//       title: "待自提",
//       detail: "请去门店自提商品"
//     };
//   } else if (order.transFlag === 1 && order.deliveryStatus === 2) {
//     return {
//       title: "待收货",
//       detail: "商品已发货，请耐心等待"
//     };
//   } else if (order.transFlag === 1 && order.deliveryStatus === 3) {
//     return {
//       title: "已完成",
//       detail: "订单已完成，感谢您的信任"
//     };
//   } else if (order.transFlag == 2) {
//     return {
//       title: "交易关闭",
//       detail: "超时未支付或您已取消，订单已关闭"
//     };
//   } else if (order.transFlag === 3) {
//     return {
//       title: "已完成",
//       detail: "订单已完成，感谢您的信任"
//     };
//   }
//    else if (order.transFlag === 4) {
//     return {
//       title: "交易取消",
//       detail: "您已取消交易"
//     };
//   }
// }
