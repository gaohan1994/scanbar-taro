import memberService from "../constants/member/member.service";
import { MemberInfoAddParams } from '../constants/member/member';
import { ResponseCode, ActionsInterface } from '../constants/index';

/**
 * @Author: Ghan 
 * @Date: 2019-11-08 10:28:21 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 10:05:12
 */

class MemberAction {

  public memberList = async () => {
    const result = await memberService.memberList();
    console.log('result: ', result);
  }

  public memberAdd = async (params: { payload: MemberInfoAddParams }): Promise<ActionsInterface.ActionBase<any>> => {
    const { payload } = params;
    const result = await memberService.memberAdd(payload);
    if (result.code === ResponseCode.success) {
      return { success: true, result: result.data };
    } else {
      return { success: false, result: result.msg };
    }
  }
}

export default new MemberAction();