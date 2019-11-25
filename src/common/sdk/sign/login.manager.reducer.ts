/*
 * @Author: Ghan 
 * @Date: 2019-11-25 16:30:14 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-25 17:11:57
 */
import LoginManager, { LoginInterface } from "./login.manager";
import { AppReducer } from "../../../reducers";
import { ProductInterface } from "../../../constants";
import merge from 'lodash/merge';

declare namespace LoginManagerReducer {
  interface State {
    auth: LoginInterface.OAuthToken;
  }

  interface Action {
    type: LoginInterface.RECEIVE_AUTH;
    payload: any;
  }
}

const initState: LoginManagerReducer.State = {
  auth: {
    token: '',
    phone: '',
    loginId: '',
    name: '',
    menus: []
  }
};

export default function loginManagerReducer (state: LoginManagerReducer.State = initState, action: LoginManagerReducer.Action): LoginManagerReducer.State {
  switch (action.type) {
    case LoginManager.reducerInterface.RECEIVE_AUTH: {
      const { payload: { auth } } = action;
      return {
        ...state,
        auth
      };
    }
    default: {
      return {...state};
    }
  }
}