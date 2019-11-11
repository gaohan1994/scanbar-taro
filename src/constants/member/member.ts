/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:09:10 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 17:40:23
 */
import { jsonToQueryString, HTTPInterface } from '../index';

export declare namespace MemberInterface {

  /**
   * @todo [会员主页数据需要用到的数据格式，根据时间来排序]
   *
   * @author Ghan
   * @interface MemberListByDate
   */
  interface MemberListByDate {
    date: string;
    data: MemberInfo[];
  }

  /**
   * @todo [标准会员数据]
   * @interface MemberInfo
   */
  interface MemberInfo extends MemberInfoAddParams {
    createTime: string;
    id: number;
  }
  /**
   * @todo [添加会员时的参数]
   *
   * @author Ghan
   * @interface MemberInfoAddParams
   */
  interface MemberInfoAddParams {
    id?: number;
    birthDate?: string;
    cardNo?: string;
    faceId?: string;
    merchantId: number;
    phoneNumber: string;
    sex: string;
    status: number;
    username: string;
  }

  /**
   * @todo [请求会员列表时的请求参数]
   *
   * @author Ghan
   * @interface MemberInfoListFetchFidle
   * @extends {HTTPInterface.FetchField}
   */
  interface MemberInfoListFetchFidle extends HTTPInterface.FetchField {
    cardNo?: string;
    merchantId?: number;
    orderByColumn?: string;
    phoneNumber?: string;
    sex?: string;
    username?: string;
  }

  /**
   * @todo [搜索会员的参数]
   *
   * @author Ghan
   * @interface MemberInfoSearchFidle
   * @extends {HTTPInterface.FetchField}
   */
  interface MemberInfoSearchFidle extends MemberInfoListFetchFidle {
    // identity: string;
  }

  type RECEIVE_MEMBER_LIST = string;

  type MemberReducerType = RECEIVE_MEMBER_LIST;
  interface MemberReducerInterface {
    RECEIVE_MEMBER_LIST: RECEIVE_MEMBER_LIST;
  }
  
}
interface MemberInterfaceMap {
  reducerInterfaces: MemberInterface.MemberReducerInterface;
  memberInfoAdd: string;
  memberInfoList(params?: MemberInterface.MemberInfoListFetchFidle): string;
  memberInfoSearch(params?: {identity: string}): string;
}

class MemberInterfaceMap {
  /**
   * @todo [会员reducer的类型定义]
   *
   * @memberof MemberInterfaceMap
   */
  public reducerInterfaces = {
    RECEIVE_MEMBER_LIST: 'RECEIVE_MEMBER_LIST'
  };
  
  public memberInfoAdd = '/memberInfo/add';
  /**
   * @todo [请求会员列表]
   *
   * @memberof MemberInterfaceMap
   */
  public memberInfoList = (params?: MemberInterface.MemberInfoListFetchFidle) => {
    return `/memberInfo/list${params ? jsonToQueryString(params) : ''}`;
  }

  public memberInfoSearch = (params?: {identity: string}) => {
    return `/memberInfo/detail/${jsonToQueryString(params)}`;
  }
}

export default new MemberInterfaceMap();