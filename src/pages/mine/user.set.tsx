/*
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-21 14:14:39
 */
import Taro, { Config } from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";
import FormCard from "../../component/card/form.card";
import { FormRowProps } from "../../component/card/form.row";
import { AtButton } from "taro-ui";
import { LoginManager } from "../../common/sdk";
import invariant from "invariant";
import { AppReducer } from "../../reducers";
import { connect } from "@tarojs/redux";
import { getProfileInfo } from "../../reducers/app.merchant";
import { MerchantInterface } from "../../constants";

const cssPrefix = "user";

type Props = {
  userinfo: MerchantInterface.ProfileInfo;
};

class UserMerchant extends Taro.Component<Props> {
  config: Config = {
    navigationBarTitleText: "我的设置"
  };

  public logout = async () => {
    try {
      Taro.showLoading();
      const result = await LoginManager.logout();
      invariant(result.success, result.result || "退出登录失败");
      Taro.navigateTo({ url: "/pages/sign/login" });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  render() {
    const { userinfo } = this.props;
    const form: FormRowProps[] = [
      {
        title: "更改手机号",
        arrow: "right",
        onClick: () => {
          Taro.navigateTo({
            url: `/pages/mine/user.detail.phone?phone=${userinfo.phone}`
          });
        }
      },
      {
        title: "重置密码",
        arrow: "right",
        onClick: () => {
          Taro.navigateTo({
            url: `/pages/mine/user.password?phone=${userinfo.phone}`
          });
        }
      },
      {
        title: "找回密码",
        arrow: "right",
        onClick: () => {
          Taro.navigateTo({
            url: `/pages/sign/password`
          });
        }
      }
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <FormCard items={form} />

          <View
            className={`product-add-buttons-one ${cssPrefix}-merchant-button`}
          >
            <AtButton className="theme-button" onClick={this.logout}>
              <Text className="theme-button-text">退出登录</Text>
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  userinfo: getProfileInfo(state)
});

export default connect(select)(UserMerchant);
