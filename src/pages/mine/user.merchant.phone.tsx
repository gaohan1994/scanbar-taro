import Taro from '@tarojs/taro';
import { View, Text, Input } from '@tarojs/components';
import { AtButton } from 'taro-ui';
import "../style/user.less";

const cssPrefix = 'user';

type State = {
  value: string;
};

class UserMerchantEdit extends Taro.Component<any, State> {
  readonly state: State = {
    value: ''
  };

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  public onSave = () => {
    Taro.showToast({
      title: '保存成功！'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  }

  render () {
    const { value } = this.state;
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-merchant`}>
          <View className={`${cssPrefix}-merchant-input`}>
            <Input
              value={value}
              onInput={({detail: {value}}) => this.onChangeValue('value', value)}
            />
          </View>
          <View className={`${cssPrefix}-merchant-phone`}>
            当前手机号 123 4567 8900
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