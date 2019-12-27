import productSdk, { ProductCartInterface } from "./product.sdk";
import { AppReducer } from "../../../reducers";
import { ProductInterface } from "../../../constants";
import merge from 'lodash.merge';

/**
 * @Author: Ghan 
 * @Date: 2019-11-22 14:20:31 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-26 11:56:25
 * @todo productsdk
 */
export declare namespace ProductSDKReducer {

  interface SuspensionCartBase {
    suspension: {
      date: number;
    };
    productCartList: Array<ProductCartInterface.ProductCartInfo>;
  }
  interface State {
    productCartList: Array<ProductCartInterface.ProductCartInfo>;
    changeWeightProduct: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo;
    nonBarcodeProduct?: Partial<ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo>;
    suspensionCartList: Array<SuspensionCartBase>;
    changeProduct?: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo;
    changeProductVisible: boolean;
  }

  interface AddSuspensionCartPayload {
    payload: {
      productCartList: Array<ProductCartInterface.ProductCartInfo>;
    };
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
      suspension?: number;
    };
  }

  namespace Reducers {
    interface EmptySuspensionAction {
      type: ProductCartInterface.EMPTY_SUSPENSION_CART;
      payload: any;
    }

    interface DeleteSuspensionAction {
      type: ProductCartInterface.DELETE_SUSPENSION_CART;
      payload: { suspension: number };
    }

    interface ManageCartList {
      type: ProductCartInterface.MANAGE_CART;
      payload: { productCartList: ProductCartInterface.ProductCartInfo[] };
    }
    
    interface ChangeProductAction {
      type: ProductCartInterface.CHANGE_PRODUCT;
      payload: { 
        product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo;
        sellNum?: number;
        changePrice?: number;
      };
    }

    interface ChangeProductVisible {
      type: ProductCartInterface.CHANGE_PRODUCT_VISIBLE;
      payload: { 
        visible: boolean,
        product?: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo;
      };
    }
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
    suspension?: number;
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
    | Reducers.DeleteSuspensionAction
    | Reducers.EmptySuspensionAction
    | Reducers.ManageCartList
    | Reducers.ChangeProductAction
    | Reducers.ChangeProductVisible
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
  changeWeightProduct: {} as any,
  nonBarcodeProduct: {},
  changeProduct: {} as any,
  changeProductVisible: false,
};

