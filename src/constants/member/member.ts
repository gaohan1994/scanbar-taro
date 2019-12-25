/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:09:10 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-25 14:09:13
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
    lastPayTime: string;
    totalAmount: number;
    totalTimes: number;
  }

  /**
   * @todo [会员消费偏好]
   *
   * @author Ghan
   * @interface MemberPerference
   */
  interface MemberPerference {
    barcode: string;
    productName: string;
    purchaseNum: number;
    purchaseTotalNum: number;
  }

  /**
   * @todo [会员消费信息]
   *
   * @author Ghan
   * @interface MemberOrderInfo
   */
  interface MemberOrderInfo {
    lastPayTime: string;
    totalAmount: number;
    totalTimes: number;
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
    levelId?: number;
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
    identity?: string;
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

  interface MemberLevel {
    id: number;
    merchantId: number;
    levelName: string;
  }

  interface MemberByPreciseInfo {
    identity: string | number;
  }

  type RECEIVE_MEMBER_LIST = string;
  type RECEIVE_MEMBER_DETAIL = string;
  type RECEIVE_MEMBER_PERFERENCE = string;
  type RECEIVE_MEMBER_ORDER_INFO = string;
  type SET_MEMBER_SELECT = string; // 设置添加会员成功之后的回调数据存放处
  type RECEIVE_MEMBER_LEVEL = string;

  interface MemberReducerInterface {
    RECEIVE_MEMBER_LIST: RECEIVE_MEMBER_LIST;
    RECEIVE_MEMBER_DETAIL: RECEIVE_MEMBER_DETAIL;
    RECEIVE_MEMBER_PERFERENCE: RECEIVE_MEMBER_PERFERENCE;
    RECEIVE_MEMBER_ORDER_INFO: RECEIVE_MEMBER_ORDER_INFO;
    SET_MEMBER_SELECT: SET_MEMBER_SELECT;
    RECEIVE_MEMBER_LEVEL: RECEIVE_MEMBER_LEVEL;
  }
  
}
interface MemberInterfaceMap {
  reducerInterfaces: MemberInterface.MemberReducerInterface;
  memberInfoAdd: string;
  memberInfoEdit: string;
  getRandomCaroNo: string;
  memberLevelList: string;
  memberPreference(params: MemberInterface.MemberInfoDetail): string;
  memberInfoList(params?: MemberInterface.MemberInfoListFetchFidle): string;
  memberInfoSearch(params?: MemberInterface.MemberInfoSearchFidle): string;
  memberOrderInfo(params: MemberInterface.MemberInfoDetail): string;
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
    RECEIVE_MEMBER_PERFERENCE: 'RECEIVE_MEMBER_PERFERENCE',
    RECEIVE_MEMBER_ORDER_INFO: 'RECEIVE_MEMBER_ORDER_INFO',
    SET_MEMBER_SELECT: 'SET_MEMBER_SELECT',
    RECEIVE_MEMBER_LEVEL: 'RECEIVE_MEMBER_LEVEL',
  };
  
  public memberInfoAdd = '/memberInfo/add';
  public memberInfoEdit = '/memberInfo/edit';
  public getRandomCaroNo = '/memberInfo/getRandomCaroNo';
  public memberLevelList = '/memberLevel/list';
  /**
   * @todo [请求会员列表]
   *
   * @memberof MemberInterfaceMap
   */
  public memberInfoList = (params?: MemberInterface.MemberInfoListFetchFidle) => {
    return `/memberInfo/list${params ? jsonToQueryString(params) : ''}`;
  }

  public memberInfoSearch = (params?: MemberInterface.MemberInfoSearchFidle) => {
    return `/memberInfo/detailByIdentity${jsonToQueryString(params)}`;
  }

  public memberInfoDetail = (params: MemberInterface.MemberInfoDetail) => {
    return `/memberInfo/detail/${params.id}`;
  }

  public memberDetailByPreciseInfo = (params: MemberInterface.MemberByPreciseInfo) => {
    return `/memberInfo/detailByPreciseInfo/${params.identity}`;
  }

  public memberPreference = (params: MemberInterface.MemberInfoDetail) => {
    return `/memberInfo/preference${jsonToQueryString(params)}`;
  }

  public memberOrderInfo = (params: MemberInterface.MemberInfoDetail) => {
    return `/memberInfo/getMemberOrderInfo/${params.id}`;
  }
}

export default new MemberInterfaceMap();