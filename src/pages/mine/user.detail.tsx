/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-21 14:38:18
 */
import Taro, { Config } from '@tarojs/taro';
import { View, Image, } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";
import { FormRowProps } from '../../component/card/form.row';
import FormRow from '../../component/card/form.row';
import { AppReducer } from '../../reducers';
import { getMerchantDetail, getProfileInfo } from '../../reducers/app.merchant';
import { connect } from '@tarojs/redux';
import { MerchantInterface } from '../../constants';
import merchantAction from '../../actions/merchant.action';

const cssPrefix = 'user';

type Props = {
  merchantDetail: MerchantInterface.MerchantDetail;
  userinfo: MerchantInterface.ProfileInfo;
};

type State = {

};

class UserMerchant extends Taro.Component<Props, State> {

  config: Config = {
    navigationBarTitleText: '我的资料'
  };

  async componentDidMount() {
    await merchantAction.profileInfo();
  }

  public getRoles = (): string => {
    const { userinfo } = this.props;
    const { roleNames } = userinfo;
    if (!roleNames || (roleNames && roleNames.length === 0)) {
      return '';
    }
    const arr = roleNames.split(/[,，]/);
    let str = '';
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        str += arr[i];
        if (i !== (arr.length - 1)) {
          str += '/';
        }
      }
      return str;
    } else {
      return '';
    }
  }

  render() {
    const { merchantDetail, userinfo } = this.props;
    const form: FormRowProps[] = [
      {
        title: '姓名',
        extraText: userinfo.userName,
      },
      {
        title: '角色',
        extraText: this.getRoles(),
        hasBorder: false,
        extraTextStyle: 'maxWidth',
      },
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <View className="component-form">
            <FormRow
              title="头像"
              arrow="right"
            >
              {
                userinfo.avatar && userinfo.avatar.length > 0
                  ? (
                    <Image
                      src={userinfo.avatar}
                      className={`${cssPrefix}-detail-img`}
                    />
                  )
                  : (
                    <Image
                      src="//net.huanmusic.com/weapp/icon_vip_user.png"
                      className={`${cssPrefix}-detail-img`}
                    />
                  )
              }

            </FormRow>
            {form.map((item) => {
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
  userinfo: getProfileInfo(state),
});

export default connect(select)(UserMerchant);