import loginManager from "../../common/sdk/sign/login.manager";
import Taro from '@tarojs/taro'
import { connect } from "@tarojs/redux";
import { AppReducer } from "../../reducers";
import { store } from '../../app';

type Props = {
  funcNo: string;
  // permissions: string[];
}

export function isPermissedRender (funcNo: string, ) {
  if(!funcNo) {
    return true
  }

  if(!loginManager.getUserToken().success) {
    return true
  }

  const user = store.getState().user
  const permissions = user && user.userinfo && user.userinfo.permissions
  
  if(!permissions) {
    return true
  }

  return permissions.indexOf(funcNo) > -1
  
  // loginManager.getUserInfo().then((response: any) => {
  //   if (!!response.success) {
  //     const data = response.result.permissions
  //     console.log('打印我的user',data);
      
  //     return data.indexOf(funcNo) > -1;
  //   }
  // })
}

class AuthorizedItem extends Taro.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {    
    return isPermissedRender(this.props.funcNo || '') ? this.props.children : null
  }
}

export default AuthorizedItem

// const select = (state: AppReducer.AppState, ) => {
//   return {
//     permissions: state.user.userinfo.permissions
//   };
// };

// export default connect(select)(AuthorizedItem as any);

