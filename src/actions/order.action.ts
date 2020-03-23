
/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:28:21 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-20 11:36:12
 */
import { ResponseCode, OrderService, OrderInterface, OrderInterfaceMap } from '../constants/index';
import { store } from '../app';
import { OrderReducer } from '../reducers/app.order';

class OrderAction {

  public orderFinishRefund = async (orderNo: string) => {
    const result = await OrderService.orderFinishRefund(orderNo);
    return result;
  }

  public orderSend = async (orderNo: string) => {
    const result = await OrderService.orderSend(orderNo);
    return result;
  }

  public orderConfirmRefund = async (orderNo: string) => {
    const result = await OrderService.orderConfirmRefund(orderNo);
    return result;
  }

  public orderRefuseRefund = async (orderNo: string) => {
    const result = await OrderService.orderRefuseRefund(orderNo);
    return result;
  }

  public orderReceive = async (orderNo: string) => {
    const result = await OrderService.orderReceive(orderNo);
    return result;
  }

  public emptyOrderSearchList = () => {
    const reducer: OrderReducer.Reducers.OrderListReducer = {
      type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_SEARCH_LIST,
      payload: {
        fetchFidle: {
          pageNum: 1
        },
        rows: []
      } as any
    };
    store.dispatch(reducer);
  }

  public orderListSearch = async (params: OrderInterface.OrderListFetchFidle) => {
    const result = await OrderService.orderList(params);

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderListReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_SEARCH_LIST,
        payload: {
          fetchFidle: params,
          ...result.data as any
        }
      };
      store.dispatch(reducer);
    }
    return result;
  }

  public getFetchType = (currentType: any) => {
    switch (currentType) {
      case 0:
        return {
          transFlags: 10
        };
      case 1:
        return {
          transFlags: 12
        };
      case 2:
        return {
          transFlags: 11
        };
      case 3:
        return {
          transFlags: '5,8,13'
        };
      default:
        return {};
    }
  }

  /**
   * @todo 获取订单对应的状态
   *
   * @memberof OrderAction
   */
  public orderStatus = (orderAllStatus: any[], params: OrderInterface.OrderDetail, time?: number): {title: string; detail: string; id: number} => {
    const { order } = params;
    // const { transFlag } = order;
    if (time && time === -1) {
      return {
        id: -1,
        title: '交易关闭',
        detail: '该订单已关闭'
      };
    }
    if (order && order.transFlag !== undefined) {
      switch (order.transFlag) {
        case -1:
          return {
            id: -1,
            title: '支付失败',
            detail: '请重新下单'
          }
        case 0:
          return {
            id: 0,
            title: '待支付',
            detail: ''
          }
        case 1:
          return {
            id: 1,
            title: '已完成',
            detail: '订单已完成'
          }
        case 2:
          return {
            id: 2,
            title: '交易关闭',
            detail: '该订单已关闭'
          }
        case 3: {
          return {
            id: 3,
            title: '待邮寄',
            detail: ''
          }
        }
        case 4: {
          return {
            id: 4,
            title: '邮寄中',
            detail: '',
          }
        }
        case 5: {
          return {
            id: 5,
            title: '退货中',
            detail: '已同意退货，待买家退回商品',
          }
        }
        case 6: {
          return {
            id: 6,
            title: '拒绝退货',
            detail: '您拒绝了买家的退货申请',
          }
        }
        case 7: {
          return {
            id: 7,
            title: '已退货',
            detail: '已将钱款原路退回买家账户',
          }
        }
        case 8: {
          return {
            id: 8,
            title: '申请退货',
            detail: '买家申请退货',
          }
        }
        case 9: {
          return {
            id: 9,
            title: '买家取消退货',
            detail: '买家取消了退货申请',
          }
        }
        case 10: {
          return {
            id: 10,
            title: '待发货',
            detail: '',
          }
        }
        case 13: {
          return {
            id: 13,
            title: '申请取消订单',
            detail: '',
          }
        }
        case 12:
          return {
            id: 12,
            title: '待收货',
            detail: '商品待商家配送，请耐心等待'
          }
        case 11:
          return {
            id: 11,
            title: '待自提',
            detail: ''
          }
        default:
          for (let i = 0; i < orderAllStatus.length; i++) {
            if (order.transFlag === Number(orderAllStatus[i].dictValue)) {
              return {
                id: order.transFlag,
                title: orderAllStatus[i].dictLabel,
                detail: ''
              }
            }
          }
      }
    } 
    return {
      id: -2,
      title: '',
      detail: ''
    };
  }

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
          data: result.data
        }
      };
      store.dispatch(reducer);
    }
    return result;
  }

  public orderList = async (params: OrderInterface.OrderListFetchFidle) => {

    const result = await OrderService.orderList(params);

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderListReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_LIST,
        payload: {
          fetchFidle: params,
          ...result.data as any
        }
      };
      store.dispatch(reducer);
    }
    return result;
  }

  public orderDetail = async (params: OrderInterface.OrderDetailFetchField) => {
    const result = await OrderService.orderDetail(params);

    if (result.code === ResponseCode.success) {
      const reducer: OrderReducer.Reducers.OrderDetailReducer = {
        type: OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_DETAIL,
        payload: {
          data: result.data
        }
      };
      store.dispatch(reducer);
    }
    return result;
  }

  public orderPayType = (params: number | OrderInterface.OrderDetail): string => {
    // 支付方式 0=现金,1=支付宝,2=微信,3=银行卡,4=刷脸
    const type = typeof params === 'number' ? params : params.order.payType;
    switch (type) {
      case 0: {
        return '现金';
      }
      case 1: {
        return '支付宝';
      }
      case 2: {
        return '微信';
      }
      case 3: {
        return '银行卡';
      }
      case 4: {
        return '刷脸';
      }
      default: {
        return '微信';
      }
    }
  }
}

export default new OrderAction();

export const ORDER_STATUS = [{
  id: -1,
  title: '支付失败',
  detail: '请重新下单'
}, {
  id: 0,
  title: '待支付',
  detail: ''
}, {
  id: 1,
  title: '已完成',
  detail: '订单已完成'
}, {
  id: 2,
  title: '交易关闭',
  detail: '该订单已关闭'
}, {
  id: 3,
  title: '待邮寄',
  detail: ''
}, {
  id: 4,
  title: '邮寄中',
  detail: '',
}, {
  id: 6,
  title: '拒绝退货',
  detail: '',
}, {
  id: 5,
  title: '退货中	',
  detail: '',
}, {
  id: 7,
  title: '已退货',
  detail: '',
}, {
  id: 8,
  title: '申请退货',
  detail: '',
}, {
  id: 9,
  title: '买家取消退货',
  detail: '',
}, {
  id: 10,
  title: '待发货',
  detail: '',
}, {
  id: 13,
  title: '申请取消订单',
  detail: '',
}, {
  id: 12,
  title: '待收货',
  detail: '商品待商家配送，请耐心等待'
}, {
  id: 11,
  title: '待自提',
  detail: '请去门店自提商品'
}]