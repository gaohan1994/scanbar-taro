import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { AtButton, AtInput } from 'taro-ui';
import "../style/user.less";
import merchantAction from '../../actions/merchant.action';
import Item from './component/item'
import invariant from 'invariant'
import { ResponseCode } from '../../constants/index';
import md5 from 'blueimp-md5';

const cssPrefix = 'user';

type State = {
  value: string;
  count: number;
  vercode: string;
};

class UserMerchantEdit extends Taro.Component<any, State> {
  readonly state: State = {
    value: '',
    count: 0,
    vercode: ''
  };

  config: Taro.Config = {
    navigationBarTitleText: '更改手机号'
  };

  componentDidMount() {
    const { phone } = this.$router.params;
    this.setState({
      value: phone
    });
  }

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  public onSave = async () => {
    invariant(this.state.vercode, '请输入验证码')
    invariant(/^1\d{9}$/g.test(this.state.value), '手机号码格式不正确')
    const params = {
      phone: this.state.value,
      validCode: md5(this.state.vercode)
    };
    const res = await merchantAction.profileEdit(params);
    if (res.success) {
      await merchantAction.profileInfo();
      Taro.showToast({
        title: '保存成功！'
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } else {
      Taro.showToast({
        title: '保存失败！',
        icon: 'none'
      });
    }
  }

  public getVercode = async () => {
    try {
      const {value} = this.state
      
      invariant(!!value, "请填写手机号");
      this.setState({ count: 60 })
      const timeId = setInterval(() => {        
        this.setState((prev) => {
          if(prev.count <= 0) {
            clearInterval(timeId)
            return
          }
          return {
            ...prev,
          count: prev.count - 1
          }
        })
      }, 1000)
      // const result = await merchantAction.getCode(value);
      // invariant(result.code === ResponseCode.success, result.msg || " ");
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  }

  render () {
    const { value, vercode, count } = this.state;
    const { phone } = this.$router.params;
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-merchant`}>
          <View className={`${cssPrefix}-merchant-box`}>
            <View className={`${cssPrefix}-merchant-input`}>
              <Input
                value={value}
                placeholder="请输入新手机号"
                placeholderStyle="fontSize: 26px; color: #cccccc"
                onInput={({detail: {value}}) => this.onChangeValue('value', value)}
              />
            </View>

            <View className={`${cssPrefix}-merchant-input ${cssPrefix}-merchant-input-nobar`}>
              <Input
                value={vercode}
                placeholder="请输入验证码"
                placeholderStyle="fontSize: 26px; color: #cccccc"
                onInput={({detail: {value}}) => this.onChangeValue('vercode', value)}
              />
              <View
                className={`${cssPrefix}-merchant-input-vercode`}
                onClick={() => {
                  if (count === 0) {
                    this.getVercode();
                  }
                }}
              >
                {count === 0 ? "获取验证码" : `重发(${count}s)`}
              </View>
            </View>
          </View>
            
          <View className={`${cssPrefix}-merchant-phone`}>
            当前手机号 {phone}
          </View>
          
          <View className={`product-add-buttons-one ${cssPrefix}-merchant-button`}>
            <AtButton
              className="theme-button"
              onClick={() => this.onSave()}
            >
              <Text className="theme-button-text" >保存</Text>
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

export default UserMerchantEdit;