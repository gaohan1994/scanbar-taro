
/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:10:53 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-13 11:00:41
 * 
 * @todo [商品相关的类型定义]
 */

import { jsonToQueryString } from "../index";

export declare namespace ProductInterface {
  interface ProductInfo {
    id: number;
    cost: number;
    limitNum: number;
    memberPrice: number;
    merchantId: number;
    number: number;
    price: number;
    saleType: number;
    status: number;
    type: number;
    barcode: string;
    brand: string;
    createBy: string;
    createTime: string;
    pictures: string;
    name: string;
    standard: string;
    supplier: string;
    unit: string;
    updateBy: string;
    updateTime: string;
  }

  interface ProductTypeInfo {
    name: string;
    id: number;
    createTime: string;
  }

  interface ProductList {
    typeInfo: ProductTypeInfo;
    productList: ProductInfo[];
  }

  interface ProductInfoGetListFetchFidle {
    words: string;
  }

  type RECEIVE_PRODUCT_LIST = string;

  interface ReducerInterface {
    RECEIVE_PRODUCT_LIST: RECEIVE_PRODUCT_LIST;
  }
}

interface ProductInterfaceMap {
  productInfoGetList (params?: ProductInterface.ProductInfoGetListFetchFidle): string;
}

class ProductInterfaceMap {

  public reducerInterfaces: ProductInterface.ReducerInterface = {
    RECEIVE_PRODUCT_LIST: 'RECEIVE_PRODUCT_LIST'
  };

  public productInfoGetList = (params?: ProductInterface.ProductInfoGetListFetchFidle) => {
    return `/product/productInfo/getList${params ? jsonToQueryString(params) : ''}`;
  }
}

export default new ProductInterfaceMap();