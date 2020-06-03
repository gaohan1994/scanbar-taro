/*
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-14 11:56:09
 */
import Taro from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "../style/user.less";
import "../../component/card/form.card.less";
import merchantAction from "../../actions/merchant.action";
import { AppReducer } from "../../reducers";
import { connect } from "@tarojs/redux";
import { getProfileInfo } from "../../reducers/app.merchant";
import { MerchantInterface } from "src/constants";
import loginManager from "../../common/sdk/sign/login.manager";

const Rows = [
  {
    title: "我的门店",
    url: "/pages/mine/user.merchant",
    icon: "//net.huanmusic.com/weapp/icon_mine_shop.png",
  },
  {
    title: "我的设置",
    url: "/pages/mine/user.set",
    icon: "//net.huanmusic.com/weapp/icon_mine_massage.png",
  },
  {
    title: "关于星亿腾",
    url: "/pages/mine/user.about",
    icon: "//net.huanmusic.com/weapp/icon_mine_about.png",
  },
];

const cssPrefix = "user";

interface UserMainProps {
  userinfo: MerchantInterface.ProfileInfo;
}
interface UserMainState {
  userinfo: MerchantInterface.ProfileInfo;
}

class UserMain extends Taro.Component<UserMainProps, UserMainState> {
  state = {
    userinfo: {} as any,
  };

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: "我的",
  };

  async componentDidShow() {
    await this.init();
  }

  public init = async () => {
    /**
     * @todo [请求商户详情]
     */
    // merchantAction.merchantDetail();
    await merchantAction.profileInfo();
    const { userinfo } = this.props;
    this.setState({ userinfo });
  };

  public onRowClick = (row: any) => {
    Taro.navigateTo({
      url: `${row.url}`,
    });
  };

  public onNavDetail = () => {
    Taro.navigateTo({
      url: `/pages/mine/user.detail`,
    });
  };

  public getRoles = (): string => {
    const { userinfo } = this.props;
    const { roleNames } = userinfo;
    if (!roleNames || (roleNames && roleNames.length === 0)) {
      return "";
    }
    const arr = roleNames.split(/[,，]/);
    let str = "";
    if (arr.length > 0) {
      const index = arr.length > 3 ? 3 : arr.length;
      for (let i = 0; i < index; i++) {
        str += arr[i];
        if (i !== index - 1) {
          str += "/";
        }
      }
      if (arr.length > 3) {
        str += "/...";
      }
      return str;
    } else {
      return "";
    }
  };

  render() {
    const { userinfo } = this.state;
    const { roleNames } = userinfo;
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-container`}>
          <View
            className={`${cssPrefix}-user`}
            onClick={() =>
              loginManager.checkAuth(() => {
                this.onNavDetail();
              })
            }
          >
            {userinfo.avatar && userinfo.avatar.length > 0 ? (
              <Image
                src={`${userinfo.avatar}`}
                className={`${cssPrefix}-user-image`}
              />
            ) : (
              <Image
                src="//net.huanmusic.com/weapp/icon_mine_touxiang.png"
                className={`${cssPrefix}-user-image`}
              />
            )}

            {roleNames && roleNames.length > 0 && (
              <View className={`${cssPrefix}-user-box`}>
                <View className={`${cssPrefix}-user-name`}>
                  {userinfo.userName}
                  {userinfo.roleNames && (
                    <View className={`${cssPrefix}-user-level`}>
                      {this.getRoles()}
                    </View>
                  )}
                </View>
                <View className={`${cssPrefix}-user-text`}>
                  {userinfo.phone}
                </View>
              </View>
            )}
          </View>

          <View
            className={`${cssPrefix}-user-edit`}
            onClick={() =>
              loginManager.checkAuth(() => {
                this.onNavDetail();
              })
            }
          >
            <Image
              src="//net.huanmusic.com/weapp/icon_edit.png"
              className={`${cssPrefix}-user-edit-img`}
            />
          </View>
          <View className={`${cssPrefix}-rows component-form`}>
            {Rows.map((row) => {
              return (
                <View
                  key={row.title}
                  onClick={() =>
                    loginManager.checkAuth(() => {
                      this.onRowClick(row);
                    })
                  }
                >
                  {this.renderRow(row)}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  private renderRow = (row: any) => {
    return (
      <View className={`${cssPrefix}-row`}>
        <View className={`${cssPrefix}-row-left`}>
          {row.icon && (
            <Image src={row.icon} className={`${cssPrefix}-row-left-icon`} />
          )}
          <Text className={`${cssPrefix}-row-title`}>{row.title}</Text>
        </View>
        <View className={`${cssPrefix}-row-right`}>
          <View className={`${cssPrefix}-row-right-icon`} />
        </View>
      </View>
    );
  };
}

const select = (state: AppReducer.AppState) => ({
  userinfo: getProfileInfo(state),
});

export default connect(select)(UserMain);
