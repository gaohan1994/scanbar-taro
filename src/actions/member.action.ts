
/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:28:21 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-12 11:15:51
 */
import memberService from "../constants/member/member.service";
import { ResponseCode, ActionsInterface, MemberInterface, MemberInterfaceMap } from '../constants/index';
import { store } from '../app';
import merge from 'lodash/merge';
import isArray from 'lodash/isArray';
import moment from 'moment';
interface MemberAction {
  /**
   * @interface memberList
   * 
   * @memberof MemberAction
   * 会员主页获取会员列表
   */
  memberList: (params?: MemberInterface.MemberInfoListFetchFidle) => Promise<ActionsInterface.ActionBase<any>>;
  /**
   * @interface memberAdd
   *
   * @memberof MemberAction
   * 添加会员
   */
  memberAdd: (params: { payload: MemberInterface.MemberInfoAddParams }) => Promise<ActionsInterface.ActionBase<any>>;

  /**
   * @todo 把数据按照日期分类
   * 
   * ```js
   * data = [
   *  {
   *    ...xxx,
   *    createTime: '2019-01-01'
   *  },
   *  {
   *    ...xxx,
   *    createTime: '2019-01-02'
   *  },
   * ]
   * 
   * const filterData = fliterDataByDate(data);
   * 
   * filterData = [
   *  {
   *    date: '2019-01-01',
   *    data: [
   *      {
   *        ...xxx,
   *        createTime: '2019-01-01'
   *      }
   *    ]
   *  },
   *  {
   *    date: '2019-01-02',
   *    data: [
   *      {
   *        ...xxx,
   *        createTime: '2019-01-02' 
   *      }
   *    ]
   *  }
   * ]
   * ```
   *
   * @author Ghan
   * @param {any[]} data
   * @param {string} [dateKey]
   */
  fliterDataByDate: (data: MemberInterface.MemberInfo[], dateKey?: string) => Array<MemberInterface.MemberListByDate>;
}

class MemberAction {

  public fliterDataByDate = (data: MemberInterface.MemberInfo[], datekey = 'createTime') => {
    // return [];
    if (isArray(data) === true) {
      /**
       * @param mergeData 深拷贝data
       * @param dateIndexes 存放日期和对应日期数据key的地方
       * 
       * ```js
       * 
       * dateIndexes = [
       *  {date: '2019年01月01日', data: []},
       *  {date: '2019年01月02日', data: []},
       * ]
       * ```
       */
      const mergeData: MemberInterface.MemberInfo[] = merge([], data);
      const dateIndexes: MemberInterface.MemberListByDate[] = [];

      mergeData.forEach((item) => {
        const itemFormatDate = moment(item[datekey]).format('YYYY年MM月DD日');
        const dateIndex = dateIndexes.findIndex(d => d.date === itemFormatDate);

        if (dateIndex !== -1) {
          /**
           * @todo [已经有了这个日期的数据,直接存,如果存在这个id那么说明重复数据不存]
           */
          const currentDateIndex = dateIndexes[dateIndex];
          if (currentDateIndex.data && currentDateIndex.data.findIndex(d => d.id === item.id) !== -1) {
            return;
          }
          currentDateIndex.data.push(item);
        } else {
          const newDateIndex = {
            date: itemFormatDate,
            data: [item]
          };
          dateIndexes.push(newDateIndex);
        }
      });
      return dateIndexes;
    }
    console.error('请传入正确的参数');
  }

  public memberList = async (params?: MemberInterface.MemberInfoListFetchFidle) => {
    const result = await memberService.memberList(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_LIST,
        payload: {
          ...result.data,
          page: params && params.pageNum || 1
        }
      });
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }

  public memberAdd = async (params: { payload: MemberInterface.MemberInfoAddParams }) => {
    const { payload } = params;
    const result = await memberService.memberAdd(payload);
    if (result.code === ResponseCode.success) {
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }

  public memberSearch = async (params: MemberInterface.MemberInfoSearchFidle) => {
    const result = await memberService.memberSearch(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_LIST,
        payload: {
          ...result.data,
          page: params && params.pageNum || 1,
        }
      });
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg }; 
    }
  }

  public memberDetail = async (params: MemberInterface.MemberInfoDetail) => {
    const result = await memberService.memberDetail(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_DETAIL,
        payload: {data: result.data}
      });
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg }; 
    }
  }

  public memberEdit = async (params: MemberInterface.MemberInfoEditParams) => {
    const result = await memberService.memberEdit(params);
    if (result.code === ResponseCode.success) {
      return { success: true, result: result.msg };
    } else {
      return { success: false, result: result.msg }; 
    }
  }
}

export default new MemberAction();