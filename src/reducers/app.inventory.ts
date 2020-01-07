import InventoryInterfaceMap, { InventoryInterface } from '../constants/inventory/inventory';
import merge from 'lodash.merge';

export declare namespace InventoryReducer {
  namespace Reducers {
    interface ReceiveStockDetailReducer {
      type: typeof InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_STOCK_DETAIL;
      payload: {data: InventoryInterface.InventoryStockDetail};
    }

    interface ReceiveStockListReducer {
      type: typeof InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_INVENTORY_LIST;
      payload: { rows: InventoryInterface.InventoryStockDetail[], field: InventoryInterface.InventoryStockListFetchField };
    }
  } 
  
  interface State {
    inventoryList: InventoryInterface.InventoryStockDetail[];
    stockDetail: InventoryInterface.InventoryStockDetail;
  }

  type Action = 
    Reducers.ReceiveStockDetailReducer |
    Reducers.ReceiveStockListReducer;
}

export const initState: InventoryReducer.State = {
  inventoryList: [],
  stockDetail: {} as any,
};

export default function inventory (state: InventoryReducer.State = initState, action: InventoryReducer.Action): InventoryReducer.State {
  switch (action.type) {

    case InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_STOCK_DETAIL: {
      const { payload } = action as InventoryReducer.Reducers.ReceiveStockDetailReducer;
      const { data } = payload;
      return {
        ...state,
        stockDetail: data
      };
    }

    case InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_INVENTORY_LIST: {
      const { payload } = action as InventoryReducer.Reducers.ReceiveStockListReducer;
      const { rows, field } = payload;
      if (field.pageNum === 1) {
        return {
          ...state,
          inventoryList: rows
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

export const getInventoryStockDetail = (state: any) => state.inventory.stockDetail;

export const getInventoryStockList = (state: any) => state.inventory.inventoryList;