/**
 * @Author: Ghan 
 * @Date: 2019-11-11 10:00:37 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 10:08:54
 * 
 * @todo [类型定义库]
 */

export const ResponseCode = {
  success: 'response.success'
};

export declare namespace HTTPInterface {
  /**
   * @Author: Ghan 
   * @Date: 2019-11-08 10:04:18 
   * @Last Modified by: Ghan
   * @Last Modified time: 2019-11-08 15:55:00
   * @todo [通用类别]
   */
  type ResponseResultBase<T> = {
    code: string;
    msg: string;
    data: T
  };

  /**
   * @todo [通用数组返回类型]
   * ```js
   * {
   *  code: 'response.success',
   *  msg: '操作成功',
   *  data: {
   *    total: 1,
   *    rows: [
   *      {...xxx}
   *    ]
   *  }
   * }
   * ```
   */
  type ResponseArray<T> = ResponseResultBase<{total: number, rows: T[]}>;
}

export declare namespace ActionsInterface {
  /**
   * @interface ActionBase
   * 
   * @todo .action.ts 文件返回通用
   */
  type ActionBase<T> = {
    success: boolean;
    result: T;
  };
}

/**
 * @todo [传入条件返回格式化请求数据]
 * @param json 
 */
export const jsonToQueryString = (json: any) => {
  return '?' + Object.keys(json).map(function(key: any) {
    return key + '=' + json[key];
  }).join('&');
};