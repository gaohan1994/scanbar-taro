import { InventoryService, InventoryInterface, InventoryInterfaceMap } from "../constants";
import { ResponseCode } from '../constants/index';
import productSdk, { ProductCartInterface } from '../common/sdk/product/product.sdk';
import { store } from '../app';
import numeral from 'numeral';

class InventoryAction {
  public stockAdd = async (params: InventoryInterface.Interfaces.StockAdd, callback?: any, duration: number = 1000) => {
    const result = await InventoryService.stockReceiveAdd(params);
    if (result.code === ResponseCode.success && !callback) {
      setTimeout(() => {
        this.stockSuccessCallback();  
      }, duration);
    }
    return result;
  }

  public getProductPayload = (products: ProductCartInterface.ProductCartInfo[]): InventoryInterface.InventoryProduct[] => {
    return products.map((product) => {
      const amount = typeof product.changePrice === 'number' 
        ? product.changePrice
        : (product.unitPrice || 0);
      return {
        amount: amount,
        number: product.sellNum,
        productId: product.id,
        subtotal: numeral(amount * product.sellNum).format('0.00') as any
      };
    });
  }

  /**
   * @todo [根据businessNumber查询进货单详情并存入redux]
   *
   * @memberof InventoryAction
   */
  public stockDetail = async (id: string) => {
    const result = await InventoryService.stockDetail(id);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_STOCK_DETAIL,
        payload: result
      });
    }
    return result;
  }

  /**
   * @todo [盘点详情]
   *
   * @memberof InventoryAction
   */
  public merchantStockDetail = async (id: string) => {
    const result = await InventoryService.merchantStockDetail(id);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: InventoryInterfaceMap.reducerInterface.RECEIVE_MERCHANT_STOCK_DETIAL,
        payload: result
      });
    }
    return result;
  }

  /**
   * @todo [进货/退货成功之后的回调]
   * @todo [清空购物车]
   */
  public stockSuccessCallback = (sort: string = productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE) => {
    const reducer = {
      type: productSdk.reducerInterface.MANAGE_EMPTY_CART,
      payload: { sort }
    };
    store.dispatch(reducer);
  }

  public inventoryStockList = async (params: InventoryInterface.InventoryStockListFetchField) => {
    const result = await InventoryService.stockList(params);
    if (result.code === ResponseCode.success) {
      const reducer = {
        type: InventoryInterfaceMap.reducerInterface.RECEIVE_PURCHASE_INVENTORY_LIST,
        payload: {
          ...result.data,
          field: params
        }
      };
      store.dispatch(reducer);
    }
    return result;
  }

  public merchantStockList = async (params: InventoryInterface.InventoryStockListFetchField) => {
    const result = await InventoryService.merchantStockList(params);
    if (result.code === ResponseCode.success) {
      const reducer = {
        type: InventoryInterfaceMap.reducerInterface.RECEIVE_MERCHANT_STOCK_LIST,
        payload: {
          ...result.data,
          field: params
        }
      };
      store.dispatch(reducer);
    }
    return result;
  }

  /**
   * @todo [把进货详情里的商品从新组合数据并返回]
   *
   * @memberof InventoryAction
   */
  public inventoryCopyPurchase = (stockDetail: InventoryInterface.InventoryStockDetail): ProductCartInterface.ProductCartInfo[] => {
    const { detailList } = stockDetail;
    const productList: ProductCartInterface.ProductCartInfo[] = detailList.map((item) => {
      let product = {
        id: item.productId,
        cost: item.itemCost,
        sellNum: item.number,
        name: item.productName,
        // pictures: item.,
        unit: item.unit,
        price: item.itemPrice
      } as any;
      if (item.perCost !== item.itemCost) {
        product.changePrice = item.perCost;
      }
      return product;
    });
    return productList;
  }

  /**
   * @todo []
   *
   * @memberof InventoryAction
   */
  public inventoryStockCheck = async (params: InventoryInterface.Interfaces.StockCheck) => {
    const result = await InventoryService.stockCheck(params);
    return result;
  }
}

export default new InventoryAction();