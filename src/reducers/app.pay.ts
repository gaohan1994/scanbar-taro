import { ProductInterface, ProductInterfaceMap } from "../constants";
import { AppReducer } from '../reducers';
import { ProductCartInterface } from "src/common/sdk/product/product.sdk";

export declare namespace PayReducer {

  interface PayReceive {
    transPayload?: ProductCartInterface.ProductPayPayload;
    transResult?: ProductInterface.CashierPay;
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
    transPayload: undefined,
    transResult: undefined,
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