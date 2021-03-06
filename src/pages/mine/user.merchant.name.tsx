import Taro from "@tarojs/taro";
import { View, Text, Input } from "@tarojs/components";
import { AtButton } from "taro-ui";
import "../style/user.less";
import merchantAction from "../../actions/merchant.action";
import Item from "./component/item";

const cssPrefix = "user";

type State = {
  value: string;
};

class UserMerchantEdit extends Taro.Component<any, State> {
  readonly state: State = {
    value: ""
  };

  config: Taro.Config = {
    navigationBarTitleText: "更改门店名称"
  };

  componentDidMount() {
    const { name } = this.$router.params;
    this.setState({
      value: name
    });
  }

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  };

  public onSave = async () => {
    const { id } = this.$router.params;
    const params = {
      id: id,
      name: this.state.value
    };
    const res = await merchantAction.merchantInfoEdit(params);
    if (res.success) {
      await merchantAction.profileInfo();
      Taro.showToast({
        title: "保存成功！"
      });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    } else {
      Taro.showToast({
        title: "保存失败！",
        icon: "none"
      });
    }
  };

  render() {
    const { value } = this.state;
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-merchant`}>
          <Item>
            <Input
              value={value}
              maxLength={15}
              className={`${cssPrefix}-merchant-area`}
              onInput={({ detail: { value } }) =>
                this.onChangeValue("value", value)
              }
            />
          </Item>

          <View
            className={`product-add-buttons-one ${cssPrefix}-merchant-button`}
          >
            <AtButton className="theme-button" onClick={() => this.onSave()}>
              <Text className="theme-button-text">保存</Text>
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

export default UserMerchantEdit;
