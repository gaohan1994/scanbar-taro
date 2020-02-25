
/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:28:21 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-02-25 11:33:22
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
    // 支付方式 0=现金,1=支付宝主扫,2=微信主扫,3=支付宝被扫,4微信被扫,5=银行卡,6=刷脸
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
        return '支付宝';
      }
      case 4: {
        return '微信';
      }
      case 5: {
        return '银行卡';
      }
      case 6: {
        return '刷脸';
      }
      default: {
        return '微信';
      }
    }
  }
}

export default new OrderAction();