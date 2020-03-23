
/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:10:53 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-19 13:50:44
 * 
 * @todo [商品相关的类型定义]
 */

import { jsonToQueryString } from "../index";
import { HTTPInterface } from '..';

export declare namespace OrderInterface {

  interface RefundByOrderPayloadOrder {
    orderNo: string;
    terminalCd: string;
    terminalSn: string;
    orderSource: number;
    payType: number;
    refundByPreOrder: boolean;
    transAmount: number;
  }
  interface RefundByOrderItem {
    isDamaged: boolean;
    priceChangeFlag: boolean;
    remark: string;
    changeNumber: number;
    orderDetailId: number;
    unitPrice: number;
  }
  interface RefundByOrderPayload {
    order: RefundByOrderPayloadOrder;
    productInfoList: RefundByOrderItem[];
  }

  interface OrderDetailItem {
    id: number;
    costAmount: number;
    discountAmount: number;
    discountType: number;
    merchantId: number;
    num: number;
    picUrl: string;
    productId: number;
    profit: number;
    totalAmount: number;
    transAmount: number;
    type: number;
    unitPrice: number;
    productName: string;
    remark: string;
    standard: string;
    barcode: string;
    brand: string;
    orderNo: string;
    originPrice?: number;
  }

  interface OrderInfo {
    detail: string;
    deliveryType: number;
    deliveryFee: number;
    deliveryTime: string;
    refundStatus: number;
    remark: string;
    levelId: number;
    levelName: string;
    avatar: string;
    memberId: number;
    memberName:  string;
    memberPhone: string;
    createTime: string;
    address: string;
    couponDiscount: number;
    planDeliveryTime: string;
    receiver: string;
    receiverPhone: string;
    merchantName: string;
    orderNo: string;
    originOrderNo: string;
    platformNo: string;
    terminalCd: string;
    terminalSn: string;
    transTime: string;
    username: string;
    cashierId: number;
    discount: number;
    erase: number;
    merchantId: number;
    orderSource: number;
    payType: number;
    totalAmount: number;
    totalNum: number;
    transAmount: number;
    transFlag: number;
    transType: number;
  }

  interface OrderCount {
    inTransNum: number;
    initNum: number;
    waitForReceiptNum: number;
    refundApplying: number;
    waitForDelivery: number;
    waitForSend: number;
  }

  interface OrderRefundListItem {
    couponDiscount: number;
    discount: number;
    erase: number;
    memberDiscount: number;
    memberId: number;
    merchantId: number;
    numDiscount: number;
    orderSource: number;
    payType: number;
    reduceDiscount: number;
    totalAmount: number;
    totalNum: number;
    transAmount: number;
    transFlag: number;
    transType: number;
    createTime: string;
    orderNo: string;
    orderPhone: string;
    originOrderNo: string;
    remark: string;
    transTime: string;
  }

  interface OrderRefundIndiceItem {
    id: number;
    leftNum: number;
    orderDetailId: number;
    refundNum: number;
    transFlag: number;
    createTime: string;
    originOrderNo: string;
    refundOrderNo: string;
    refundingTime: string;
    updateTime: string;
  }
  interface OrderDetail {
    order: OrderInfo;
    orderNo: string;
    orderDetailList?: Array<OrderDetailItem>;
    orderRefundIndices?: OrderRefundIndiceItem[];
    refundOrderList?: OrderRefundListItem[];
  }

  interface OrderListFetchFidle extends HTTPInterface.FetchField {
    cashierId?: number;
    memberId?: number;
    transFlags?: any;
    merchantId?: number;
    orderByColumn?: string;
    orderNo?: string;
    orderSource?: number;
    payType?: number;
    terminalCd?: string;
    terminalSn?: string;
    transFlag?: number;
    transType?: number;
    startTime?: string;
    endTime?: string;
  }

  interface OrderDetailFetchField { 
    orderNo: string;
  }

  type RECEIVE_ORDER_DETAIL = string;
  type RECEIVE_ORDER_LIST = string;
  type RECEIVE_ORDER_COUNT = string;

  type ReducerInterface = {
    RECEIVE_ORDER_LIST: RECEIVE_ORDER_LIST;
    RECEIVE_ORDER_DETAIL: RECEIVE_ORDER_DETAIL;
    RECEIVE_ORDER_COUNT: RECEIVE_ORDER_COUNT;
  };

  interface OrderInterfaceMapImp {
    reducerInterfaces: ReducerInterface;
    orderList: (params: OrderListFetchFidle) => string;
    orderDetail: (params: OrderDetailFetchField) => string;
  }  
}

class OrderInterfaceMap implements OrderInterface.OrderInterfaceMapImp {

  public reducerInterfaces = {
    RECEIVE_ORDER_LIST: 'RECEIVE_ORDER_LIST',
    RECEIVE_ORDER_DETAIL: 'RECEIVE_ORDER_DETAIL',
    RECEIVE_ORDER_SEARCH_LIST: 'RECEIVE_ORDER_SEARCH_LIST',
    RECEIVE_ORDER_COUNT: 'RECEIVE_ORDER_COUNT',
  };

  public orderList = (params?: OrderInterface.OrderListFetchFidle) => {
    return `/order/list${params ? jsonToQueryString(params) : ''}`;
  }

  public orderDetail = (params: OrderInterface.OrderDetailFetchField) => {
    return `/order/detail/${params.orderNo}`;
  }
}

export default new OrderInterfaceMap();