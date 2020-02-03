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
    itemCost: number;
    itemPrice: number;
    unit: string;
    perCost: number;
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
    number: number;
    supplierId: number;
    supplierName: number;
    type: number;
    productNum: number;
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
    supplierId?: string;
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
      RECEIVE_MERCHANT_STOCK_LIST: string;
      RECEIVE_MERCHANT_STOCK_DETIAL: string;
    };
    stockCheck: string;
    stockAdd: string;
    stockList: string;
    merchantStockList: string;
    stockDetail: (id: string) => string;
    merchantStockDetail: (id: string) => string;
  }
}

export function isInventoryProduct (product: InventoryInterface.InventoryProductDetail | any): product is InventoryInterface.InventoryProductDetail {
  return !!(<InventoryInterface.InventoryProductDetail> product).changeId;
}

class InventoryInterfaceMap implements InventoryInterface.InventoryInterfaceMap {

  public reducerInterface = {
    RECEIVE_PURCHASE_INVENTORY_LIST: 'RECEIVE_PURCHASE_INVENTORY_LIST',
    RECEIVE_PURCHASE_STOCK_DETAIL: 'RECEIVE_PURCHASE_STOCK_DETAIL',
    RECEIVE_MERCHANT_STOCK_LIST: 'RECEIVE_MERCHANT_STOCK_LIST',
    RECEIVE_MERCHANT_STOCK_DETIAL: 'RECEIVE_MERCHANT_STOCK_DETIAL',
  };

  public stockAdd = '/purchase/stock/receive/add';
  public stockList = '/purchase/stock/list';
  public stockCheck = '/merchant/stock/check';
  public merchantStockList = '/merchant/stock/list';
  public merchantStockDetail = (id: string) => `/merchant/stock/detail/${id}`;
  public stockDetail = (id: string) => `/purchase/stock/detail/${id}`;
}

export default new InventoryInterfaceMap();