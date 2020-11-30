import { ProductInterface, ProductInterfaceMap } from "../constants";
import { AppReducer } from '../reducers';
import { ProductCartInterface } from "../common/sdk/product/product.sdk";

export declare namespace PayReducer {

  interface PayReceive {
    transPayload?: ProductCartInterface.ProductPayPayload;
    transResult?: ProductInterface.CashierPay;
  }

  interface State {
    payReceive: PayReceive;
    orderNo: string[];
  }

  interface Action {
    type: ProductInterface.RECEIVE_PAY_DETAIL | ProductInterface.RECEIVE_PAY_ORDERRNO;
    payload: any;
  }
}

const initState: PayReducer.State = {
  payReceive: {
    transPayload: undefined,
    transResult: undefined,
  },
  orderNo: []
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
    case ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_ORDERRNO: {
      const { payload } = action;
      return {
        ...state,
        orderNo: [...state.orderNo, payload],
      };
    }
    default: {
      return {...state};
    }
  }
}

export const getPayReceive = (state: AppReducer.AppState) => state.pay.payReceive;