import {
  MerchantService,
  MerchantInterface,
  MerchantInterfaceMap,
  jsonToQueryString
} from "../constants";
import { ResponseCode } from "../constants/index";
import { store } from "../app";
import requestHttp from "../common/request/request.http";

class MerchantAction {
  public pointConfigDetail = async () => {
    const result = await requestHttp.get("/merchant/point/config/detail");
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type:
          MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_POINT_CONFIG,
        payload: result.data
      });
    }
    return result;
  };

  public merchantInfoType = async () => {
    const result = await requestHttp.get(`/merchantInfo/type`);
    return result;
  };

  public register = async (params: any) => {
    const result = await requestHttp.post(`/merchantInfo/register`, params);
    return result;
  };

  public getCode = async (phone: string) => {
    const result = await requestHttp.get(
      `/sms/getCode${jsonToQueryString({ phone })}`
    );
    return result;
  };

  public activityInfoList = async () => {
    const result = await MerchantService.activityInfoList();
    if (result.code === ResponseCode.success) {
      let data: any[] = [];

      if (result.data.rows.length > 0) {
        result.data.rows.map(item => {
          const row = {
            ...item,
            rule:
              !!item.rule && item.rule.length > 0
                ? JSON.parse(item.rule)
                : item.rule
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
  };

  public selectCoupon = (coupon?: MerchantInterface.Coupon) => {
    store.dispatch({
      type: MerchantInterfaceMap.reducerInterface.RECEIVE_SELECT_COUPON,
      payload: { coupon }
    });
  };

  public emptyCoupon = () => {
    store.dispatch({
      type: MerchantInterfaceMap.reducerInterface.RECEIVE_EXPIRED_COUPON,
      payload: { rows: [] }
    });

    store.dispatch({
      type: MerchantInterfaceMap.reducerInterface.RECEIVE_COUPON_LIST,
      payload: { rows: [] }
    });
  };

  public getByCode = async (params: any) => {
    const result = await MerchantService.getByCode(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_SEARCH_COUPON,
        payload: result.data
      });
    }
    return result;
  };

  public couponGetMemberExpiredCoupons = async (params: any) => {
    const result = await MerchantService.couponGetMemberExpiredCoupons(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_EXPIRED_COUPON,
        payload: result.data
      });
    }
    return result;
  };

  public couponList = async (params: any) => {
    const payload = {
      ...params,
      productIds: params.productIds.filter(
        productId => !`${productId}`.startsWith("WM")
      )
    };
    const result = await MerchantService.couponList(payload);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_COUPON_LIST,
        payload: result.data
      });
    }
    return result;
  };

  public merchantSubList = async () => {
    const result = await MerchantService.merchantSubList();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_SUB_LIST,
        payload: result.data
      });
    }
    return result;
  };

  public merchantDetail = async () => {
    const result = await MerchantService.merchantInfoDetail();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_DETAIL,
        payload: result.data
      });
    }
    return result;
  };

  public merchantInfoAdd = async (
    params: MerchantInterface.PayloadInterface.MerchantInfoAdd
  ) => {
    const result = await MerchantService.merchantInfoAdd(params);
    return result;
  };

  public profileInfo = async () => {
    const result = await MerchantService.profileInfo();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MerchantInterfaceMap.reducerInterface.RECEIVE_PROFILE_INFO,
        payload: result.data
      });
    }
    return result;
  };

  public profileEdit = async (params: any) => {
    const result = await MerchantService.profileEdit(params);
    if (result.code === ResponseCode.success) {
      return {
        success: true,
        result: result.msg
      };
    } else {
      return {
        success: false,
        result: result.msg
      };
    }
  };

  public profileResetPwd = async (params: any) => {
    const result = await MerchantService.profileResetPwd(params);
    if (result.code === ResponseCode.success) {
      return {
        success: true,
        result: result.msg
      };
    } else {
      return {
        success: false,
        result: result.msg
      };
    }
  };

  public merchantInfoEdit = async (params: any) => {
    const result = await MerchantService.merchantInfoEdit(params);
    if (result.code === ResponseCode.success) {
      return {
        success: true,
        result: result.msg
      };
    } else {
      return {
        success: false,
        result: result.msg
      };
    }
  };
}

export default new MerchantAction();
