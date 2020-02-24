import merge from 'lodash.merge';
import { OrderInterface, MerchantInterfaceMap } from '../constants/index';
import { AppReducer } from '.';

export declare namespace UserReducer {

  namespace Reducers {
    interface ReceiveUserinfo {
      type: OrderInterface.RECEIVE_ORDER_LIST;
      payload: any;
    }
  } 

  interface State {
    userinfo: any;
  }

  type Action = 
    Reducers.ReceiveUserinfo;
}

const initState: UserReducer.State = {
  userinfo: {},
};

export default function userReducer (
  state: UserReducer.State = initState, 
  action: UserReducer.Action
): UserReducer.State {

  switch (action.type) {

    case MerchantInterfaceMap.reducerInterface.RECEIVE_USER_INFO: {
      const { payload } = action as UserReducer.Reducers.ReceiveUserinfo;
      const { data } = payload;
      return {
        ...state,
        userinfo: data
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
}

export const getUserinfo = (state: AppReducer.AppState) => state.user.userinfo;
