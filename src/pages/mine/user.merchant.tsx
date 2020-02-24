/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-21 14:11:08
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getProfileInfo } from '../../reducers/app.merchant';
import { MerchantInterface } from '../../constants';
import merchantAction from '../../actions/merchant.action';

const cssPrefix = 'user';

type Props = {
  userinfo: MerchantInterface.ProfileInfo;
};

type State = {
  
};
class UserMerchant extends Taro.Component<Props, State> {
  config: Taro.Config = {
    navigationBarTitleText: '我的门店'
  };

  async componentDidMount() {
    await merchantAction.profileInfo();
  }

  render () {
    const { userinfo } = this.props;
    const { merchantInfoDTO } = userinfo;
    const form1: FormRowProps[] = [
      {
        title: '门店编号',
        extraText: merchantInfoDTO.id,
        extraTextColor: '#999999',
      },
      {
        title: '门店名称',
        extraText: merchantInfoDTO.name,
        onClick: () => {
          Taro.navigateTo({url: `/pages/mine/user.merchant.name?id=${merchantInfoDTO.id}&name=${merchantInfoDTO.name}`});
        },
        arrow: 'right',
        extraTextColor: '#999999',
      },
      {
        title: '地址',
        extraText: merchantInfoDTO.address,
        onClick: () => {
          Taro.navigateTo({url: `/pages/mine/user.merchant.address?id=${merchantInfoDTO.id}&address=${merchantInfoDTO.address}`});
        },
        arrow: 'right',
        extraTextColor: '#999999',
        hasBorder: false
      },
    ];

    const form2: FormRowProps[] = [
      {
        title: '负责人',
        extraText: merchantInfoDTO.contactName,
        extraTextColor: '#999999',
        onClick: () => {
          Taro.navigateTo({url: `/pages/mine/user.merchant.owner?id=${merchantInfoDTO.id}&owner=${merchantInfoDTO.contactName}`});
        },
        arrow: 'right'
      },
      {
        title: '手机号',
        extraText: merchantInfoDTO.phoneNumber,
        arrow: 'right',
        onClick: () => {
          Taro.navigateTo({url: `/pages/mine/user.merchant.phone?id=${merchantInfoDTO.id}&phone=${merchantInfoDTO.phoneNumber}`});
        },
        extraTextColor: '#999999',
        hasBorder: false,
      },
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <FormCard items={form1} />
          <FormCard items={form2} />
        </View>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  userinfo: getProfileInfo(state),
});

export default connect(select)(UserMerchant);
