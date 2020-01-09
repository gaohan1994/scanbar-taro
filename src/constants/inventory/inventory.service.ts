/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-09 14:48:04
 * 
 * @todo [盘点相关的接口]
 * ```js
 * import MemberService from 'MemberService';
 * 
 * MemberService.xx();
 * ```
 */

import requestHttp from "../../common/request/request.http";
import { HTTPInterface, jsonToQueryString } from '../index';
import { InventoryInterface } from "./inventory";
import InventoryInterfaceMap from './inventory';

class MemberService {

  public stockReceiveAdd = async (params: InventoryInterface.Interfaces.StockAdd): 
    Promise<HTTPInterface.ResponseResultBase<InventoryInterface.InventoryStockDetail>> => {
    const result = await requestHttp.post(InventoryInterfaceMap.stockAdd, params);
    return result;
  }

  public stockDetail = async (id: string): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(InventoryInterfaceMap.stockDetail(id));
    return result;
  }

  public stockList = async (params: InventoryInterface.InventoryStockListFetchField): 
    Promise<HTTPInterface.ResponseResultBase<InventoryInterface.InventoryStockDetail[]>> => {
    const result = await requestHttp.get(`${InventoryInterfaceMap.stockList}${jsonToQueryString(params)}`);
    return result;
  }
  
  public stockCheck = async (params: InventoryInterface.Interfaces.StockCheck):
    Promise<HTTPInterface.ResponseResultBase<any>> => {
      const result = await requestHttp.post(InventoryInterfaceMap.stockCheck, params);
      return result;
  }

  public merchantStockDetail = async (id: string) => {
    const result = await requestHttp.get(`${InventoryInterfaceMap.merchantStockDetail(id)}`);
    return result;
  }

  public merchantStockList = async (params: InventoryInterface.InventoryStockListFetchField):
    Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`${InventoryInterfaceMap.merchantStockList}${jsonToQueryString(params)}`);
    return result;
  }
}

export default new MemberService();