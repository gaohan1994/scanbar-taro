/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-27 16:34:25
 * 
 * @todo [会员相关的接口]
 * ```js
 * import MemberService from 'MemberService';
 * 
 * MemberService.xx();
 * ```
 */

import requestHttp from "../../common/request/request.http";
import MemberInterfaceMap from './member';
import { MemberInterface } from './member';
import { HTTPInterface } from '../index';

class MemberService {
  
  /**
   * @todo [请求会员列表]
   *
   * @memberof MemberService
   */
  public memberList = async (params?: any): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberInfoList(params));
  }

  /**
   * @todo [添加会员]
   *
   * @memberof MemberService
   */
  public memberAdd = async (params: MemberInterface.MemberInfoAddParams): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(MemberInterfaceMap.memberInfoAdd, params);
  }

  public memberSearch = async (params?: MemberInterface.MemberInfoSearchFidle): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberInfoSearch(params));
  }

  public memberDetail = async (params: MemberInterface.MemberInfoDetail): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberInfoDetail(params));
  }

  public memberEdit = async (params: MemberInterface.MemberInfoEditParams): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(MemberInterfaceMap.memberInfoEdit, params);
  }

  public memberDetailByPreciseInfo = async (params: MemberInterface.MemberByPreciseInfo): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberDetailByPreciseInfo(params));
  }

  public memberPreference = async (params: MemberInterface.MemberInfoDetail): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberPreference(params));
  }

  public memberOrderInfo = async (params: MemberInterface.MemberInfoDetail): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberOrderInfo(params));
  }
}

export default new MemberService();