import { ProductInterface, ProductInterfaceMap } from "../constants";
import { AppReducer } from '../reducers';

export declare namespace PayReducer {

  interface PayReceive extends Partial<ProductInterface.CashierPay> {
    transAmount: number;
  }

  interface State {
    payReceive: PayReceive;
  }

  interface Action {
    type: ProductInterface.RECEIVE_PAY_DETAIL;
    payload: any;
  }
}

const initState: PayReducer.State = {
  payReceive: {
    codeUrl: '',
    transAmount: -1,
  }
};

export default function payReducer (state: PayReducer.State = initState, action: PayReducer.Action): PayReducer.State {
  switch (action.type) {
    case ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_DETAIL: {
      const { payload: { payReceive } } = action;
      return {
        ...state,
        payReceive,
      };
    }
    default: {
      return {...state};
    }
  }
}

export const getPayReceive = (state: AppReducer.AppState) => state.pay.payReceive;