/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-04-01 14:40:20
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
import { store } from "../../app";

class MerchantService {

  public activityInfoList = async () => {
    const merchant = await store.getState().merchant.profileInfo;
    const result = await requestHttp.get(`/activityInfo/list/${merchant.merchantInfoDTO.id}`);
    return result;
  }

  public getMemberCoupons = async (params: any) => {
    const result = await requestHttp.get(`/coupon/getMemberCoupons${jsonToQueryString(params)}`);
    return result;
  }

  public getByCode = async (params: any) => {
    const result = await requestHttp.post(`${MerchantInterfaceMap.couponGetAbleToUseCoupon}`, params);
    return result;
  }

  public couponList = async (params: any) => {
    const result = await requestHttp.post(`${MerchantInterfaceMap.couponGetAbleToUseCoupon}`, params);
    return result;
  }
  public couponGetMemberExpiredCoupons = async (params: any) => {
    const result = await requestHttp.get(`${MerchantInterfaceMap.couponGetMemberExpiredCoupons}${jsonToQueryString(params)}`);
    return result;
  }
  public couponGetByCode = async (code: string | number) => {
    const result = await requestHttp.get(`${MerchantInterfaceMap.couponGetByCode}/${code}`);
    return result;
  }
  public couponGetAbleToUseCoupon = async (params: any) => {
    const result = await requestHttp.post(`${MerchantInterfaceMap.couponGetAbleToUseCoupon}`, params);
    return result;
  }

  public merchantSubList = async (): Promise<HTTPInterface.ResponseResultBase<any>> => {
    const result = await requestHttp.get(`/merchantInfo/listSubMerchant`);
    return result;
  }

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