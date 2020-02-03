import { MerchantService, MerchantInterface, MerchantInterfaceMap } from "../constants";
import { ResponseCode } from '../constants/index';
import { store } from '../app';

class MerchantAction {

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
}

export default new MerchantAction();