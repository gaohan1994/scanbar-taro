/**
 * @Author: Ghan 
 * @Date: 2019-12-09 13:51:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-18 11:48:34
 */

import merge from 'lodash.merge';
import { OrderInterface, OrderInterfaceMap } from '../constants/index';
import { AppReducer } from '.';

export declare namespace OrderReducer {

  namespace Reducers {
    interface OrderListReducer {
      type: OrderInterface.RECEIVE_ORDER_LIST;
      payload: {
        fetchFidle: OrderInterface.OrderListFetchFidle;
        total: number;
        rows: OrderInterface.OrderDetail[];
      };
    }

    interface OrderDetailReducer {
      type: OrderInterface.RECEIVE_ORDER_DETAIL;
      payload: {
        data: OrderInterface.OrderDetail;
      };
    }
  } 

  interface State {
    orderList: Array<OrderInterface.OrderDetail>;
    orderListTotal: number;
    orderDetail: OrderInterface.OrderDetail;
  }

  type Action = 
    Reducers.OrderListReducer
    | Reducers.OrderDetailReducer;
}

const initState: OrderReducer.State = {
  orderList: [],
  orderListTotal: -1,
  orderDetail: {} as any,
};

export default function orderReducer (
  state: OrderReducer.State = initState, 
  action: OrderReducer.Action
): OrderReducer.State {

  switch (action.type) {

    case OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_DETAIL: {
      const { payload } = action as OrderReducer.Reducers.OrderDetailReducer;
      const { data } = payload;
      return {
        ...state,
        orderDetail: data
      };
    }

    case OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_LIST: {
      const { payload } = action as OrderReducer.Reducers.OrderListReducer;

      let nextOrderList: OrderInterface.OrderDetail[] = [];
      if (payload.fetchFidle.pageNum === 1) {
        nextOrderList = payload.rows;
      } else {
        const prevOrderList: OrderInterface.OrderDetail[] = merge([], state.orderList);
        nextOrderList = prevOrderList.concat(payload.rows);
      }
      return {
        ...state,
        orderListTotal: payload.total,
        orderList: nextOrderList
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
}

export const getOrderList = (state: AppReducer.AppState) => state.order.orderList;

export const getOrderListTotal = (state: AppReducer.AppState) => state.order.orderListTotal;

export const getOrderDetail = (state: AppReducer.AppState) => state.order.orderDetail;