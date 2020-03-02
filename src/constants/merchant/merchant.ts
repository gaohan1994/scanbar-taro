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
  }

  interface MerchantInterfaceMap {
    reducerInterface: {
      RECEIVE_MERCHANT_DETAIL: ReducerTypes.RECEIVE_MERCHANT_DETAIL;
      RECEIVE_PROFILE_INFO: ReducerTypes.RECEIVE_PROFILE_INFO;
      RECEIVE_USER_INFO: ReducerTypes.RECEIVE_USER_INFO;
      RECEIVE_MERCHANT_SUB_LIST: string;
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
  };
  public merchantInfoAdd = '/merchantInfo/add';
  public merchantInfoDetail = '/merchantInfo/detail';
  public merchantInfoEdit = '/merchantInfo/edit';
  public profileInfo = '/system/user/profile/info';
  public profileEdit = '/system/user/profile/update';
  public profileResetPwd = '/system/user/profile/resetPwd';
}

export default new MerchantInterfaceMap();