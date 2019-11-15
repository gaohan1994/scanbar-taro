/**
 * @Author: Ghan 
 * @Date: 2019-11-08 17:10:29 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-14 14:47:32
 */

import Taro from '@tarojs/taro';
import md5 from 'blueimp-md5';
import requestHttp from '../request/request.http';
import { ResponseCode, ActionsInterface } from '../../constants/index';
import invariant from 'invariant';

export const CentermOAuthKey: string = 'CentermOAuthToken';

declare namespace LoginInterface {

  interface OAuthTokenParams {
    phoneNumber: string;
    password: string;
  }

  interface CheckPermissionsResult {
    success: boolean;
    grantedPermissions?: Array<string>;
    declinedPermissions?: Array<string>;
  }

  interface OAuthToken {
    token: string;
    phone: string;
    loginId: string;
    name: string;
  }

  interface LoginManagerConfig {
    oatuhToken: string;
  }
}

class LoginManager {
  public LoginManagerConfig: LoginInterface.LoginManagerConfig = {
    oatuhToken: '/oauth/token',
  };

  public autoToken = async (params: LoginInterface.OAuthTokenParams): Promise<any> => {
    const result = await requestHttp.post(this.LoginManagerConfig.oatuhToken, params);
    if (result.code === ResponseCode.success) {
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }

  /**
   * @todo [登录]
   *
   * @memberof LoginManager
   */
  public login = async (params: LoginInterface.OAuthTokenParams): Promise<any> => {
    try {
      const payload: LoginInterface.OAuthTokenParams = {
        ...params,
        password: md5(params.password)
      };
      const { success, result } = await this.autoToken(payload);
      invariant(success, result || ResponseCode.error);
      return new Promise((resolve, reject) => {
        Taro
          .setStorage({ key: CentermOAuthKey, data: JSON.stringify(result) })
          .then(() => {
            resolve({success: true, result});
          })
          .catch(error => reject({success: false, result: error.message}));
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }
  
  /**
   * @todo [退出登陆]
   *
   * @memberof LoginManager
   */
  public logout = async (): Promise<ActionsInterface.ActionBase<string>> => {
    return new Promise((resolve, reject) => {
      Taro
        .setStorage({ key: CentermOAuthKey, data: '' })
        .then(() => {
          resolve({ success: true, result: '' });
        })
        .catch(error => {
          reject({ success: false, result: error.message });
        });
    });
  }

  /**
   * @todo [获取用户token]
   *
   * @memberof LoginManager
   */
  public getUserInfo = () => {
    return new Promise((resolve, reject) => {
      Taro
        .getStorage({key: CentermOAuthKey})
        .then(data => {
          resolve({success: true, result: JSON.parse(data.data)});
        })
        .catch(error => {
          reject({success: false, result: error.message});
        });
    });
  }

  public getUserToken = (): ActionsInterface.ActionBase<string> => {
    const userinfo = Taro.getStorageSync(CentermOAuthKey);
    if (userinfo && userinfo.token) {
      return { success: true, result: userinfo.token };
    } else {
      return { success: false, result: '' };
    }
  }

  /**
   * @todo [获取用户权限]
   *
   * @memberof LoginManager
   */
  public getUserPermissions = async (): Promise<Array<any>> => {
    return [];
  }

  /**
   * @todo [校验用户是否开放权限]
   *
   * @memberof LoginManager
   */
  public checkUserPermissions = async (permissions: Array<string>): Promise<LoginInterface.CheckPermissionsResult> => {
    console.log('permissions: ', permissions);
    return { success: true, grantedPermissions: [], declinedPermissions: [] };
  }
}

export default new LoginManager();