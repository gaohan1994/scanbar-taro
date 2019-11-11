/*
 * @Author: Ghan 
 * @Date: 2019-11-08 17:43:25 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-08 17:49:46
 */
import Taro, { setStorage } from '@tarojs/taro';

class StorageSDK {

  public setStorage = async (params: setStorage.Param): Promise<any> => {
    return new Promise((resolve, reject) => {
      Taro.setStorage(params)
        .then(response => {
          if (response.errMsg === 'setStorage:ok') {
            resolve(response.data);
          } else {
            Taro.showToast({ title: `存储${params.key}时出错，请联系客服`, icon: 'none' });
            reject(response);
          }
        })
        .catch(error => reject(error));
    });
  }
}

export default new StorageSDK();