/*
 * @Author: Ghan 
 * @Date: 2019-11-01 10:07:05 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-21 14:40:52
 */
import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text, Input } from '@tarojs/components';
import '../style/login.less';
import classnames from 'classnames';
import { AtButton } from 'taro-ui';
import { LoginManager } from '../../common/sdk';
import invariant from 'invariant';
import NavBar from '../../component/navbar/navbar';

const cssPrefix = 'sign';

type Props = {};

type State = {
  username: string; // 用户名
  password: string; // 密码
  checked: boolean; // 是否选中政策按钮
};

class Login extends Taro.Component<Props, State> {
  
  config: Taro.Config = {
    navigationBarTitleText: '登录',
    navigationStyle: 'custom'
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
  public onLogin = async () => {
    try {
      Taro.showLoading();
      const { username, password } = this.state;
      const result = await LoginManager.login({phoneNumber: username, password: password});
      invariant(result.success, result.msg || '登录失败');
      // Taro.navigateTo({ url: '/pages/home/home' });
      // Taro.navigateBack();
      Taro.navigateBack({delta: 10});  
      Taro.switchTab({
        url: `/pages/home/home`
      })
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }
  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
    return value;
  }

  render () {
    const { username, password } = this.state;
    return (
      <View className={classnames(['container', 'sign'])} >
        <NavBar title="登录"/>
        <View className="sign-card">
          <View className="sign-card-title">欢迎使用千阳零售</View>
          <View className="sign-card-input">
            <View className={`${cssPrefix}-input-box`} >
              <Image src="http://net.huanmusic.com/weapp/icon_login_user.png" className={`${cssPrefix}-input-box-icon`} />
              <View className={`${cssPrefix}-input-container`}>
                <Input
                  // cursorSpacing={300}
                  className={`${cssPrefix}-input-box-input`} 
                  value={username}
                  onInput={({detail: {value}}) => this.onChangeValue('username', value)}
                  placeholder="请输入账号"
                  placeholderStyle="fontSize: 26px; color: #cccccc"
                  type="number"
                  autoFocus={true}
                />
              </View>
            </View>
          </View>
          <View className="sign-card-input">
            <View className={`${cssPrefix}-input-box`} >
              <Image src="http://net.huanmusic.com/weapp/icon_login_password.png" className={`${cssPrefix}-input-box-icon`} />
              <View className={`${cssPrefix}-input-container`}>
                <Input
                  // cursorSpacing={300}
                  className={`${cssPrefix}-input-box-input`} 
                  value={password}
                  onInput={({detail: {value}}) => this.changePassword(value)}
                  placeholder="请输入密码"
                  placeholderStyle="fontSize: 26px; color: #cccccc"
                />
              </View>
            </View>
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