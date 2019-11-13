import productService from "../constants/product/product.service";
import { ResponseCode, ProductInterfaceMap } from '../constants/index';
import { store } from '../app';

class ProductAction {
  public productInfoGetList = async (params?: any) => {
    const result = await productService.productInfoGetList();
    console.log('result: ', result);
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
}

export default new ProductAction();