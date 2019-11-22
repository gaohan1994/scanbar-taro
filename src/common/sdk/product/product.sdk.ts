/**
 * @Author: Ghan 
 * @Date: 2019-11-22 11:12:09 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-22 17:05:19
 * 
 * @todo 购物车、下单模块sdk
 * ```ts
 * import ProductSDK from 'xx/ProductSDK';
 * 
 * ProductSDK.add(product);
 * ProductSDK.reduce(product);
 * 
 * ProductSDK.manage({
 *  type: 'add',
 *  product: product,
 * });
 * ```
 */
import { ProductInterface } from '../../../constants';
import { store } from '../../../app';
import { ProductSDKReducer } from './product.sdk.reducer';

export declare namespace ProductCartInterface {
  interface ProductCartInfo extends ProductInterface.ProductInfo {
    sellNum: number;
  }

  interface ProductOrderPayload {
    authCode: string;     // 权限码 -1/为空=非被扫
    orderNo: string;      // 订单号,用于再次支付
    terminalCd: string;   // 终端号,获取不到填-1
    terminalSn: string;   // 终端序列号,获取不到填-1
    discount: number;     // 优惠价格
    erase: number;        // 抹零金额
    memberId: number;     // 会员id，非会员设为-1
    orderSource: number;  // 订单来源 0=收银机,1=微信,2=终端
    payType: number;      // 支付方式 0=现金,1=支付宝主扫,2=微信主扫,3=支付宝被扫,4微信被扫,5=银行卡,6=刷脸
    totalAmount: number;  // 交易总金额=交易金额就好
    totalNum: number;     // 商品总数量
    transAmount: number;  // 实付金额
  }

  interface ProductOrderActivity {
    auditTime: string;    // 审核时间
    auditor: string;      // 审核人
    createBy: string;     // 创建者
    createTime: string;   // 创建日期
    docMaker: string;     // 制单人
    endTime: string;      // 活动结束时间
    id: number;           // 业务单号id（促销活动id）
    isDeleted: number;    // 是否删除 0:否 1:是
    makeTime: string;     // 制单时间
    merchantId: number;   // 促销门店号
    name: string;         // 促销活动名称
    startTime: string;    // 活动开始时间
    status: string;       // 活动状态(0-未审核，1-已审核)
    type: string;         // 促销模式(1-特价，2-满金额减，3-满件打折，4-满件赠送)
    updateBy: string;     // 更新者
    updateTime: string;   // 更新日期
  }

  interface ProductPayPayload {
    flag: boolean;
    order: ProductOrderPayload;
    pic?: string;
    productInfoList: Array<{
      activities: ProductOrderActivity;
      barcode: string;
      brand: string;
      discountAmount: number;
      discountType: number;
      productId: number;
      productName: string;
      sellNum: number;
      standard: string;
      totalAmount: number;
      transAmount: number;
      type: number;
    }>;
  }

  type MANAGE_CART_PRODUCT = string;
  type MANAGE_CART_WEIGHT_PRODUCT = string;
  type CHANGE_WEIGHT_PRODUCT_MODAL = string;

  type ReducerInterface = {
    MANAGE_CART_PRODUCT: MANAGE_CART_PRODUCT;
    MANAGE_CART_WEIGHT_PRODUCT: MANAGE_CART_WEIGHT_PRODUCT;
    CHANGE_WEIGHT_PRODUCT_MODAL: CHANGE_WEIGHT_PRODUCT_MODAL;
  };

  type ProductCartAdd = string;
  type ProductCartReduce = string;
  type ProductCartManageType = {
    ADD: string;
    REDUCE: string;
  };

  interface ProductSDKManageInterface {
    type: ProductCartAdd | ProductCartReduce;
    product: ProductInterface.ProductInfo | ProductCartInfo;
  }
}

class ProductSDK {

  public productCartManageType: ProductCartInterface.ProductCartManageType = {
    ADD: 'ADD',
    REDUCE: 'REDUCE',
  };

  public reducerInterface: ProductCartInterface.ReducerInterface = {
    MANAGE_CART_PRODUCT: 'MANAGE_CART_PRODUCT',
    MANAGE_CART_WEIGHT_PRODUCT: 'MANAGE_CART_WEIGHT_PRODUCT',
    CHANGE_WEIGHT_PRODUCT_MODAL: 'CHANGE_WEIGHT_PRODUCT_MODAL',
  };
  
  public isWeighProduct (product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo): product is ProductCartInterface.ProductCartInfo {
    return product.saleType === 1;
  }

  /**
   * @todo 判断是否是称重商品，如果是称重商品显示称重modal
   * @todo 如果不是称重商品则+1
   *
   * @memberof ProductSDK
   */
  public add = (product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo, sellNum?: number) => {
    if (this.isWeighProduct(product)) {
      const reducer: ProductSDKReducer.ProductManageWeightCart = {
        type: this.reducerInterface.MANAGE_CART_WEIGHT_PRODUCT,
        payload: {
          type: this.productCartManageType.ADD,
          product: {
            ...product,
            sellNum: sellNum || 1
          }
        }
      };
      store.dispatch(reducer);
    } else {
      const reducer: ProductSDKReducer.ProductManageCart = {
        type: this.reducerInterface.MANAGE_CART_PRODUCT,
        payload: {
          type: this.productCartManageType.ADD,
          product
        }
      };
      store.dispatch(reducer);
    }
  }

  /**
   * @todo 判断是否是称重商品，如果是称重商品则直接删除这一条
   * @todo 如果不是称重商品则-1，如果=1则删掉这一条
   *
   * @memberof ProductSDK
   */
  public reduce = (product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo) => {
    console.log('reduce');
  }

  public manage = (params: ProductCartInterface.ProductSDKManageInterface) => {
    const { product, type } = params;

    if (this.isWeighProduct(product)) {
      if (type === this.productCartManageType.ADD) {
        store.dispatch({
          type: this.reducerInterface.CHANGE_WEIGHT_PRODUCT_MODAL,
          payload: { product }
        });
      } else {
        this.reduce(product);
      }
    } else {
      if (type === this.productCartManageType.ADD) {
        this.add(product);
      } else {
        this.reduce(product);
      }
    }
  }

  public closeWeightModal = () => {
    store.dispatch({
      type: this.reducerInterface.CHANGE_WEIGHT_PRODUCT_MODAL,
      payload: {product: {}}
    });
  }
}

export default new ProductSDK();