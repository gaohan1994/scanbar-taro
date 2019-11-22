import { combineReducers } from 'redux';
import permission from './app.permission';
import member, { MemberReducer } from './app.member';
import product, { ProductReducer } from './app.product';
import productSDK, { ProductSDKReducer } from '../common/sdk/product/product.sdk.reducer';

export declare namespace AppReducer {
  interface AppState {
    member: MemberReducer.MemberInitState;
    product: ProductReducer.InitState;
    productSDK: ProductSDKReducer.State;
  }
}

export default combineReducers({ 
  permission,
  member,
  product,
  productSDK,
});
