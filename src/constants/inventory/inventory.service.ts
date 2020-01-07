/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-07 14:43:35
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
}

export default new MemberService();