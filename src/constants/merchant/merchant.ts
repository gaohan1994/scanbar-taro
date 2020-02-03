
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
  }

  interface MerchantInterfaceMap {
    reducerInterface: {
      RECEIVE_MERCHANT_DETAIL: ReducerTypes.RECEIVE_MERCHANT_DETAIL;
      RECEIVE_PROFILE_INFO: ReducerTypes.RECEIVE_PROFILE_INFO;
    };
    
    merchantInfoAdd: string;
    merchantInfoDetail: string;
    profileInfo: string;
  }
}

class MerchantInterfaceMap implements MerchantInterface.MerchantInterfaceMap {
  public reducerInterface = {
    RECEIVE_MERCHANT_DETAIL: 'RECEIVE_MERCHANT_DETAIL',
    RECEIVE_PROFILE_INFO: 'RECEIVE_PROFILE_INFO',
  };
  public merchantInfoAdd = '/merchantInfo/add';
  public merchantInfoDetail = '/merchantInfo/detail';
  public profileInfo = '/user/profile/info';
}

export default new MerchantInterfaceMap();