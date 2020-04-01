import { MerchantService, MerchantInterface, MerchantInterfaceMap } from "../constants";
import { ResponseCode } from '../constants/index';
import { store } from '../app';

class MerchantAction {

  public activityInfoList = async () => {
    const result = await MerchantService.activityInfoList();
    if (result.code === ResponseCode.success) {

      let data: any[] = [];

      if (result.data.rows.length > 0) {
        result.data.rows.map((item) => {
          const row = {
            ...item,
            rule: !!item.rule && item.rule.length > 0 ? JSON.parse(item.rule) : item.rule,
          };
          data.push(row);
        });
      }

      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_ACTIVITYINFO,
        payload: data
      });
    } 
    return result;
  }

  public selectCoupon = (coupon?: MerchantInterface.Coupon) => {
    store.dispatch({
      type: MerchantInterfaceMap.reducerInterface.RECEIVE_SELECT_COUPON,
      payload: { coupon }
    });
  }

  public emptyCoupon = () => {
    store.dispatch({
      type: MerchantInterfaceMap.reducerInterface.RECEIVE_EXPIRED_COUPON,
      payload: {rows: []}
    });

    store.dispatch({
      type: MerchantInterfaceMap.reducerInterface.RECEIVE_COUPON_LIST,
      payload: {rows: []}
    });
  }

  public getByCode = async (code: string) => {
    const result = await MerchantService.getByCode(code);
    return result;
  }

  public couponGetMemberExpiredCoupons = async (params: any) => {
    const result = await MerchantService.couponGetMemberExpiredCoupons(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_EXPIRED_COUPON,
        payload: result.data
      });
    }
    return result;
  }

  public couponList = async (params: any) => {
    const result = await MerchantService.couponList(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_COUPON_LIST,
        payload: result.data
      });
    }
    return result;
  }

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