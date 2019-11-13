
/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:26:45 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-13 10:44:46
 */

import { ProductInterface, ProductInterfaceMap } from "../constants";
import { AppReducer } from './index';

export declare namespace ProductReducer {
  interface InitState {
    productList: Array<ProductInterface.ProductList>;
  }

  interface Action {
    type: 
      ProductInterface.RECEIVE_PRODUCT_LIST;
    payload: any;
  }
}

const initState: ProductReducer.InitState = {
  productList: [],
};

export default function productReducer (state: ProductReducer.InitState = initState, action: ProductReducer.Action): ProductReducer.InitState {
  switch (action.type) {
    case ProductInterfaceMap.reducerInterfaces.RECEIVE_PRODUCT_LIST: {
      const { payload: { rows } } = action;
      return {
        ...state,
        productList: rows
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
}
export const getProductList = (state: AppReducer.AppState) => state.product.productList;