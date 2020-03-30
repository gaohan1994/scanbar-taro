import MerchantInterfaceMap, { MerchantInterface } from '../constants/merchant/merchant';
// import merge from 'lodash.merge';
import { AppReducer } from './';

export declare namespace MerchantReducer {
  namespace Reducers {

    interface SelectCouponReducer {
      type: MerchantInterface.ReducerTypes.RECEIVE_SELECT_COUPON;
      payload: { coupon?: MerchantInterface.Coupon };
    }
    interface ReceiveExpiredCoupon {
      type: MerchantInterface.ReducerTypes.RECEIVE_EXPIRED_COUPON;
      payload: MerchantInterface.Coupon[];
    }
    interface ReceiveMerchantDetail {
      type: MerchantInterface.ReducerTypes.RECEIVE_MERCHANT_DETAIL;
      payload: MerchantInterface.MerchantDetail;
    }

    interface ReceiveMerchantSubList {
      type: string;
      payload: {rows: MerchantInterface.MerchantDetail[]};
    }

    interface ReceiveUserProfileInfo {
      type: MerchantInterface.ReducerTypes.RECEIVE_PROFILE_INFO;
      payload: MerchantInterface.ProfileInfo;
    }

    interface ReceiveCouponList {
      type: MerchantInterface.ReducerTypes.RECEIVE_COUPON_LIST;
      payload: {
        total: number;
        rows: MerchantInterface.Coupon[];
      };
    }
  }
  
  interface State {
    merchantDetail: MerchantInterface.MerchantDetail;
    profileInfo: MerchantInterface.ProfileInfo;
    merchantSubList: MerchantInterface.MerchantDetail[];
    couponsList: MerchantInterface.Coupon[];
    couponsExpiredList: MerchantInterface.Coupon[];
    selectCoupon: MerchantInterface.Coupon;
    activityInfo: any;
  }

  type Action = 
    Reducers.ReceiveMerchantDetail |
    Reducers.ReceiveUserProfileInfo |
    Reducers.ReceiveMerchantSubList |
    Reducers.ReceiveCouponList |
    Reducers.ReceiveExpiredCoupon |
    Reducers.SelectCouponReducer;
}

export const initState: MerchantReducer.State = {
  merchantDetail: {} as any,
  profileInfo: {} as any,
  merchantSubList: [],
  couponsList: [],
  couponsExpiredList: [],
  selectCoupon: {} as MerchantInterface.Coupon,
  activityInfo: {} as any,
};

export default function merchant (state: MerchantReducer.State = initState, action: MerchantReducer.Action): MerchantReducer.State {
  switch (action.type) {
    case MerchantInterfaceMap.reducerInterface.RECEIVE_ACTIVITYINFO: {
      const { } = action;
      return {
        ...state,
      };
    }

    case MerchantInterfaceMap.reducerInterface.RECEIVE_SELECT_COUPON: {
      const { payload } = action as MerchantReducer.Reducers.SelectCouponReducer;
      return {
        ...state,
        selectCoupon: payload.coupon as any
      };
    }

    case MerchantInterfaceMap.reducerInterface.RECEIVE_EXPIRED_COUPON: {
      const { payload } = action as MerchantReducer.Reducers.ReceiveCouponList;
      return {
        ...state,
        couponsExpiredList: payload.rows,
      };
    }

    case MerchantInterfaceMap.reducerInterface.RECEIVE_COUPON_LIST: {
      const { payload } = action as MerchantReducer.Reducers.ReceiveCouponList;
      return {
        ...state,
        couponsList: payload.rows
      };
    }

    case MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_SUB_LIST: {
      const { payload } = action as MerchantReducer.Reducers.ReceiveMerchantSubList;
      return {
        ...state,
        merchantSubList: payload.rows
      };
    }

    case MerchantInterfaceMap.reducerInterface.RECEIVE_MERCHANT_DETAIL: {
      const { payload } = action as MerchantReducer.Reducers.ReceiveMerchantDetail;
      return {
        ...state,
        merchantDetail: payload
      };
    }

    case MerchantInterfaceMap.reducerInterface.RECEIVE_PROFILE_INFO: {
      const { payload } = action as MerchantReducer.Reducers.ReceiveUserProfileInfo;
      return {
        ...state,
        profileInfo: payload
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
}

export const getMerchantDetail = (state: AppReducer.AppState) => state.merchant.merchantDetail;

export const getProfileInfo = (state: AppReducer.AppState) => state.merchant.profileInfo;

export const getMerchantSubList = (state: AppReducer.AppState) => state.merchant.merchantSubList;

export const getCouponList = (state: AppReducer.AppState) => state.merchant.couponsList;

export const getSelectCoupon = (state: AppReducer.AppState) => state.merchant.selectCoupon;