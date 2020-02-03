/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-21 11:41:49
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

  public reportList = async (params: ReportInterface.ReportListFetchField): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`${ReportInterfaceMap.reportList}${jsonToQueryString(params)}`);
    return result;
  }
  public reportProductRank = async (params: ReportInterface.ReportRankFetchField): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`${ReportInterfaceMap.reportProductRank}${jsonToQueryString(params)}`);
    return result;
  }
  public reportBaseSaleInfo = async (params?: ReportInterface.ReportBaseFetchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`${ReportInterfaceMap.reportBaseSaleInfo}${jsonToQueryString(params)}`);
    return result;
  }
}

export default new ReportService();