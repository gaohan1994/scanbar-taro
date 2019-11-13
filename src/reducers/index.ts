import { combineReducers } from 'redux';
import permission from './app.permission';
import member, { MemberReducer } from './app.member';
import product, { ProductReducer } from './app.product';

export declare namespace AppReducer {
  interface AppState {
    member: MemberReducer.MemberInitState;
    product: ProductReducer.InitState;
  }
}

export default combineReducers({ 
  permission,
  member,
  product,
});
