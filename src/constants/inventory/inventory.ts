import { HTTPInterface } from '..';

export declare namespace InventoryInterface {

  interface InventoryProduct {
    amount: number;
    number: number;
    productId: number;
    subtotal: number;
  }

  interface InventoryProductDetail {
    changedNumber: number;
    cost: number;
    flag: number;
    id: number;
    merchantId: number;
    number: number;
    originNumber: number;
    productId: number;
    supplierId: number;
    type: number;
    barcode: string;
    changeId: string;
    createTime: string;
    productName: string;
    reason: string;
    standard: string;
    updateTime: string;
  }

  interface InventoryStockDetail {
    amount: number;
    merchantId: number;
    status: number;
    supplierId: number;
    supplierName: number;
    type: number;
    businessNumber: string;
    docMaker: string;
    makeTime: string;
    planBusinessNumber: string;
    detailList: InventoryProductDetail[];
  }

  interface InventoryStockListFetchField extends HTTPInterface.FetchField {
    businessNumber?: number;
    endTime?: string;
    merchantId?: number;
    orderByColumn?: string;
    startTime?: string;
    status?: number;
    supplierId?: number;
    type?: number;
  }

  namespace Interfaces {

    interface StockAdd {
      productList: InventoryProduct[];
      planNumber?: number;
      supplierId: number;
    }

    interface StockCheck {
      productList: InventoryProduct[];
      remark: string;
    }
  }

  interface InventoryInterfaceMap {
    reducerInterface: {
      RECEIVE_PURCHASE_INVENTORY_LIST: string;
      RECEIVE_PURCHASE_STOCK_DETAIL: string;
    };
    stockCheck: string;
    stockAdd: string;
    stockList: string;
    stockDetail: (id: string) => string;
  }
}

class InventoryInterfaceMap implements InventoryInterface.InventoryInterfaceMap {

  public reducerInterface = {
    RECEIVE_PURCHASE_INVENTORY_LIST: 'RECEIVE_PURCHASE_INVENTORY_LIST',
    RECEIVE_PURCHASE_STOCK_DETAIL: 'RECEIVE_PURCHASE_STOCK_DETAIL',
  };

  public stockCheck = '/purchase/stock/check';
  public stockAdd = '/purchase/stock/receive/add';
  public stockList = '/purchase/stock/list';
  public stockDetail = (id: string) => `/purchase/stock/detail/${id}`;
}

export default new InventoryInterfaceMap();