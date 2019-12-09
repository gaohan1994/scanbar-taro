
/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:10:53 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-09 14:02:01
 * 
 * @todo [商品相关的类型定义]
 */

import { jsonToQueryString } from "../index";
import { HTTPInterface } from '..';

export declare namespace OrderInterface {

  interface OrderDetailItem {
    costAmount: number;
    discountAmount: number;
    discountType: number;
    merchantId: number;
    num: number;
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
  }

  interface OrderInfo {
    detail: string;
    merchantName: string;
    orderNo: string;
    platformNo: string;
    terminalCd: string;
    terminalSn: string;
    transTime: string;
    username: string;
    cashierId: number;
    discount: number;
    erase: number;
    memberId: number;
    merchantId: number;
    orderSource: number;
    payType: number;
    totalAmount: number;
    totalNum: number;
    transAmount: number;
    transFlag: number;
    transType: number;
  }

  interface OrderDetail {
    order: OrderInfo;
    orderDetailList?: Array<OrderDetailItem>;
  }

  interface OrderListFetchFidle extends HTTPInterface.FetchField {
    cashierId?: number;
    memberId?: number;
    merchantId?: number;
    orderByColumn?: string;
    orderNo?: string;
    orderSource?: number;
    payType?: number;
    terminalCd?: string;
    terminalSn?: string;
    transFlag?: number;
    transType?: number;
  }

  interface OrderDetailFetchField { 
    orderNo: string;
  }

  type RECEIVE_ORDER_LIST = string;

  type ReducerInterface = {
    RECEIVE_ORDER_LIST: RECEIVE_ORDER_LIST;
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
  };

  public orderList = (params?: OrderInterface.OrderListFetchFidle) => {
    return `/order/list${params ? jsonToQueryString(params) : ''}`;
  }

  public orderDetail = (params: OrderInterface.OrderDetailFetchField) => {
    return `/order/detail/${params.orderNo}`;
  }
}

export default new OrderInterfaceMap();