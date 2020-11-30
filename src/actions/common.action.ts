
import { CommonInterface } from "../constants";
import { ResponseCode } from '../constants/index'
import commonService from '../constants/common/common.service'

class CommonAction {
  public getDictList = async (params: CommonInterface.CommonDictListFetchFidle, callback: any) => {
    const result = await commonService.getDictList(params)
    if (result.code === ResponseCode.success && callback) {
      callback(result.data.rows || [])
    }
    return result;
  }
}

export default new CommonAction();