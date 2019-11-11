/**
 * @Author: Ghan 
 * @Date: 2019-11-11 10:23:20 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 17:13:55
 */
import merge from 'lodash/merge';
import { MemberInterface, MemberInterfaceMap } from '../constants';

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
  }

  interface MemberAction {
    type: MemberInterface.MemberReducerType;
    payload: any;
  }
}

const initState: MemberReducer.MemberInitState = {
  memberList: {
    total: 0,
    data: []
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
    default: {
      return {...state};
    }
  }
}