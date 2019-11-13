/**
 * @Author: Ghan 
 * @Date: 2019-11-11 10:23:20 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-13 10:34:36
 */
import merge from 'lodash/merge';
import { MemberInterface, MemberInterfaceMap } from '../constants';
import { AppReducer } from '.';

/**
 * @interface MemberReducer
 * @todo [memberRecuerInterface]
 * @todo [会员reducer的类型定义]
 */
export declare namespace MemberReducer {

  interface MemberList {
    total: number;
    data: MemberInterface.MemberInfo[];
    lastPage?: number;
  }

  interface MemberInitState {
    memberList: MemberList;
    memberDetail: MemberInterface.MemberInfo;
  }

  interface MemberAction {
    type: 
      | MemberInterface.RECEIVE_MEMBER_DETAIL
      | MemberInterface.RECEIVE_MEMBER_LIST;
    payload: any;
  }
}

const initState: MemberReducer.MemberInitState = {
  memberList: {
    total: 0,
    data: []
  },
  memberDetail: {
    createTime: '',
    id: 0,
    merchantId: 0,
    phoneNumber: '',
    sex: '0',
    status: 1,
    username: '',
  },
};

export default function memberReducer (state: MemberReducer.MemberInitState = initState, action: MemberReducer.MemberAction): MemberReducer.MemberInitState {
  switch (action.type) {
    case MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_LIST: {
      const { payload: { total, rows, page } } = action;
      const memberList: MemberReducer.MemberList = merge({}, state.memberList);
      const memberListData = page === 1 ? rows : memberList.data.concat(rows);
      return {
        ...state,
        memberList: {
          total,
          lastPage: page,
          data: memberListData
        }
      };
    }
    case MemberInterfaceMap.reducerInterfaces.RECEIVE_MEMBER_DETAIL: {
      const { payload: { data } } = action;
      return {
        ...state,
        memberDetail: data
      };
    }
    default: {
      return {...state};
    }
  }
}

export const getMemberDetail = (state: AppReducer.AppState) => state.member.memberDetail;