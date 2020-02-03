/**
 * @Author: Ghan 
 * @Date: 2019-11-22 11:12:09 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-17 09:46:34
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
import Taro from '@tarojs/taro';
import { ProductInterface, ProductService, MemberInterface, HTTPInterface } from '../../../constants';
import { store } from '../../../app';
import { ProductSDKReducer, getSuspensionCartList } from './product.sdk.reducer';
import numeral from 'numeral';
import merge from 'lodash.merge';
import productService from '../../../constants/product/product.service';

export declare namespace ProductCartInterface {
  interface ProductCartInfo extends ProductInterface.ProductInfo {
    sellNum: number;
    changePrice?: number; // 称重商品修改的价格
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

  interface ProductInfoPayload {
    activities: Array<Partial<ProductOrderActivity>>;
    barcode: string;
    brand: string;
    discountAmount: number;
    discountType: number;
    productId: number;
    productName: string;
    sellNum: number;
    standard: string;
    unitPrice: number;
    totalAmount: number;
    transAmount: number;
    type: number;
  }

  interface ProductPayPayload {
    flag: boolean;
    order: ProductOrderPayload;
    pic?: string;
    productInfoList: Array<ProductInfoPayload>;
    transProp: boolean;   // true=正常支付流程,false=订单再次支付],直接收款=true
  }

  interface QueryStatusListItem extends Partial<ProductInterface.ProductInfo> {
    costAmount: number;
    discountAmount: number;
    discountType: number;
    merchantId: number;
    num: number;
    profit: number;
    totalAmount: number;
    transAmount: number;
    type: number;
  }

  interface QueryStatus {
    orderNo: string;
    status: boolean;
    printInfo?: {
      order: ProductOrderPayload;
      orderDetailList: QueryStatusListItem[];
    };
  }

  type MANAGE_CART = string;
  type MANAGE_CART_PRODUCT = string;
  type MANAGE_CART_WEIGHT_PRODUCT = string;
  type CHANGE_WEIGHT_PRODUCT_MODAL = string;
  type MANAGE_EMPTY_CART = string;
  type ADD_SUSPENSION_CART = string;
  type DELETE_SUSPENSION_CART = string;
  type EMPTY_SUSPENSION_CART = string;
  type DELETE_PRODUCT_ITEM = string;
  type CHANGE_NON_BARCODE_PRODUCT = string;
  type CHANGE_PRODUCT = string;
  type CHANGE_PRODUCT_VISIBLE = string;
  type PAYLOAD_ORDER = string;
  type PAYLOAD_REFUND = string;
  type PAYLOAD_PURCHASE = string;
  type PAYLOAD_MANAGE = string;
  type PAYLOAD_STOCK = string;
  
  type PAYLOAD_SORT = {
    PAYLOAD_ORDER: PAYLOAD_ORDER;
    PAYLOAD_REFUND: PAYLOAD_REFUND;
    PAYLOAD_PURCHASE: PAYLOAD_PURCHASE;
    PAYLOAD_MANAGE: PAYLOAD_MANAGE;
    PAYLOAD_STOCK: PAYLOAD_STOCK;
  };

  type ReducerInterface = {
    MANAGE_CART: MANAGE_CART;
    MANAGE_EMPTY_CART: MANAGE_EMPTY_CART;
    MANAGE_CART_PRODUCT: MANAGE_CART_PRODUCT;
    MANAGE_CART_WEIGHT_PRODUCT: MANAGE_CART_WEIGHT_PRODUCT;
    CHANGE_WEIGHT_PRODUCT_MODAL: CHANGE_WEIGHT_PRODUCT_MODAL;
    ADD_SUSPENSION_CART: ADD_SUSPENSION_CART;
    DELETE_SUSPENSION_CART: DELETE_SUSPENSION_CART;
    DELETE_PRODUCT_ITEM: DELETE_PRODUCT_ITEM;
    EMPTY_SUSPENSION_CART: EMPTY_SUSPENSION_CART;
    CHANGE_NON_BARCODE_PRODUCT: CHANGE_NON_BARCODE_PRODUCT;
    CHANGE_PRODUCT: CHANGE_PRODUCT; // 改价和改数量
    CHANGE_PRODUCT_VISIBLE: CHANGE_PRODUCT_VISIBLE; // 改价modal是否显示
    PAYLOAD_SORT: PAYLOAD_SORT;
  };

  type ProductCartAdd = string;
  type ProductCartReduce = string;
  type ProductCartEmpty= string;
  type ProductCartManageType = {
    ADD: ProductCartAdd;
    REDUCE: ProductCartReduce;
    EMPTY: ProductCartEmpty;
  };

  interface ProductSDKManageInterface {
    type: ProductCartAdd | ProductCartReduce | ProductCartEmpty;
    product: ProductInterface.ProductInfo | ProductCartInfo;
    suspension?: number;
    sort?: PAYLOAD_ORDER | PAYLOAD_REFUND;
  }
}

class ProductSDK {

  public nonBarcodeKey: string = 'WM';
  
  public productCartManageType: ProductCartInterface.ProductCartManageType = {
    ADD: 'ADD',
    REDUCE: 'REDUCE',
    EMPTY: 'EMPTY',
  };

  public reducerInterface: ProductCartInterface.ReducerInterface = {
    MANAGE_CART: 'MANAGE_CART',
    MANAGE_EMPTY_CART: 'MANAGE_EMPTY_CART',
    MANAGE_CART_PRODUCT: 'MANAGE_CART_PRODUCT',
    MANAGE_CART_WEIGHT_PRODUCT: 'MANAGE_CART_WEIGHT_PRODUCT',
    CHANGE_WEIGHT_PRODUCT_MODAL: 'CHANGE_WEIGHT_PRODUCT_MODAL',
    ADD_SUSPENSION_CART: 'ADD_SUSPENSION_CART',
    DELETE_SUSPENSION_CART: 'DELETE_SUSPENSION_CART',
    EMPTY_SUSPENSION_CART: 'EMPTY_SUSPENSION_CART',
    CHANGE_NON_BARCODE_PRODUCT: 'CHANGE_NON_BARCODE_PRODUCT',
    CHANGE_PRODUCT: 'CHANGE_PRODUCT',
    CHANGE_PRODUCT_VISIBLE: 'CHANGE_PRODUCT_VISIBLE',
    DELETE_PRODUCT_ITEM: 'DELETE_PRODUCT_ITEM',
    PAYLOAD_SORT: {
      PAYLOAD_ORDER: 'PAYLOAD_ORDER',
      PAYLOAD_REFUND: 'PAYLOAD_REFUND',
      PAYLOAD_PURCHASE: 'PAYLOAD_PURCHASE',
      PAYLOAD_MANAGE: 'PAYLOAD_MANAGE',
      PAYLOAD_STOCK: 'PAYLOAD_STOCK',
    }
  };
  
  /**
   * @param {erase}
   * [抹零金额]
   *
   * @private
   * @type {string}
   * @memberof ProductSDK
   */
  private erase?: string | number;
  /**
   * @param {member} 
   * [会员]
   * @private
   * @type {*}
   * @memberof ProductSDK
   */
  private member?: MemberInterface.MemberInfo;

  /**
   * @param {sort}
   * [类别：order是开单，refund是退货]
   *
   * @private
   * @type {(ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND)}
   * @memberof ProductSDK
   */
  private sort?: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND;

  constructor () {
    this.erase = undefined;
    this.member = undefined;
    this.sort = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER;
  }

  public setErase = (erase?: string): this => {
    this.erase = erase;
    return this;
  }

  public setMember = (member?: MemberInterface.MemberInfo): this => {
    this.member = member;
    return this;
  }

  public setSort = (sort?: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND): this => {
    this.sort = sort ? sort : this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER;
    return this;
  }

  public getErase = (): number => {
    if (this.erase !== undefined) {
      return numeral(this.erase).value();
    } else {
      return 0;
    }
  }

  /**
   * @todo 重置函数
   *
   * @memberof ProductSDK
   */
  public reset = () => {
    this.member = undefined;
    this.erase = 0;
  }

  public getSortDataKey = (sort?: string): string => {
    const data = (sort && typeof sort === 'string') ? sort : this.sort;

    switch (data) {
      case this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER: {
        return 'productCartList';
      }
      case this.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND: {
        return 'productRefundList';
      }
      case this.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE: {
        return 'productPurchaseList';
      }
      case this.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK: {
        return 'productStockList';
      }
      default: {
        return 'productCartList';
      }
    }
  }

  /**
   * @todo 获取商品的数量
   *
   * @memberof ProductSDK
   */
  public getProductNumber = (
    products?: ProductCartInterface.ProductCartInfo[], 
    // sort: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER
  ) => {
    const key = this.getSortDataKey();
    const productList = products !== undefined 
      ? products 
      : store.getState().productSDK[key];
    const reduceCallback = this.sort !== this.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK
      ? (prevTotal: number, item: ProductCartInterface.ProductCartInfo) => prevTotal + item.sellNum
      : (prevTotal: number, item: ProductCartInterface.ProductCartInfo) => prevTotal + (item.sellNum - item.number);
    const total = productList.reduce(reduceCallback, 0);
    return total;
  }

  /**
   * @todo [拿到单个商品的价格，有改价返回改价，有会员价返回会员价，没有就原价]
   */
  public getProductItemPrice = (product: ProductCartInterface.ProductCartInfo) => {
    if (product.changePrice !== undefined) {
      return product.changePrice;
    }
    if (this.member !== undefined) {
      return product.memberPrice || product.price;
    }
    return product.price;
  }

  public getProductsOriginPrice = (products?: ProductCartInterface.ProductCartInfo[]) => {
    const key = this.getSortDataKey();
    const productList = products !== undefined ? products : store.getState().productSDK[key];
    const reduceCallback = (prevTotal: number, item: ProductCartInterface.ProductCartInfo) => {
      if (key === 'productPurchaseList') {
        return prevTotal + (item.cost * item.sellNum);
      }
      return prevTotal + (item.price * item.sellNum);
    };
    const total = productList.reduce(reduceCallback, 0);
    return total;
  }

  /**
   * @todo [获取盈亏金额]
   *
   * @memberof ProductSDK
   */
  public getStockPrice = (products?: ProductCartInterface.ProductCartInfo[]) => {
    const key = this.getSortDataKey();
    const productList = products !== undefined ? products : store.getState().productSDK[key];
    const reduceCallback = (prevTotal: number, item: ProductCartInterface.ProductCartInfo) => {
      const costNumber = item.sellNum - item.number;
      return prevTotal + (costNumber * item.avgCost);
    };
    const total = productList.reduce(reduceCallback, 0);
    return total;
  }

  /**
   * @todo 获取商品的价格
   *
   * @memberof ProductSDK
   */
  public getProductPrice = (
    products?: ProductCartInterface.ProductCartInfo[],
    // sort: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER
  ) => {
    const key = this.getSortDataKey();
    const productList = products !== undefined ? products : store.getState().productSDK[key];
    const reduceCallback = (prevTotal: number, item: ProductCartInterface.ProductCartInfo) => {
      /**
       * @todo [如果没有改价，但是是进货则返回进价]
       */
      if (key === 'productPurchaseList') {
        return prevTotal + (item.cost * item.sellNum);
      }
      /**
       * @todo [如果是盘点，则用盘盈数量乘上平均进价，这个进价字段后面改成avgCost]
       */
      if (this.sort === this.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK) {
        return prevTotal + ((item.sellNum - item.number) * item.avgCost);
      }
      /**
       * @todo 如果有改价价格，则计算改价价格
       */
      if (item.changePrice !== undefined) {
        return prevTotal + (item.changePrice * item.sellNum); 
      }
      return prevTotal + (item.price * item.sellNum);
    };
    const total = productList.reduce(reduceCallback, 0);
    return total;
  }

  /**
   * @todo 获取商品会员价格
   *
   * @memberof ProductSDK
   */
  public getProductMemberPrice = (products?: ProductCartInterface.ProductCartInfo[], force?: boolean): number => {
    const hasMember = force ? force : this.member !== undefined;
    if (hasMember) {
      const productList = products !== undefined ? products : store.getState().productSDK.productCartList;
      const reduceCallback = (prevTotal: number, item: ProductCartInterface.ProductCartInfo) => {

        /**
         * @todo 如果有改价价格，则计算改价价格
         */
        if (item.changePrice !== undefined) {
          return prevTotal + (item.changePrice * item.sellNum); 
        }

        return prevTotal + (item.memberPrice * item.sellNum);
      };
      const total = productList.reduce(reduceCallback, 0);
      return total;
    } else {
      return this.getProductPrice();
    }
  }

  /**
   * @todo 计算交易价格
   * 
   * ```ts
   * import productSdk from 'xxx';
   * 
   * const total = productSdk
   * .setErase(1)
   * .setMember(member)
   * .getProductTransPrice()
   * 
   * ```
   *
   * @memberof ProductSDK
   */
  public getProductTransPrice = () => {
    // 计算如果有会员的话使用会员价格，如果没有会员则返回原价
    let total: number = this.getProductMemberPrice();
    // 抹零价格在会员价之后减去
    total = total - this.getErase();
    return total;
  }

  /**
   * @todo 返回支付需要的数据格式
   * 
   * ```ts
   * import productSdk from 'xxx';
   * const payload = productSdk
   * .setErase(1)
   * .setMember(member)
   * .getProductInterfacePayload()
   * ```
   *
   * @memberof ProductSDK
   */
  public getProductInterfacePayload = (products?: ProductCartInterface.ProductCartInfo[]): ProductCartInterface.ProductPayPayload => {
    const productList = products !== undefined ? products : store.getState().productSDK.productCartList;
    const payload: ProductCartInterface.ProductPayPayload = {
      flag: false,
      order: {
        authCode: '-1',
        discount: 0,
        erase: this.getErase(),
        memberId: this.member !== undefined ? this.member.id : -1,
        orderNo: '',
        orderSource: 1,
        payType: 2,
        terminalCd: '-1',
        terminalSn: '-1',
        totalAmount: this.getProductPrice(),
        totalNum: this.getProductNumber(),
        transAmount: this.getProductTransPrice(),
      },
      productInfoList: productList.map((item) => {
        if (!this.isNonBarcodeProduct(item)) {
          // 如果是称重商品和普通商品，则 改价价格 > 会员价格 > 普通价格
          const itemPrice: number = item.changePrice !== undefined
            ? numeral(item.changePrice).value()
            : this.member !== undefined 
              ? item.memberPrice
              : item.price;
          return {
            activities: [],
            barcode: item.barcode,
            brand: item.brand,
            discountAmount: 0,
            discountType: 0,
            productId: item.id,
            productName: item.name,
            sellNum: item.sellNum,
            standard: item.standard,
            totalAmount: item.price * item.sellNum,
            transAmount: itemPrice * item.sellNum,
            type: item.typeId,
            unitPrice: itemPrice,
          } as ProductCartInterface.ProductInfoPayload;
        } else {
          // 如果是无码商品则特殊处理
          return {
            activities: [],
            sellNum: 1,
            id: null,
            barcode: null,
            price: item.price,
            unitPrice: item.unitPrice,
            totalAmount: item.price * item.sellNum,
            transAmount: item.price * item.sellNum,
          } as any;
        }
      }),
      transProp: true
    };
    return payload;
  }

  public getDirectProductInterfacePayload = (money: number, payType: number = 2): ProductCartInterface.ProductPayPayload  => {
    return {
      flag: true,
      order: {
        authCode: '-1',
        discount: 0,
        erase: 0,
        memberId: -1,
        orderNo: '',
        orderSource: 1,
        payType,
        terminalCd: '-1',
        terminalSn: '-1',
        totalAmount: money,
        totalNum: 0,
        transAmount: money,
      },
      productInfoList: [],
      transProp: true
    };
  }

  public isWeighProduct (product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo): product is ProductCartInterface.ProductCartInfo {
    return product.saleType === 1;
  }

  public isCartProduct (product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo): product is ProductCartInterface.ProductCartInfo {
    return product !== undefined && (<ProductCartInterface.ProductCartInfo> product).sellNum !== undefined;
  }

  public isNonBarcodeProduct (product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo): boolean {
    return String(product.id).startsWith(this.nonBarcodeKey);
  }

  public changeProduct = (
    product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo, 
    sellNum?: number, 
    changePrice?: number,
    sort?: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND,
  ) => {
    store.dispatch({
      type: this.reducerInterface.CHANGE_PRODUCT,
      payload: {
        product,
        sellNum,
        changePrice,
        sort,
      }
    });
  }

  /**
   * @todo 判断是否是称重商品，如果是称重商品显示称重modal
   * @todo 如果不是称重商品则+1
   *
   * @memberof ProductSDK
   */
  public add = (
    product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo, 
    sellNum?: number, 
    suspension?: number,
    sort: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND | ProductCartInterface.PAYLOAD_PURCHASE 
      = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER
  ) => {
    Taro.showToast({
      title: '加入购物车'
    });
    if (this.isWeighProduct(product)) {
      const reducer: ProductSDKReducer.ProductManageWeightCart = {
        type: this.reducerInterface.MANAGE_CART_WEIGHT_PRODUCT,
        payload: {
          type: this.productCartManageType.ADD,
          product: {
            ...product,
            sellNum: sellNum || 1
          },
          suspension,
          sort,
        }
      };
      store.dispatch(reducer);
    } else {
      const reducer: ProductSDKReducer.ProductManageCart = {
        type: this.reducerInterface.MANAGE_CART_PRODUCT,
        payload: {
          type: this.productCartManageType.ADD,
          product,
          suspension,
          sort,
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
  public reduce = (
    product: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo, 
    sellNum?: number, 
    suspension?: number, 
    sort: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER
  ) => {
    if (this.isWeighProduct(product)) {
      const reducer: ProductSDKReducer.ProductManageWeightCart = {
        type: this.reducerInterface.MANAGE_CART_WEIGHT_PRODUCT,
        payload: {
          type: this.productCartManageType.REDUCE,
          product: {
            ...product,
            sellNum: sellNum || 1
          },
          suspension,
          sort,
        }
      };
      store.dispatch(reducer);
    } else {
      const reducer: ProductSDKReducer.ProductManageCart = {
        type: this.reducerInterface.MANAGE_CART_PRODUCT,
        payload: {
          type: this.productCartManageType.REDUCE,
          product,
          suspension,
          sort,
        }
      };
      store.dispatch(reducer);
    }
  }

  public deleteProductItem = (product: ProductCartInterface.ProductCartInfo, sort: string = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER) => {
    store.dispatch({
      type: this.reducerInterface.DELETE_PRODUCT_ITEM,
      payload: {
        product,
        sort,
      }
    });
  }

  public empty = (sort?: string) => {
    store.dispatch({
      type: this.reducerInterface.MANAGE_EMPTY_CART,
      payload: { sort }
    });
  }

  public manage = (params: ProductCartInterface.ProductSDKManageInterface) => {
    const { product, type, suspension, sort } = params;
    if (type === this.productCartManageType.EMPTY) {
      this.empty(sort);
      return;
    }
    if (this.isWeighProduct(product)) {
      // 如果是称重商品
      if (type === this.productCartManageType.ADD) {
        store.dispatch({
          type: this.reducerInterface.CHANGE_WEIGHT_PRODUCT_MODAL,
          payload: { product }
        });
      } else {
        this.reduce(product, undefined, suspension, sort);
      }
    } else if (this.isNonBarcodeProduct(product)) {
      // 如果是无码商品
      if (type === this.productCartManageType.ADD) {
        store.dispatch({
          type: this.reducerInterface.CHANGE_NON_BARCODE_PRODUCT,
          payload: { nonBarcodeProduct: product }
        });
      } else {
        this.reduce(product);
      }
    } else {
      // 如果是其他商品
      if (type === this.productCartManageType.ADD) {
        this.add(product, undefined, suspension, sort);
      } else {
        this.reduce(product, undefined, suspension, sort);
      }
    }
  }

  public manageCart = (productCartList: ProductCartInterface.ProductCartInfo[], sort: string = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER) => {
    const reducer: ProductSDKReducer.Reducers.ManageCartList = {
      type: this.reducerInterface.MANAGE_CART,
      payload: { productCartList, sort }
    };
    return store.dispatch(reducer);
  }

  public closeNonBarcodeModal = () => {
    store.dispatch({
      type: this.reducerInterface.CHANGE_NON_BARCODE_PRODUCT,
      payload: {nonBarcodeProduct: {}}
    });
  }

  public closeWeightModal = () => {
    store.dispatch({
      type: this.reducerInterface.CHANGE_WEIGHT_PRODUCT_MODAL,
      payload: {product: {}}
    });
  }

  public changeProductVisible = (
    visible: boolean, 
    product?: ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo, 
    sort: string = this.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER,
  ) => {
    const reducer: ProductSDKReducer.Reducers.ChangeProductVisible = {
      type: this.reducerInterface.CHANGE_PRODUCT_VISIBLE,
      payload: { 
        visible,
        product,
        sort,
      }
    };
    store.dispatch(reducer);
  }

  public cashierPay = async (params: ProductCartInterface.ProductPayPayload) => {
    const result = await ProductService.cashierPay(params);
    return result;
  }

  public suspensionCart = async () => {
    const state = await store.getState();
    if (state.productSDK.productCartList.length > 0) {
      const reducer: ProductSDKReducer.AddSuspensionCartPayload & { type: ProductCartInterface.ADD_SUSPENSION_CART } = {
        type: this.reducerInterface.ADD_SUSPENSION_CART,
        payload: {
          productCartList: merge([], state.productSDK.productCartList)
        }
      };
      store.dispatch(reducer);
    }
  }

  public scanProduct = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return new Promise((resolve) => {
      Taro
      .scanCode()
      .then(async (barcode) => {
        Taro.showLoading();
        const payload: ProductInterface.ProductInfoScanGetFetchFidle = {
          barcode: barcode.result
        };
        const result = await productService.productInfoScan(payload);
        Taro.hideLoading();
        resolve({
          ...result,
          data: {
            ...result.data || {},
            barcode: barcode.result
          }
        });
      })
      .catch(error => resolve(error));
    });
  }

  public suspensionOrder = async (suspension: number): Promise<{success: boolean}> => {
    const state = await store.getState();
    const suspensionCartList = getSuspensionCartList(state);
    const currentSuspension = suspensionCartList.find(s => s.suspension.date === suspension);
    if (currentSuspension && currentSuspension.productCartList.length > 0) {
      const orderSuspensionList = merge([], currentSuspension.productCartList);
      await this.manageCart(orderSuspensionList);
      setTimeout(() => {
        /**
         * 延后删除挂单防止空页面
         */
        this.deleteSuspension(suspension);
      }, 500);
      return { success: true };
    }
    return { success: false };
  }

  /**
   * @todo [删除挂单如果传入suspension则删除该suspension，如果不传全部删除]
   *
   * @memberof ProductSDK
   */
  public deleteSuspension = (suspension?: number) => {

    if (suspension) {
      const reducer: ProductSDKReducer.Reducers.DeleteSuspensionAction = {
        type: this.reducerInterface.DELETE_SUSPENSION_CART,
        payload: { suspension }
      };
      store.dispatch(reducer);
      return;
    }

    const reducer: ProductSDKReducer.Reducers.EmptySuspensionAction = {
      type: this.reducerInterface.EMPTY_SUSPENSION_CART,
      payload: {}
    };
    store.dispatch(reducer);
    return;
  }
}

export default new ProductSDK();