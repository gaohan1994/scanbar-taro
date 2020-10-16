import Taro, { Component, Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import '../style/home.less';
import classnames from 'classnames';
import { Card } from '../../component/common/card/card.common';
import invariant from 'invariant';
import { ReportAction } from '../../actions';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import { getReportTodayData } from '../../reducers/app.report';
import { ReportInterface, MerchantInterface } from '../../constants';
import { getProfileInfo } from '../../reducers/app.merchant';
import merchantAction from '../../actions/merchant.action';
import { ResponseCode } from '../../constants/index';
import loginManager from '../../common/sdk/sign/login.manager';
import HomeMenus from './component/menus';
import { isPermissedRender } from '../../component/AuthorizedGroup/AuthorizedItem'

const cssPrefix = 'home';

interface Props {
  reportTodayData: ReportInterface.ReportTodayData;
  userinfo: MerchantInterface.ProfileInfo;
}
interface State {
  userinfo: MerchantInterface.ProfileInfo;
}
class Home extends Component<Props, State> {
  state = {
    userinfo: {} as any
  };

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页'
  };

  async componentDidShow() {
    try {
      const res = await merchantAction.profileInfo();
      invariant(res.code === ResponseCode.success, res.msg || ' ');
      const { userinfo } = this.props;
      const payload = {
        merchantId: userinfo.merchantInfoDTO.id
      };
      this.setState({ userinfo });
      loginManager.getUserInfo();
      
      if(isPermissedRender('cashier:menu:my')) {
        ReportAction.reportTodayData(payload);
      }
      merchantAction.pointConfigDetail();
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none',
        duration: 500,
      });
    }
  }

  /**
   * @todo 修改 没有登录过的用户则跳转到登录才能使用
   *
   * @memberof Home
   */
  public nav = (url: string, tab = false) => {
    if (!loginManager.getUserToken().success) {
      Taro.showModal({
        title: '提示',
        content: '请先登录',
        success: (result) => {
          if (result.confirm) {
            Taro.redirectTo({
              url: `/pages/sign/login`
            })
          }
        }
      })
      return;
    }

    if (!!tab) {
      Taro.switchTab({
        url: url
      });
      return;
    }

    Taro.navigateTo({
      url
    })
  }

  render() {
    const { reportTodayData } = this.props;
    const { userinfo } = this.state;
    return (
      <View className={classnames(['container', 'home'])}>
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-container`}>
          <View className="home-name">
            <Image src="//net.huanmusic.com/weapp/icon_shop.png" className={classnames(['home-name-icon', 'home-icon'])} />
            <Text className="home-name-text">{userinfo.merchantInfoDTO.name || ''}</Text>
          </View>
          {
            true && <View className="home-card">
            <View className="home-buttons">
              <View
                className={`home-buttons-button home-buttons-button-border ${cssPrefix}-buttons-button-start`}
                onClick={() => this.nav('/pages/report/report', true)}
              >
                <View className={`home-normal-text ${cssPrefix}-buttons-button-box`}>
                  <View>{`今日销售额`}</View>
                  <Image
                    className={`${cssPrefix}-buttons-button-into`}
                    src="//net.huanmusic.com/weapp/v1/icon_home_into.png"
                  />
                </View>
                <View className="home-money">{reportTodayData.todaySales || 0}</View>
              </View>
              <View
                className="home-buttons-button home-buttons-button-end"
                onClick={() => this.nav('/pages/report/report', true)}
              >
                <View className={`home-normal-text ${cssPrefix}-buttons-button-box`}>
                  <View>{`销售笔数`}</View>
                  <Image
                    className={`${cssPrefix}-buttons-button-into`}
                    src="//net.huanmusic.com/weapp/v1/icon_home_into.png"
                  />
                </View>
                <View className="home-money">{reportTodayData.todaySaleTimes || 0}</View>
              </View>
            </View>
          </View>
          }
          
          {isPermissedRender('cashier:menu:billing') && <View onClick={() => this.nav('/pages/product/product.order')}>
            <Card card-class="home-order">
              <Image src="//net.huanmusic.com/weapp/icon_home_bill.png" className="home-order-icon" />
              <Text className="home-order-text" >开单</Text>
            </Card>
          </View>}
          <HomeMenus />
        </View>
      </View>
    );
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

const select = (state: AppReducer.AppState) => ({
  reportTodayData: getReportTodayData(state),
  userinfo: getProfileInfo(state),
});

export default connect(select)(Home);

// export default Home as ComponentClass<IProps, PageState>;
