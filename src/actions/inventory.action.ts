import { InventoryService, InventoryInterface, InventoryInterfaceMap } from "../constants";
import { ResponseCode } from '../constants/index';
import productSdk, { ProductCartInterface } from '../common/sdk/product/product.sdk';
import { store } from '../app';

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
        subtotal: amount * product.sellNum
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
}

export default new InventoryAction();