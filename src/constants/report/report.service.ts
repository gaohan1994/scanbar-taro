/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-13 15:01:06
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
import ReportInterfaceMap, { ReportInterface } from "./report";

class ReportService {

  public reportWeeksData = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`/report/getWeekDays`);
    return result;
  }

  public reportBaseSaleInfo = async (params?: ReportInterface.ReportBaseFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`${ReportInterfaceMap.reportBaseSaleInfo}${jsonToQueryString(params)}`);
    return result;
  }
  public reportTodayData = async (params?: ReportInterface.ReportTodayDataFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`${ReportInterfaceMap.reportTodayData}${jsonToQueryString(params)}`);
    return result;
  }
  public reportCurrentInventory = async (params?: {merchantId: number | undefined}): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`/product/stock/getCurrentInventory${jsonToQueryString(params)}`)
    return result
  };
  
}

export default new ReportService();