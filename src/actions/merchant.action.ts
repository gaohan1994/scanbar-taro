import { MerchantService, MerchantInterface, MerchantInterfaceMap } from "../constants";
import { ResponseCode } from '../constants/index';
import { store } from '../app';

class MerchantAction {

  public merchantSubList = async () => {
    const result = await MerchantService.merchantSubList();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_SUB_LIST,
        payload: result.data
      });
    }
    return result;
  }

  public merchantDetail = async () => {
    const result = await MerchantService.merchantInfoDetail();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_DETAIL,
        payload: result.data
      });
    }
    return result;
  }

  public merchantInfoAdd = async (params: MerchantInterface.PayloadInterface.MerchantInfoAdd) => {
    const result = await MerchantService.merchantInfoAdd(params);
    return result;
  }

  public profileInfo = async () => {
    const result = await MerchantService.profileInfo();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_PROFILE_INFO,
        payload: result.data
      });
    }
    return result;
  }

  public profileEdit = async (params: any) => {
    const result = await MerchantService.profileEdit(params);
    if (result.code === ResponseCode.success) {
      return {
        success: true,
        result: result.msg,
      };
    } else {
      return {
        success: false,
        result: result.msg
      };
    }
  }

  public profileResetPwd = async (params: any) => {
    const result = await MerchantService.profileResetPwd(params);
    if (result.code === ResponseCode.success) {
      return {
        success: true,
        result: result.msg,
      };
    } else {
      return {
        success: false,
        result: result.msg
      };
    }
  }

  public merchantInfoEdit = async (params: any) => {
    const result = await MerchantService.merchantInfoEdit(params);
    if (result.code === ResponseCode.success) {
      return {
        success: true,
        result: result.msg,
      };
    } else {
      return {
        success: false,
        result: result.msg
      };
    }
  }
}

export default new MerchantAction();