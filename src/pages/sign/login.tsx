/*
 * @Author: Ghan 
 * @Date: 2019-11-01 10:07:05 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-01 10:41:56
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './style/login.less';
import classnames from 'classnames';
import CTInput from '../../component/sign/input/input';
import { AtButton } from 'taro-ui';

type Props = {};

type State = {
  username: string; // 用户名
  password: string; // 密码
  checked: boolean; // 是否选中政策按钮
};

class Login extends Taro.Component<Props, State> {
  
  config: Taro.Config = {
    navigationBarTitleText: '登录',
  };

  readonly state: State = {
    username: '',
    password: '',
    checked: true,
  };

  /**
   * @todo [用户输入用户名]
   *
   * @memberof Login
   */
  public changeUsername = (value: string) => {
    this.setState({ username: value });
  }
  /**
   * @todo [用户输入密码]
   *
   * @memberof Login
   */
  public changePassword = (value: string) => {
    this.setState({ password: value });
  }
  /**
   * @todo [用户勾选政策]
   *
   * @memberof Login
   */
  public changeChecked = () => {
    this.setState(preState => {
      return {
        ...preState,
        checked: !preState.checked
      };
    });
  }
  public getDisabled = (): boolean => {
    return false;
  }
  public onLogin = () => {
    console.log('onLogin: ');
  }

  render () {
    return (
      <View className={classnames(['container', 'sign'])} >
        <View className="sign-card">
          <View className="sign-card-title">福建师范大学二手市场</View>
          <View className="sign-card-input">
            <CTInput
              name="username"
              icon="http://net.huanmusic.com/weapp/icon_login_user.png"
              onChange={this.changeUsername}
              value={this.state.username}  
              border={false}
              placeholder="请输入账号"
              autoFocus={true}
            />
          </View>
          <View className="sign-card-input">
            <CTInput
              name="username"
              icon="http://net.huanmusic.com/weapp/icon_login_password.png"
              onChange={this.changePassword}
              value={this.state.password}
              border={false}
              placeholder="请输入密码"
              type="password"
            />
          </View>
          <View className={classnames(['sign-card-check'])}>
            {
              this.state.checked === true 
              ? (
                <Image onClick={this.changeChecked} className="sign-card-check-icon" src="http://net.huanmusic.com/weapp/icon_pitchon.png" />
              )
              : (
                <View onClick={this.changeChecked} className={classnames(['sign-card-check-icon', 'sign-card-check-uncheck'])} />
              )
            }
            <Text className="small-text">登录代表您已同意用户协议和隐私权政策</Text>
          </View>
          <AtButton 
            type='primary' 
            className="theme-button" 
            disabled={this.getDisabled()}
            onClick={this.onLogin}
          >
            登录
          </AtButton>
        </View>
      </View>
    );
  }
}

export default Login;