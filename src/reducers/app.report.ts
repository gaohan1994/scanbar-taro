import { ReportInterface, ReportInterfaceMap } from '../constants';
// import merge from 'lodash.merge';
import { AppReducer } from './';

export declare namespace ReportReducer {
  namespace Reducers {
    interface ReceiveReportBaseReducer {
      type: ReportInterface.ReducerTypes.RECEIVE_REPORT_BASE_INFO;
      payload: ReportInterface.ReportBaseInfo;
    }
  }
  
  interface State {
    reportBaseInfo: ReportInterface.ReportBaseInfo;
  }

  type Action = Reducers.ReceiveReportBaseReducer;
}

export const initState: ReportReducer.State = {
  reportBaseInfo: {} as any,
};

export default function report (state: ReportReducer.State = initState, action: ReportReducer.Action): ReportReducer.State {
  switch (action.type) {

    case ReportInterfaceMap.reducerInterface.RECEIVE_REPORT_BASE_INFO: {
      const { payload } = action as ReportReducer.Reducers.ReceiveReportBaseReducer;
      return {
        ...state,
        reportBaseInfo: payload
      };
    }

    default: {
      return {
        ...state
      };
    }
  }
}

export const getReportBaseInfo = (state: AppReducer.AppState) => state.report.reportBaseInfo;