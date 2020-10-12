/*
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-14 11:55:30
 */
import Taro, { Config } from "@tarojs/taro";
import { View, Image } from "@tarojs/components";
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";
import { FormRowProps } from "../../component/card/form.row";
import FormRow from "../../component/card/form.row";
import { AppReducer } from "../../reducers";
import { getMerchantDetail, getProfileInfo } from "../../reducers/app.merchant";
import { connect } from "@tarojs/redux";
import { MerchantInterface } from "../../constants";
import merchantAction from "../../actions/merchant.action";
import getBaseUrl from "../../common/request/base.url";
import { LoginManager } from "../../common/sdk";
import { ResponseCode } from "../../constants/index";

const cssPrefix = "user";

type Props = {
  merchantDetail: MerchantInterface.MerchantDetail;
  userinfo: MerchantInterface.ProfileInfo;
};

type State = {};

class UserMerchant extends Taro.Component<Props, State> {
  config: Config = {
    navigationBarTitleText: "我的资料"
  };

  async componentDidMount() {
    await merchantAction.profileInfo();
  }

  public getRoles = (): string => {
    const { userinfo } = this.props;
    const { roleNames } = userinfo;
    if (!roleNames || (roleNames && roleNames.length === 0)) {
      return "";
    }
    const arr = roleNames.split(/[,，]/);
    let str = "";
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        str += arr[i];
        if (i !== arr.length - 1) {
          str += "/";
        }
      }
      return str;
    } else {
      return "";
    }
  };


  private uploadAvatarHandle =async () => {
    try{
      const chooseImageResult = await Taro.chooseImage({
        // type: string = "album"
        // sizeType: ["compressed"],
        // sourceType: [type],
        // count: 1,
      })

      const { result } = LoginManager.getUserToken();
      const tempFilePaths = chooseImageResult.tempFilePaths
      console.log(tempFilePaths);
      
      const uploadResult = await Taro.uploadFile({
        url: `${getBaseUrl("")}/profile/uploadAvatar`,
        filePath: tempFilePaths[0],
        name: 'avatarfile',
        header: { Authorization: result }          
      })
      const data = JSON.parse(uploadResult.data)
      console.log(data);
      if (data.code === ResponseCode.success) {
        // 保存成功，重新获取用户信息
        await merchantAction.profileInfo();
      } else {
        throw new Error(data.msg || "上传图片失败");
      }
    }catch(error) {
      Taro.showToast({
        title: error.message || "上传图片失败",
        icon: "none"
      });
    }
  }

  render() {
    const { merchantDetail, userinfo } = this.props;
    const form: FormRowProps[] = [
      {
        title: "姓名",
        extraText: userinfo.userName
      },
      {
        title: "角色",
        extraText: this.getRoles(),
        hasBorder: false,
        extraTextStyle: "maxWidth"
      }
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <View className="component-form">
            <FormRow title="头像" arrow="right" onClick={() => { this.uploadAvatarHandle()}}>
              {userinfo.avatar && userinfo.avatar.length > 0 ? (
                <Image
                  src={`${userinfo.avatar}`}
                  className={`${cssPrefix}-detail-img`}
                />
              ) : (
                <Image
                  src="//net.huanmusic.com/weapp/icon_vip_user.png"
                  className={`${cssPrefix}-detail-img`}
                />
              )}
            </FormRow>
            {form.map(item => {
              return <FormRow key={item.title} {...item} />;
            })}
          </View>
        </View>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  merchantDetail: getMerchantDetail(state),
  userinfo: getProfileInfo(state)
});

export default connect(select)(UserMerchant);
