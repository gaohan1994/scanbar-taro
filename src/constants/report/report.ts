import { HTTPInterface } from '..';

export declare namespace ReportInterface {

  interface PayStatistic {
    id: number;
    payType: number;
    refundAmount: number;
    refundTimes: number;
    storeAmount: number;
    storeTimes: number;
    summaryId: number;
    totalAmount: number;
    totalTimes: number;
    trulySaleAmount: number;
  }

  interface TurnOverList {
    amount: number;
    time: string;
  }

  interface SaleStatistic {
    amount: number;
    payType: number;
    times: number;
  }

  interface ReportBaseInfo {
    addMemberNum: number;
    memberSales: number;
    memberSalesRate: number;
    memberSalesTimes: number;
    orderMemberNum: number;
    profit: number;
    profitRate: number;
    refundPrice: number;
    refundTimes: number;
    sales: number;
    salesTimes: number;
    storePrice: number;
    storeTimes: number;
    totalMemberNum: number;
    turnover: number;
    unitNum: number;
    unitPrice: number;
    payStatistic: PayStatistic[];
    turnoverList: TurnOverList[];

    saleStatistics: SaleStatistic[];
    refundStatistics: SaleStatistic[];
  }

  interface ReportListItem {
    barcode: string;
    brand: string;
    createTime: string;
    orderNo: string;
    productName: string;
    remark: string;
    standard: string;
    unit: string;
    updateTime: string;
    costAmount: number;
    discountAmount: number;
    merchantId: number;
    num: number;
    productId: number;
    profit: number;
    totalAmount: number;
    transAmount: number;
    transType: number;
    unitPrice: number;
  }

  interface ReportListFetchField extends Partial<HTTPInterface.FetchField> {
    beginDate?: string;
    endDate?: string;
    merchantId?: number;
    orderByColumn?: string;
  }

  interface ReportRankFetchField extends Partial<HTTPInterface.FetchField> {
    num?: number; 
    beginTime?: string;
    endTime?: string;
    merchantId?: number;
    merchantName?: string;
    productName?: string;
    transType?: number;
    orderByColumn?: string;
  }

  interface ReportBaseFetchFidle {
    beginTime?: string;
    endTime?: string;
    merchantId?: number;
    unit?: number;
  }

  namespace PayloadInterface {

  }

  namespace ReducerTypes {
    type RECEIVE_REPORT_BASE_INFO = string;
    type RECEIVE_REPORT_LIST = string;
    type RECEIVE_REPORT_RANK = string;
  }

  interface ReportInterfaceMap {
    reducerInterface: {
      RECEIVE_REPORT_BASE_INFO: ReducerTypes.RECEIVE_REPORT_BASE_INFO;
      RECEIVE_REPORT_LIST: ReducerTypes.RECEIVE_REPORT_LIST;
      RECEIVE_REPORT_RANK: ReducerTypes.RECEIVE_REPORT_RANK;
    };
    reportList: string;
    reportProductRank: string;
    reportBaseSaleInfo: string;
  }
}

class ReportInterfaceMap implements ReportInterface.ReportInterfaceMap {
  public reducerInterface = {
    RECEIVE_REPORT_BASE_INFO: 'RECEIVE_REPORT_BASE_INFO',
    RECEIVE_REPORT_LIST: 'RECEIVE_REPORT_LIST',
    RECEIVE_REPORT_RANK: 'RECEIVE_REPORT_RANK',
  };

  public reportList = '/report/list';
  public reportProductRank = '/report/productRank';
  public reportBaseSaleInfo = '/report/baseSaleInfo';
}

export default new ReportInterfaceMap();