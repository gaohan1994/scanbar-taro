/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-13 17:35:46
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

  public profileEdit = async (params: any): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.post(MerchantInterfaceMap.profileEdit, params);
    return result;
  }

  public profileResetPwd = async (params: any): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.post(MerchantInterfaceMap.profileResetPwd, params);
    return result;
  }

  public merchantInfoEdit = async (params: any) => {
    const result = await requestHttp.post(MerchantInterfaceMap.merchantInfoEdit, params);
    return result;
  }
}

export default new MerchantService();