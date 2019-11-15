import { ResponseCode, ProductInterfaceMap, ProductInterface, ProductService } from '../constants/index';
import { store } from '../app';

class ProductAction {
  public productInfoGetList = async (params?: any) => {
    const result = await ProductService.productInfoGetList();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_LIST,
        payload: result.data
      });
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }

  public productInfoSearchList = async (params: ProductInterface.ProductInfoGetListFetchFidle) => {
    const result = await ProductService.productInfoGetList(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_SEARCH_LIST,
        payload: result.data
      });
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }

  public productInfoEmptySearchList = async () => {
    store.dispatch({
      type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_SEARCH_LIST,
      payload: []
    });
  }
}

export default new ProductAction();