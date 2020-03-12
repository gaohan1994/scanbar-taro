
/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:28:21 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-11 16:50:49
 */
import { ResponseCode, OrderService, OrderInterface, OrderInterfaceMap } from '../constants/index';
import { store } from '../app';
import { OrderReducer } from '../reducers/app.order';

class OrderAction {

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
        return {};
      case 1:
        return {
          transFlags: 0
        };
      case 2:
        return {
          transFlags: '10,12,3,4'
        };
      case 3:
        return {
          transFlags: 11
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
        title: '已取消',
        detail: '该订单已取消'
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
            detail: '订单已完成，感谢您的信任'
          }
        case 2:
          return {
            id: 2,
            title: '已取消',
            detail: '超时未支付或您已取消，订单已取消'
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
            title: '退货中	',
            detail: '',
          }
        }
        case 6: {
          return {
            id: 6,
            title: '拒绝退货',
            detail: '',
          }
        }
        case 7: {
          return {
            id: 7,
            title: '已退货',
            detail: '',
          }
        }
        case 8: {
          return {
            id: 8,
            title: '申请退货',
            detail: '',
          }
        }
        case 9: {
          return {
            id: 9,
            title: '买家取消退货	',
            detail: '',
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
            detail: '请去门店自提商品'
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