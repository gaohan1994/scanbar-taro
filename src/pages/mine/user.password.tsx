import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import "../style/user.less";
import merchantAction from '../../actions/merchant.action';
import Validator from '../../common/util/validator';
import invariant from 'invariant';
import md5 from 'blueimp-md5';
import Item from './component/item'

const cssPrefix = 'user';

type State = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

class UserMerchantEdit extends Taro.Component<any, State> {
  readonly state: State = {
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  };

  config: Taro.Config = {
    navigationBarTitleText: '更改密码'
  };

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  public validate = (): { success: boolean, result: any } => {
    const { oldPassword, newPassword, newPasswordConfirm } = this.state;

    const helper = new Validator();
    helper.add(oldPassword, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入旧密码',
    }, {
      strategy: 'checkValueLengthRange',
      errorMsg: '密码应位3～45位',
      args: {
        minLength: 3,
        maxLength: 45
      }
    }]);
    helper.add(newPassword, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入新密码',
    }, {
      strategy: 'checkValueLengthRange',
      errorMsg: '密码应位3～45位',
      args: {
        minLength: 3,
        maxLength: 45
      }
    }]);
    helper.add(newPasswordConfirm, [{
      strategy: 'isNonEmpty',
      errorMsg: '请再次输入新密码',
    }, {
      strategy: 'checkValueLengthRange',
      errorMsg: '密码应位3～45位',
      args: {
        minLength: 3,
        maxLength: 45
      }
    }]);

    const result = helper.start();
    if (result) {
      return { success: false, result: result.msg };
    }
    return { success: true, result: {} };
  }

  public onSave = async () => {
    const { phone } = this.$router.params;
    const { oldPassword, newPassword, newPasswordConfirm } = this.state;
    try {
      const { success, result } = this.validate();
      invariant(success, result || ' ');
      if (newPassword !== newPasswordConfirm) {
        Taro.showToast({
          title: '两次密码不一致',
          icon: 'none'
        });
        return;
      }
      const params = {
        newPwd: md5(newPassword),
        oldPwd: md5(oldPassword),
        phone: phone
      };
      const res = await merchantAction.profileResetPwd(params);
      if (res.success) {
        Taro.showToast({
          title: '保存成功！'
        });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1000);
      } else {
        Taro.showToast({
          title: res.result || '保存失败',
          icon: 'none'
        });
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render() {
    const { oldPassword, newPassword, newPasswordConfirm } = this.state;
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-merchant`}>
          <View className={`${cssPrefix}-merchant-box`}>
            <View className={`${cssPrefix}-merchant-input`}>
              <Input
                value={oldPassword}
                onInput={({ detail: { value } }) => this.onChangeValue('oldPassword', value)}
                placeholder="请输入旧密码"
                password={true}
              />
            </View>

            <View className={`${cssPrefix}-merchant-input`}>
              <Input
                value={newPassword}
                onInput={({ detail: { value } }) => this.onChangeValue('newPassword', value)}
                placeholder="请输入新密码"
                password={true}
              />
            </View>

            <View className={`${cssPrefix}-merchant-input ${cssPrefix}-merchant-input-nobar`}>
              <Input
                value={newPasswordConfirm}
                onInput={({ detail: { value } }) => this.onChangeValue('newPasswordConfirm', value)}
                placeholder="请再次填写新密码"
                password={true}
              />
            </View>
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