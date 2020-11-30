export declare namespace CommonInterface {
  interface CommonDict {
    dictCode: number;
    dictLabel: string;
    dictType: string;
    dictSort: number;
    dictValue: string;
    isDefault: string;
    listClass: string;
    params: any,
    remark: string;
    searchValue: string;
    status: number;
    cssClass: string;
    updateBy: string;
    updateTime: string;  
    createBy: string;
    createTime: string;
  }
  interface CommonDictListFetchFidle {
    
  }
  namespace Interfaces {
    interface CommonDict {
      amount: number;
      number: number;
      productId: number;
      subtotal: number;
    } 
  }

  interface CommonInterfaceMap {
    reducerInterface: {
      RECEIVE_DEPT_DATA: string;
    };
    getDictList: string;
  }
}


class CommonInterfaceMap implements CommonInterface.CommonInterfaceMap {

  public reducerInterface = {
    RECEIVE_DEPT_DATA: 'RECEIVE_DEPT_DATA',
  };

  public getDictList = '/system/dict/data/list';
}

export default new CommonInterfaceMap();