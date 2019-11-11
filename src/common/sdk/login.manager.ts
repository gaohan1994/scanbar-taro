/**
 * @Author: Ghan 
 * @Date: 2019-11-08 17:10:29 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-08 18:00:26
 */

import Taro from '@tarojs/taro';

const CentermLoginKey: string = 'centermLogin';

interface CheckPermissionsResult {
  success: boolean;
  grantedPermissions?: Array<string>;
  declinedPermissions?: Array<string>;
}

class LoginManager {

  /**
   * @todo [登录]
   *
   * @memberof LoginManager
   */
  public login = async (): Promise<any> => {
    const data = {username: 'gaohan'};
    return new Promise((resolve, reject) => {
      Taro
        .setStorage({ key: CentermLoginKey, data: JSON.stringify(data) })
        .then(() => {
          Taro
            .getStorage({ key: CentermLoginKey })
            .then(response => {
              resolve(JSON.parse(response.data));
            })
            .catch(error => reject(error));
        })
        .catch(error => reject(error));
    });
  }
  
  /**
   * @todo [退出登陆]
   *
   * @memberof LoginManager
   */
  public logout = () => {
    Taro.setStorage({ key: CentermLoginKey, data: '' })
      .then(res => {
        console.log('logout res: ', res);
      });
  }

  /**
   * @todo [获取用户token]
   *
   * @memberof LoginManager
   */
  public getUserToken = () => {
    //
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
  public checkUserPermissions = async (permissions: Array<string>): Promise<CheckPermissionsResult> => {
    console.log('permissions: ', permissions);
    return { success: true, grantedPermissions: [], declinedPermissions: [] };
  }
}

export default new LoginManager();