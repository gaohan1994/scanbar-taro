import { ResponseCode, ProductInterfaceMap, ProductInterface, ProductService } from '../constants/index';
import { store } from '../app';

class ProductAction {

  public toogleShare = async (token?: boolean) => {
    store.dispatch({
      type: ProductInterfaceMap.reducerInterfaces.TOOGLE_SHARE,
      payload: typeof token === 'boolean' ? token : undefined
    });
  }

  public setShare = async (product, show: boolean = true) => {
    store.dispatch({
      type: ProductInterfaceMap.reducerInterfaces.SET_SHARE,
      payload: product
    });
    this.toogleShare(show);
  }

  public productInfoList = async (params?: ProductInterface.ProductInfoListFetchFidle) => {
    const result = await ProductService.productInfoList(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_PAGING_LIST,
        // payload: result.data
        payload: {
          ...result.data,
          page: (params && params.pageNum) || 1
        }
      });
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }

  public productOrderInfoList = async (params?: ProductInterface.ProductInfoListFetchFidle) => {
    const result = await ProductService.productInfoList(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        // type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_LIST,
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_PAGING_LIST,
        payload: {
          ...result.data,
          page: (params && params.pageNum) || 1
        }
      });
    }
    return result;
  }

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
        // type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_SEARCH_LIST,
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_PAGING_LIST,
        payload: {
          ...result.data,
          page: (params && params.pageNum) || 1
        }
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

  public productInfoType = async () => {
    const result = await ProductService.productInfoType();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_TYPE,
        payload: result.data
      });
      return result;
    } else {
      return result;
    }
  }

  public productInfoSupplier = async () => {
    const result = await ProductService.productInfoSupplier();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_SUPPLIER,
        payload: result.data
      });
      return result;
    } else {
      return result;
    }
  }

  public productInfoDetail = async (params: ProductInterface.ProductDetailFetchFidle) => {
    const result = await ProductService.productInfoDetail(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_DETAIL,
        payload: result.data
      });
      return result;
    } else {
      return result;
    }
  }

  public productInfoEdit = async (params: Partial<ProductInterface.ProductInfo>) => {
    return ProductService.productInfoEdit(params);
  }

  public productRefund = async (params: ProductInterface.CashierRefund) => {
    return ProductService.cashierRefund(params);
  }
}

export default new ProductAction();