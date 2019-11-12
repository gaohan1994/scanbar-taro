/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:09:10 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-12 11:00:49
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

  interface MemberInfoEditParams extends MemberInfoAddParams { }

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
  interface MemberInfoSearchFidle extends MemberInfoListFetchFidle { }

  /**
   * @todo [请求会员详情的参数]
   *
   * @author Ghan
   * @interface MemberInfoDetail
   */
  interface MemberInfoDetail { 
    id: number;
  }

  type RECEIVE_MEMBER_LIST = string;
  type RECEIVE_MEMBER_DETAIL = string;

  interface MemberReducerInterface {
    RECEIVE_MEMBER_LIST: RECEIVE_MEMBER_LIST;
    RECEIVE_MEMBER_DETAIL: RECEIVE_MEMBER_DETAIL;
  }
  
}
interface MemberInterfaceMap {
  reducerInterfaces: MemberInterface.MemberReducerInterface;
  memberInfoAdd: string;
  memberInfoEdit: string;
  memberInfoList(params?: MemberInterface.MemberInfoListFetchFidle): string;
  memberInfoSearch(params?: MemberInterface.MemberInfoSearchFidle): string;
}

class MemberInterfaceMap {
  /**
   * @todo [会员reducer的类型定义]
   *
   * @memberof MemberInterfaceMap
   */
  public reducerInterfaces = {
    RECEIVE_MEMBER_LIST: 'RECEIVE_MEMBER_LIST',
    RECEIVE_MEMBER_DETAIL: 'RECEIVE_MEMBER_DETAIL',
  };
  
  public memberInfoAdd = '/memberInfo/add';

  public memberInfoEdit = '/memberInfo/edit';
  /**
   * @todo [请求会员列表]
   *
   * @memberof MemberInterfaceMap
   */
  public memberInfoList = (params?: MemberInterface.MemberInfoListFetchFidle) => {
    return `/memberInfo/list${params ? jsonToQueryString(params) : ''}`;
  }

  public memberInfoSearch = (params?: MemberInterface.MemberInfoSearchFidle) => {
    return `/memberInfo/detail/${jsonToQueryString(params)}`;
  }

  public memberInfoDetail = (params: MemberInterface.MemberInfoDetail) => {
    return `/memberInfo/detail/${params.id}`;
  }
}

export default new MemberInterfaceMap();