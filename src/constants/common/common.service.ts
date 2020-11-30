/**
 * @todo 通用接口
 */

import requestHttp from "../../common/request/request.http";
import { jsonToQueryString } from '../index';
import CommonInterfaceMap, { CommonInterface } from "./common";

class CommonService {
  public getDictList = async (params: CommonInterface.CommonDictListFetchFidle): Promise<any> => {
    const result = await requestHttp.get(CommonInterfaceMap.getDictList, jsonToQueryString(params));
    return result
  }
}

export default new CommonService();