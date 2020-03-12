/**
 * @Author: Ghan 
 * @Date: 2019-12-09 13:51:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-11 14:28:57
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
    orderListOnline: Array<OrderInterface.OrderDetail>;
    orderListOnlineTotal: number;
    orderSearchList: Array<OrderInterface.OrderDetail>;
    orderListTotal: number;
    orderDetail: OrderInterface.OrderDetail;
  }

  type Action = 
    Reducers.OrderListReducer
    | Reducers.OrderDetailReducer;
}

const initState: OrderReducer.State = {
  orderList: [],
  orderSearchList: [],
  orderListTotal: -1,
  orderDetail: {} as any,
  orderListOnline: [],
  orderListOnlineTotal: -1,
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

    case OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_SEARCH_LIST: {
      const { payload } = action as OrderReducer.Reducers.OrderListReducer;

      let nextOrderList: OrderInterface.OrderDetail[] = [];
      if (payload.fetchFidle.pageNum === 1) {
        nextOrderList = payload.rows;
      } else {
        const prevOrderList: OrderInterface.OrderDetail[] = merge([], state.orderSearchList);
        nextOrderList = prevOrderList.concat(payload.rows);
      }

      return {
        ...state,
        orderSearchList: nextOrderList
      };
    }

    case OrderInterfaceMap.reducerInterfaces.RECEIVE_ORDER_LIST: {
      const { payload } = action as OrderReducer.Reducers.OrderListReducer;

      /**
       * @todo 如果是线上订单则单独处理
       */
      if (payload.fetchFidle.orderSource === 3) {
        let nextOrderList: OrderInterface.OrderDetail[] = [];
        if (payload.fetchFidle.pageNum === 1) {
          nextOrderList = payload.rows;
        } else {
          const prevOrderList: OrderInterface.OrderDetail[] = merge([], state.orderListOnline);
          nextOrderList = prevOrderList.concat(payload.rows);
        }
        return {
          ...state,
          orderListOnlineTotal: payload.total,
          orderListOnline: nextOrderList
        };
      }

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

export const getOrderListOnlineTotal = (state: AppReducer.AppState) => state.order.orderListOnlineTotal;

export const getOrderListOnline = (state: AppReducer.AppState) => state.order.orderListOnline;

export const getOrderDetail = (state: AppReducer.AppState) => state.order.orderDetail;

export const getOrderSearchList = (state: AppReducer.AppState) => state.order.orderSearchList;