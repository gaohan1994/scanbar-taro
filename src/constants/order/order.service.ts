/**
 * @Author: Ghan 
 * @Date: 2019-11-13 10:16:32 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-10 10:00:47
 */
import requestHttp from "../../common/request/request.http";
import { OrderInterfaceMap, OrderInterface, HTTPInterface } from '..';

class OrderService {
  public orderList = async (params?: OrderInterface.OrderListFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(OrderInterfaceMap.orderList(params));
  }

  public orderDetail = async (params: OrderInterface.OrderDetailFetchField): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(OrderInterfaceMap.orderDetail(params));
  }

  public orderRefund = async (params: OrderInterface.RefundByOrderPayload): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(`/cashier/refundByOrder`, params);
  }
}

export default new OrderService();