// import InventoryInterfaceMap, { InventoryInterface } from '../constants/inventory/inventory';
import merge from 'lodash.merge';
// import { AppReducer } from './';

export declare namespace InventoryReducer {
  // namespace Reducers {
  //   interface ReceiveStockDetailReducer {
  //     type: typeof InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_STOCK_DETAIL;
  //     payload: { data: InventoryInterface.InventoryStockDetail };
  //   }

  //   interface ReceiveMerchantStockDetailReducer {
  //     type: typeof InventoryInterfaceMap.reducerInterface.RECEIVE_MERCHANT_STOCK_DETIAL;
  //     payload: { data: InventoryInterface.InventoryStockDetail };
  //   }

  //   interface ReceiveStockListReducer {
  //     type: typeof InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_INVENTORY_LIST;
  //     payload: { rows: InventoryInterface.InventoryStockDetail[], field: InventoryInterface.InventoryStockListFetchField, total: number };
  //   }
    
  //   interface ReceiveMerchantListReducer {
  //     type: typeof InventoryInterfaceMap.reducerInterface.RECEIVE_MERCHANT_STOCK_LIST;
  //     payload: { rows: InventoryInterface.InventoryStockDetail[], field: InventoryInterface.InventoryStockListFetchField };
  //   }
  // } 
  
  // interface State {
  //   inventoryList: InventoryInterface.InventoryStockDetail[];
  //   inventoryListTotal: number;
  //   merchantStockList: InventoryInterface.InventoryStockDetail[];
  //   stockDetail: InventoryInterface.InventoryStockDetail;
  //   merchantStockDetail: InventoryInterface.InventoryStockDetail;
  // }

  type State = any;
  type Action = any;

  // type Action = 
  //   Reducers.ReceiveStockDetailReducer |
  //   Reducers.ReceiveStockListReducer;
}

export const initState: InventoryReducer.State = {
  inventoryList: [],
  inventoryListTotal: 0,
  merchantStockList: [],
  stockDetail: {} as any,
  merchantStockDetail: {} as any,
};

export default function inventory (state: InventoryReducer.State = initState, action: InventoryReducer.Action): InventoryReducer.State {
  switch (action.type) {

    // case InventoryInterfaceMap.reducerInterface.RECEIVE_MERCHANT_STOCK_DETIAL: {
      // const { payload } = action as InventoryReducer.Reducers.ReceiveMerchantStockDetailReducer;
    case 'RECEIVE_MERCHANT_STOCK_DETIAL': {
      const { payload } = action;
      const { data } = payload;
      return {
        ...state,
        merchantStockDetail: data
      };
    }

    // case InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_STOCK_DETAIL: {
    //   const { payload } = action as InventoryReducer.Reducers.ReceiveStockDetailReducer;
    case 'RECEIVE_PURCHASE_STOCK_DETAIL': {
      const { payload } = action;
      const { data } = payload;
      return {
        ...state,
        stockDetail: data
      };
    }

    // case InventoryInterfaceMap.reducerInterface.RECEIVE_MERCHANT_STOCK_LIST: {
    //   const { payload } = action as InventoryReducer.Reducers.ReceiveMerchantListReducer;
    case 'RECEIVE_MERCHANT_STOCK_LIST': {
      const { payload } = action;
      const { rows, field } = payload;
      if (field.pageNum === 1) {
        return {
          ...state,
          merchantStockList: rows
        };
      }
      const prevList = merge([], state.merchantStockList);
      return {
        ...state,
        merchantStockList: prevList.concat(rows)
      };
    }

    // case InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_INVENTORY_LIST: {
    //   const { payload } = action as InventoryReducer.Reducers.ReceiveStockListReducer;
    case 'RECEIVE_PURCHASE_INVENTORY_LIST': {
      const { payload } = action;
      const { rows, field, total } = payload;
      if (field.pageNum === 1) {
        return {
          ...state,
          inventoryList: rows,
          inventoryListTotal: total
        };
      }
      const prevList = merge([], state.inventoryList);
      return {
        ...state,
        inventoryList: prevList.concat(rows)
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
}

export const getInventoryStockDetail = (state: any /** AppReducer.AppState */) => state.inventory.stockDetail;

export const getInventoryStockList = (state: any /** AppReducer.AppState */) => state.inventory.inventoryList;

export const getInventoryStockListTotal = (state: any /** AppReducer.AppState */) => state.inventory.inventoryListTotal;

export const getMerchantStockDetail = (state: any /** AppReducer.AppState */) => state.inventory.merchantStockDetail;

export const getMerchantStockList = (state: any /** AppReducer.AppState */) => state.inventory.merchantStockList;
