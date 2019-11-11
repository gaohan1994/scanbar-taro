/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:01:17 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-08 11:05:44
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
import { MemberInfoAddParams } from './member';
import { HTTPInterface } from '../index';

class MemberService {
  
  /**
   * @todo [请求会员列表]
   *
   * @memberof MemberService
   */
  public memberList = async (params?: any): Promise<HTTPInterface.ResponseArray<any>> => {
    return requestHttp.get(MemberInterfaceMap.memberInfoList(params));
  }

  /**
   * @todo [添加会员]
   *
   * @memberof MemberService
   */
  public memberAdd = async (params: MemberInfoAddParams): Promise<HTTPInterface.ResponseResultBase<any>> => {
    return requestHttp.post(MemberInterfaceMap.memberInfoAdd, params);
  }
}

export default new MemberService();