export default function productSDKReducer (
  state: ProductSDKReducer.State = initState, 
  action: ProductSDKReducer.Action
): ProductSDKReducer.State {
  switch (action.type) {
    case productSdk.reducerInterface.CHANGE_PRODUCT_VISIBLE: {
      const { payload } = action as ProductSDKReducer.Reducers.ChangeProductVisible;
      console.log('payload: ', payload);
      const { visible, product } = payload; 
      return {
        ...state,
        changeProductVisible: visible,
        changeProduct: product
      };
    }

    case productSdk.reducerInterface.CHANGE_PRODUCT: {
      const { payload } = action as ProductSDKReducer.Reducers.ChangeProductAction;
      const { product, sellNum, changePrice } = payload;
      
      const index = state.productCartList.findIndex(p => p.id === product.id);
      if (index !== -1) {
        const nextList: ProductCartInterface.ProductCartInfo[] = merge([], state.productCartList);
        const prevProduct = merge({}, state.productCartList[index]);
        let newProduct: ProductCartInterface.ProductCartInfo = { 
          ...product, 
          sellNum: typeof sellNum === 'number' ? sellNum : prevProduct.sellNum,
        };
        if (typeof changePrice === 'number') {
          newProduct.changePrice = changePrice;
        }
        nextList[index] = newProduct;
        return {
          ...state,
          productCartList: nextList
        };
      }

      let newProduct: ProductCartInterface.ProductCartInfo = { 
        ...product, 
        sellNum: typeof sellNum === 'number' ? sellNum : 1,
      };
      if (typeof changePrice === 'number') {
        newProduct.changePrice = changePrice;
      }
      const nextList = merge([], state.productCartList);
      nextList.push(newProduct);
      return {
        ...state,
        productCartList: nextList
      };
    }

    case productSdk.reducerInterface.DELETE_SUSPENSION_CART: {
      const { payload } = action as ProductSDKReducer.Reducers.DeleteSuspensionAction;
      const { suspension } = payload;

      /**
       * @todo 如果没找到则直接返回state
       */
      const currentSuspensionIndex = state.suspensionCartList.findIndex(s => s.suspension.date === suspension);
      if (currentSuspensionIndex === -1) {
        return { ...state };
      }

      /**
       * @todo 把对应的suspension挂单删除
       */
      let nextSuspensionList: ProductSDKReducer.SuspensionCartBase[] = merge([], state.suspensionCartList);
      nextSuspensionList.splice(currentSuspensionIndex, 1);
      return {
        ...state,
        suspensionCartList: nextSuspensionList
      };
    }

    case productSdk.reducerInterface.EMPTY_SUSPENSION_CART: {
      return {
        ...state,
        suspensionCartList: []
      };
    }

    case productSdk.reducerInterface.MANAGE_CART: {
      const { payload } = action as ProductSDKReducer.Reducers.ManageCartList;
      const { productCartList } = payload;
      return {
        ...state,
        productCartList
      };
    }

    case productSdk.reducerInterface.CHANGE_NON_BARCODE_PRODUCT: {
      const { payload: { nonBarcodeProduct } } = action;
      return {
        ...state,
        nonBarcodeProduct
      };
    }
    case productSdk.reducerInterface.EMPTY_SUSPENSION_CART: {
      return {
        ...state,
        suspensionCartList: []
      };
    }
    
    case productSdk.reducerInterface.ADD_SUSPENSION_CART: {
      const { payload } = action as ProductSDKReducer.AddSuspensionCartPayload;
      const { productCartList } = payload;
      const date: number = Number(new Date());
      const suspensionCart: ProductSDKReducer.SuspensionCartBase = {
        suspension: { date },
        productCartList
      };
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
      const { payload } = action as ProductSDKReducer.ProductManageCart;
      const { product, type, suspension } = payload;

      if (!!suspension) {
        // 如果是挂单的话修改挂单中的商品,首先找到这个挂单list没找到直接返回
        const currentSuspensionIndex = state.suspensionCartList.findIndex(s => s.suspension.date === suspension);
        if (currentSuspensionIndex === -1) {
          return { ...state };
        }

        let nextSuspensionList: ProductSDKReducer.SuspensionCartBase[] = merge([], state.suspensionCartList);
        // 找到这个商品的位置, 挂单购物车中一定有这个商品否则直接返回
        const currentProductIndex = nextSuspensionList[currentSuspensionIndex].productCartList.findIndex(p => p.id === product.id);
        if (currentProductIndex === -1) {
          return { ...state };
        }
        
        if (type === productSdk.productCartManageType.ADD) {
          // 将该商品数量+1
          nextSuspensionList[currentSuspensionIndex].productCartList[currentProductIndex].sellNum += 1;
        } else {
          // 商品数量-1 如果只有一个则删除该商品
          const currentProduct = nextSuspensionList[currentSuspensionIndex].productCartList[currentProductIndex];
          currentProduct.sellNum === 1
            ? nextSuspensionList[currentSuspensionIndex].productCartList.splice(currentProductIndex, 1)
            : nextSuspensionList[currentSuspensionIndex].productCartList[currentProductIndex].sellNum -= 1;
        }
        return {
          ...state,
          suspensionCartList: nextSuspensionList
        };
      }

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
      const { payload } = action as ProductSDKReducer.ProductManageWeightCart;
      const { product, type, suspension } = payload;

      if (!!suspension) {
        // 挂单称重商品不存在+ 只有-
        if (type === productSdk.productCartManageType.ADD) {
          return { ...state };
        }

        // 如果是挂单的话修改挂单中的商品,首先找到这个挂单list没找到直接返回
        const currentSuspensionIndex = state.suspensionCartList.findIndex(s => s.suspension.date === suspension);
        if (currentSuspensionIndex === -1) {
          return { ...state };
        }

        const nextSuspensionList: ProductSDKReducer.SuspensionCartBase[] = merge([], state.suspensionCartList);
        // 找到这个商品的位置, 挂单购物车中一定有这个商品否则直接返回
        const currentProductIndex = nextSuspensionList[currentSuspensionIndex].productCartList.findIndex(p => p.id === product.id);
        if (currentProductIndex === -1) {
          return { ...state };
        }

        nextSuspensionList[currentSuspensionIndex].productCartList.splice(currentProductIndex, 1);
        return { 
          ...state,
          suspensionCartList: nextSuspensionList
        }; 
      }

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

export const getNonBarcodeProduct = (state: AppReducer.AppState) => state.productSDK.nonBarcodeProduct;

export const getChangeProductVisible = (state: AppReducer.AppState) => state.productSDK.changeProductVisible;

export const getChangeProduct = (state: AppReducer.AppState) => state.productSDK.changeProduct;