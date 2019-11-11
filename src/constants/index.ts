/**
 * @Author: Ghan 
 * @Date: 2019-11-11 10:00:37 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 14:03:27
 * 
 * @todo [类型定义库]
 */

export { default as MemberService } from './member/member.service';
export { MemberInterface, default as MemberInterfaceMap } from './member/member';

export const ResponseCode = {
  success: 'response.success'
};

export declare namespace HTTPInterface {

  /**
   * @interface FetchField
   * 通用分页请求函数
   */
  type FetchField = {
    pageNum: number;
    pageSize?: number;
  };

  type ResponseResultBase<T> = {
    code: string;
    msg: string;
    data: T
  };

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