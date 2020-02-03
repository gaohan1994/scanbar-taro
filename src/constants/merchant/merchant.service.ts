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
import MerchantInterfaceMap, { MerchantInterface } from "./merchant";

class MerchantService {

  public merchantInfoDetail = async (): Promise<HTTPInterface.ResponseResultBase<MerchantInterface.MerchantDetail>> => {
    const result = await requestHttp.get(`${MerchantInterfaceMap.merchantInfoDetail}`);
    return result;
  }

  public merchantInfoAdd = async (params: MerchantInterface.PayloadInterface.MerchantInfoAdd): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.post(MerchantInterfaceMap.merchantInfoAdd, params);
    return result;
  }

  public profileInfo = async (): Promise<HTTPInterface.ResponseResultBase<MerchantInterface.ProfileInfo>> => {
    const result = await requestHttp.get(MerchantInterfaceMap.profileInfo);
    return result;
  }
}

export default new MerchantService();