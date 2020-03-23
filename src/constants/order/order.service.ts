/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:16:32 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-18 17:49:29
 */
import requestHttp from "../../common/request/request.http";
import { OrderInterfaceMap, OrderInterface, HTTPInterface } from '..';

class OrderService {

  public orderFinishRefund = async (orderNo: string): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/order/finishRefund/${orderNo}`, {});
  }

  public orderSend = async (orderNo: string): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/order/send`, {orderNo});
  }

  public orderConfirmRefund = async (orderNo: string): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/order/confirmRefund/${orderNo}`, {});
  }

  public orderRefuseRefund = async (orderNo: string): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/order/refuseRefund/${orderNo}`, {});
  }

  public orderReceive = async (orderNo: string): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/order/receive/${orderNo}`, {});
  }

  public orderList = async (params?: OrderInterface.OrderListFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(OrderInterfaceMap.orderList(params));
  }

  public orderDetail = async (params: OrderInterface.OrderDetailFetchField): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(OrderInterfaceMap.orderDetail(params));
  }

  public orderRefund = async (params: OrderInterface.RefundByOrderPayload): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/cashier/refundByOrder`, params);
  }

  public orderCount = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get('/order/count');
  }
}

export default new OrderService();