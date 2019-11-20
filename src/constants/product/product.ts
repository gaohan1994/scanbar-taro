
/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:10:53 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-19 16:59:15
 * 
 * @todo [商品相关的类型定义]
 */

import { jsonToQueryString } from "../index";
import { HTTPInterface } from '..';

export declare namespace ProductInterface {

  /**
   * 
   * @param {cost} 进货价
   * @param {limitNum} 库存下限预警
   * @param {memberPrice} 会员价
   * @param {merchantId} 商户id
   * @param {number} 库存
   * @param {price} 售价
   * @param {saleType} 销售类型（0：按件卖[默认]；1称重）
   * @param {status} 状态(0：启用;1：停用)
   * @param {type} 品类id
   * @param {barcode} 条码
   * @param {brand} 品牌
   * @param {pictures} 图片
   * @param {standard} 规格
   * @param {supplier} 供应商名称
   * @param {unit} 单位
   * @author Ghan
   * @interface ProductInfo
   */
  interface ProductInfo {
    id: number;
    cost: number;         // 进货价
    limitNum: number;     // 库存下限预警
    memberPrice: number;  // 会员价
    merchantId: number;   // 商户id
    number: number;       // 库存
    price: number;        // 售价
    saleType: number;     // 销售类型（0：按件卖[默认]；1称重）
    status: number;       // 状态(0：启用;1：停用)
    type: number;         // 品类id
    typeName: string;     // 品类名称
    barcode: string;      // 条码
    brand: string;        // 品牌
    pictures: string;     // 图片
    standard: string;     // 规格
    supplier: string;     // 供应商名称
    unit: string;         // 单位
    firstLetter: string;  // 首字母 
    name: string;
    updateBy: string;
    createBy: string;
    createTime: string;
    updateTime: string;
  }

  interface ProductTypeInfo {
    name: string;
    id: number;
    createTime: string;
  }

  interface IndexProducList {
    title: string;
    key: string;
    data: ProductInterface.ProductInfo[];
  }

  interface ProductList {
    typeInfo: ProductTypeInfo;
    productList: ProductInfo[];
  }

  interface ProductInfoGetListFetchFidle {
    words: string;
  }

  interface ProductInfoListFetchFidle extends Partial<HTTPInterface.FetchField> {
    barcode?: string;        // 条码
    brand?: string;          // 品牌
    id?: number;             // 商品id
    name?: string;           // 商品名称
    orderByColumn?: string;  // 排序 amount desc
    status?: number;         // 商品状态
    supplierId?: number;     // 供应商
    type?: number;           // 品类
  }

  interface ProductType {
    id: number;
    name: string;
    createTime: string;
  }

  interface ProductSupplier {
    id: number;
    merchantId: number;
    name: string;
    contactName: string;
    phoneNumber: string;
    address: string;
    remark: string;
    createTime: string;
    updateTime: string;
  }

  interface ProductDetailFetchFidle {
    id: number;
  }

  type RECEIVE_PRODUCT_LIST = string;
  type RECEIVE_PRODUCT_SEARCH_LIST = string;
  type RECEIVE_PRODUCT_MANAGE_LIST = string;
  type RECEIVE_PRODUCT_TYPE = string;
  type RECEIVE_PRODUCT_SUPPLIER = string;
  type RECEIVE_PRODUCT_DETAIL = string;

  interface ReducerInterface {
    RECEIVE_PRODUCT_LIST: RECEIVE_PRODUCT_LIST;
    RECEIVE_PRODUCT_SEARCH_LIST: RECEIVE_PRODUCT_SEARCH_LIST;
    RECEIVE_PRODUCT_MANAGE_LIST: RECEIVE_PRODUCT_MANAGE_LIST;
    RECEIVE_PRODUCT_TYPE: RECEIVE_PRODUCT_TYPE;
    RECEIVE_PRODUCT_SUPPLIER: RECEIVE_PRODUCT_SUPPLIER;
    RECEIVE_PRODUCT_DETAIL: RECEIVE_PRODUCT_DETAIL;
  }
}

interface ProductInterfaceMap {
  reducerInterfaces: ProductInterface.ReducerInterface;
  productInfoType: string;
  productInfoSupplier: string;
  productInfoEdit: string;
  productInfoGetList (params?: ProductInterface.ProductInfoGetListFetchFidle): string;
  productInfoList (params?: ProductInterface.ProductInfoListFetchFidle): string;
  productInfoDetail (params: ProductInterface.ProductDetailFetchFidle): string;
}

class ProductInterfaceMap {

  public reducerInterfaces = {
    RECEIVE_PRODUCT_LIST: 'RECEIVE_PRODUCT_LIST',
    RECEIVE_PRODUCT_SEARCH_LIST: 'RECEIVE_PRODUCT_SEARCH_LIST',
    RECEIVE_PRODUCT_MANAGE_LIST: 'RECEIVE_PRODUCT_MANAGE_LIST',
    RECEIVE_PRODUCT_TYPE: 'RECEIVE_PRODUCT_TYPE',
    RECEIVE_PRODUCT_SUPPLIER: 'RECEIVE_PRODUCT_SUPPLIER',
    RECEIVE_PRODUCT_DETAIL: 'RECEIVE_PRODUCT_DETAIL',

  };

  public productInfoType = '/product/productInfo/type';
  public productInfoSupplier = '/product/productInfo/supplier';
  public productInfoEdit = '/product/productInfo/edit';

  public productInfoGetList = (params?: ProductInterface.ProductInfoGetListFetchFidle) => {
    return `/product/productInfo/getList${params ? jsonToQueryString(params) : ''}`;
  }

  public productInfoList = (params?: ProductInterface.ProductInfoListFetchFidle) => {
    return `/product/productInfo/list${params ? jsonToQueryString(params) : ''}`;
  }

  public productInfoDetail = (params: ProductInterface.ProductDetailFetchFidle) => {
    return `/product/productInfo/detail/${params.id}`;
  }
}

export default new ProductInterfaceMap();