import { LoginInterface } from "../../common/sdk/sign/login.manager";

export declare namespace MerchantInterface {
  interface MerchantDetail {
    address: string;
    contactName: string;
    createBy: string;
    createTime: string;
    institutionCode: string;
    location: string;
    logo: string;
    name: string;
    phoneNumber: string;
    updateBy: string;
    updateTime: string;
    id: number;
    industry: number;
    isDeleted: number;
    parentId: number;
    prop: number;
    status: number;
    type: number;
  }

  interface Coupon { 
    ableToUse: boolean;
    couponId: number;
    couponVO: {
      discount: number;
      filterType: number;
      threshold: number;
      name: string;
      useWay: string;
    };
    createTime: string;
    disableReason: string;
    effectiveTime: string;
    id: number;
    merchantIds: string;
    phone: string;
  }

  interface ProfileInfo {
    avatar: string;
    email: string;
    merchantName: string;
    phone: string;
    sex: string;
    userName: string;
    roleNames: string;
    merchantInfoDTO: LoginInterface.MerchantInfoDTO;
  }

  namespace PayloadInterface {
    interface MerchantInfoAdd extends Partial<MerchantDetail> {
      pageNum?: number;
      pageSize?: number;
      parentId?: number;
      prop?: number;
      status?: number;
      type?: number;
      orderByColumn?: string;
      phoneNumber?: string;
    }
  }

  namespace ReducerTypes {
    type RECEIVE_MERCHANT_DETAIL = string;
    type RECEIVE_PROFILE_INFO = string;
    type RECEIVE_USER_INFO = string;
    type RECEIVE_COUPON_LIST = string;
    type RECEIVE_EXPIRED_COUPON = string;
    type RECEIVE_SELECT_COUPON = string;
  }

  interface MerchantInterfaceMap {
    reducerInterface: {
      RECEIVE_MERCHANT_DETAIL: ReducerTypes.RECEIVE_MERCHANT_DETAIL;
      RECEIVE_PROFILE_INFO: ReducerTypes.RECEIVE_PROFILE_INFO;
      RECEIVE_USER_INFO: ReducerTypes.RECEIVE_USER_INFO;
      RECEIVE_MERCHANT_SUB_LIST: string;
      RECEIVE_COUPON_LIST: string;
      RECEIVE_SELECT_COUPON: string;
      RECEIVE_EXPIRED_COUPON: string;
    };
    
    merchantInfoAdd: string;
    merchantInfoDetail: string;
    profileInfo: string;
    profileEdit: string;
    profileResetPwd: string;
  }
}

class MerchantInterfaceMap implements MerchantInterface.MerchantInterfaceMap {
  public reducerInterface = {
    RECEIVE_MERCHANT_DETAIL: 'RECEIVE_MERCHANT_DETAIL',
    RECEIVE_PROFILE_INFO: 'RECEIVE_PROFILE_INFO',
    RECEIVE_USER_INFO: 'RECEIVE_USER_INFO',
    RECEIVE_MERCHANT_SUB_LIST: 'RECEIVE_MERCHANT_SUB_LIST',
    RECEIVE_COUPON_LIST: 'RECEIVE_COUPON_LIST',
    RECEIVE_EXPIRED_COUPON: 'RECEIVE_EXPIRED_COUPON',
    RECEIVE_SELECT_COUPON: 'RECEIVE_SELECT_COUPON',
  };
  public merchantInfoAdd = '/merchantInfo/add';
  public merchantInfoDetail = '/merchantInfo/detail';
  public merchantInfoEdit = '/merchantInfo/edit';
  public profileInfo = '/system/user/profile/info';
  public profileEdit = '/system/user/profile/update';
  public profileResetPwd = '/system/user/profile/resetPwd';

  public couponList = '/coupon/list';
  public couponGetMemberExpiredCoupons = '/coupon/getMemberExpiredCoupons';
  public couponGetByCode = '/coupon/getByCode';
  public couponGetAbleToUseCoupon = '/coupon/getAbleToUseCoupon';
}

export default new MerchantInterfaceMap();