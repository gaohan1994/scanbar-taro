import { jsonToQueryString } from '../index';

/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:09:10 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-08 11:07:43
 */

/**
 * @todo [查询会员列表的请求参数]
 */
interface MemberInfoListParams {
  cardNo?: number;
  merchantId?: number;
  phoneNumber?: string;
  sex?: number;
  username?: string;
}

export interface MemberInfoAddParams {
  birthDate?: string;
  cardNo?: string;
  faceId?: string;
  id?: number;
  merchantId: number;
  phoneNumber: string;
  sex: string;
  status: number;
  username: string;
}

interface MemberInterfaceMap {
  memberInfoList: (params?: MemberInfoListParams) => string;
  memberInfoAdd: string;
}

class MemberInterfaceMap {
  public memberInfoAdd = '/memberInfo/add';
  /**
   * @todo [请求会员列表]
   *
   * @memberof MemberInterfaceMap
   */
  public memberInfoList = (params?: MemberInfoListParams) => {
    return `/memberInfo/list${params ? jsonToQueryString(params) : ''}`;
  }
}

export default new MemberInterfaceMap();