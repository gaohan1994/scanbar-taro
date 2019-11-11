import { combineReducers } from 'redux';
import permission from './app.permission';
import member, { MemberReducer } from './app.member';

export declare namespace AppReducer {
  interface AppState {
    member: MemberReducer.MemberInitState;
  }
}

export default combineReducers({ 
  permission,
  member,
});
