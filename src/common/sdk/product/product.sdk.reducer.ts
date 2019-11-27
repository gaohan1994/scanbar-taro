import productSdk, { ProductCartInterface } from "./product.sdk";
import { AppReducer } from "../../../reducers";
import { ProductInterface } from "../../../constants";
import merge from 'lodash/merge';
import moment from 'moment';

/**
 * @Author: Ghan 
 * @Date: 2019-11-22 14:20:31 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-26 11:22:43
 * @todo productsdk
 */
export declare namespace ProductSDKReducer {

  interface SuspensionCartBase {
    suspension: {
      date: string;
    };
    productCartList: Array<ProductCartInterface.ProductCartInfo>;
  }
  interface State {
    productCartList: Array<ProductCartInterface.ProductCartInfo>;
    changeWeightProduct: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo;
    suspensionCartList: Array<SuspensionCartBase>;
  }

  interface AddSuspensionCartPayload {
    payload: {
      productCartList: Array<ProductCartInterface.ProductCartInfo>;
    }
  }

  interface ManageSuspensionCartPayload {
    payload: SuspensionCartBase;
  }

  /**
   * @todo 添加/减少 普通商品
   *
   * @author Ghan
   * @interface ProductManageCart
   */
  interface ProductManageCart {
    type: ProductCartInterface.MANAGE_CART_PRODUCT;
    payload: {
      product: ProductInterface.ProductInfo;
      type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce;
    };
  }

  /**
   * @todo 添加/减少 称重商品
   *
   * @author Ghan
   * @interface ProductManageWeightCart
   */
  interface ProductManageWeightCartPayload {
    product: ProductCartInterface.ProductCartInfo;
    type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce;
  }
  interface ProductManageWeightCart {
    type: ProductCartInterface.MANAGE_CART_WEIGHT_PRODUCT;
    payload: ProductManageWeightCartPayload;
  }
  interface ChangeWeightModalPayload {
    product: ProductInterface.ProductInfo;
  }

  type Action = 
    ProductManageCart 
    | ProductManageWeightCart
    | {
      type: 
        ProductCartInterface.ADD_SUSPENSION_CART 
        | ProductCartInterface.DELETE_SUSPENSION_CART
        | ProductCartInterface.EMPTY_SUSPENSION_CART;
      payload: any;
    };
}

const initState: ProductSDKReducer.State = {
  productCartList: [],
  suspensionCartList: [],
  changeWeightProduct: {
    id: -1,
    cost: -1,
    limitNum: -1,
    memberPrice: -1,
    merchantId: -1,
    number: -1,
    price: -1,
    saleType: -1,
    status: -1,
    type: -1,
    typeName: '',
    barcode: '',
    brand: '',
    pictures: '',
    standard: '',
    supplier: '',
    unit: '',
    firstLetter: '',
    name: '',
    updateBy: '',
    createBy: '',
    createTime: '',
    updateTime: '',
  }
};

export default function productSDKReducer (
  state: ProductSDKReducer.State = initState, 
  action: ProductSDKReducer.Action
): ProductSDKReducer.State {
  switch (action.type) {
    case productSdk.reducerInterface.EMPTY_SUSPENSION_CART: {
      return {
        ...state,
        suspensionCartList: []
      };
    }
    
    case productSdk.reducerInterface.ADD_SUSPENSION_CART: {
      const { payload } = action as ProductSDKReducer.AddSuspensionCartPayload;
      const { productCartList } = payload;
      const date = moment().format('MM-DD HH:mm');
      const suspensionCart: ProductSDKReducer.SuspensionCartBase = {
        suspension: { date },
        productCartList
      };
      console.log('suspensionCart ', suspensionCart);
      const newSuspensionList = merge([], state.suspensionCartList);
      newSuspensionList.push(suspensionCart);
      return {
        ...state,
        suspensionCartList: newSuspensionList,
        productCartList: [],
      };
    }
    case productSdk.reducerInterface.DELETE_SUSPENSION_CART: {
      return {
        ...state
      };
    }
    case productSdk.reducerInterface.MANAGE_EMPTY_CART: {
      return {
        ...state,
        productCartList: [],
      };
    }
    case productSdk.reducerInterface.MANAGE_CART_PRODUCT: {
      const { payload: { product, type } } = action;
      const productCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], state.productCartList);
      const index = productCartList.findIndex(p => p.id === product.id);
      if (type === productSdk.productCartManageType.ADD) {
        /**
         * @todo [如果是普通商品，如果购物车中有了则+1]
         * @todo [如果是普通商品，如果购物车中没有则新增一个数量为1]
         */
        if (index === -1) {
          let newProductCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], productCartList);
          newProductCartList.push({
            ...product,
            sellNum: 1
          });
          return {
            ...state,
            productCartList: newProductCartList
          };
        } else {
          let newProductCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], productCartList);
          newProductCartList[index].sellNum += 1;
          return {
            ...state,
            productCartList: newProductCartList
          };
        }
      } else {
        if (index !== -1) {
          let newProductCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], productCartList);
          const currentItem = newProductCartList[index];
          if (currentItem.sellNum === 1) {
            newProductCartList.splice(index, 1);
            return {
              ...state,
              productCartList: newProductCartList,
            };
          } else {
            newProductCartList[index].sellNum -= 1;
            return {
              ...state,
              productCartList: newProductCartList
            };
          }
        } else {
          return {...state};
        }
      }
    }
    case productSdk.reducerInterface.MANAGE_CART_WEIGHT_PRODUCT: {
      const { payload }: { payload: any } = action;
      const { product, type }: ProductSDKReducer.ProductManageWeightCartPayload = payload;
      const productCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], state.productCartList);
      const index = productCartList.findIndex(p => p.id === product.id);
      if (type === productSdk.productCartManageType.ADD) {
        /**
         * @todo [如果是称重商品且购物车中已经有了，则直接修改数量]
         * @todo [如果是称重商品购物车中没有，添加一个]
         */
        if (index === -1) {
          let newProductCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], productCartList);
          newProductCartList.push(product);
          return {
            ...state,
            productCartList: newProductCartList
          };
        } else {
          let newProductCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], productCartList);
          newProductCartList[index] = product;
          return {
            ...state,
            productCartList: newProductCartList
          };
        }
      } else {
        if (index !== -1) {
          let newProductCartList: Array<ProductCartInterface.ProductCartInfo> = merge([], productCartList);
          newProductCartList.splice(index, 1);
          return {
            ...state,
            productCartList: newProductCartList
          };
        } else {
          return {
            ...state
          };
        }
      }
    }
    case productSdk.reducerInterface.CHANGE_WEIGHT_PRODUCT_MODAL: {
      const { payload } = action;
      const { product } = payload as ProductSDKReducer.ChangeWeightModalPayload;
      return {
        ...state,
        changeWeightProduct: product
      };
    }
    default: {
      return {
        ...state
      };
    }
  } 
}

export const getProductCartList = (state: AppReducer.AppState) => state.productSDK.productCartList;

export const getChangeWeigthProduct = (state: AppReducer.AppState) => state.productSDK.changeWeightProduct;

export const getSuspensionCartList = (state: AppReducer.AppState) => state.productSDK.suspensionCartList;