
/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:28:21 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-13 12:10:59
 */
import memberService from "../constants/member/member.service";
import { ResponseCode, ActionsInterface, MemberInterface, MemberInterfaceMap } from '../constants/index';
import { store } from '../app';
import merge from 'lodash.merge';
import moment from 'dayjs';
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
  fliterDataByDate: <T>(data: T[], dateKey?: string) => Array<{
    date: string;
    data: T[];
  }>;
}

class MemberAction {

  public fliterDataByDate = <T>(data: T[], datekey = 'createTime') => {
    // return [];

    if (Array.isArray(data)) {
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
      const mergeData = merge([], data);
      const dateIndexes: {date: string, data: any[]}[] = [];

      mergeData.forEach((item: any) => {
        const itemFormatDate = moment(item[datekey]).format('YYYY年MM月DD日');
        const dateIndex = dateIndexes.findIndex(d => d.date === itemFormatDate);

        if (dateIndex !== -1) {
          /**
           * @todo [已经有了这个日期的数据,直接存,如果存在这个id那么说明重复数据不存]
           */
          const currentDateIndex = dateIndexes[dateIndex];
          if (currentDateIndex.data && currentDateIndex.data.findIndex(d => (d.id || d.businessNumber) === (item.id || item.businessNumber)) !== -1) {
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

    return { date: '', data: [] };
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

  public memberPreference = async (params: MemberInterface.MemberInfoDetail) => {
    const result = await memberService.memberPreference(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_PERFERENCE,
        payload: {data: result.data}
      });
    }
    return result;
  }

  public memberOrderInfo = async (params: MemberInterface.MemberInfoDetail) => {
    const result = await memberService.memberOrderInfo(params);
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_ORDER_INFO,
        payload: {data: result.data}
      });
    }
    return result;
  }

  public memberEdit = async (params: MemberInterface.MemberInfoEditParams) => {
    const result = await memberService.memberEdit(params);
    if (result.code === ResponseCode.success) {
      return { success: true, result: result.msg };
    } else {
      return { success: false, result: result.msg }; 
    }
  }

  public memberLevelList = async () => {
    const result = await memberService.memberLevelList();
    if (result.code === ResponseCode.success) {
      store.dispatch({
        type: MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_LEVEL,
        payload: result.data
      });
    }
    return result;
  }
}

export default new MemberAction();