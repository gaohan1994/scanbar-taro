import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import '../style/home.less';
import classnames from 'classnames';
import { Card } from '../../component/common/card/card.common';
import { LoginManager } from '../../common/sdk';
import invariant from 'invariant';

const cssPrefix = 'home';

const NavItems = [
  {
    image: '//net.huanmusic.com/weapp/icon_menu_commodity.png',
    value: '商品管理',
    subTitle: 'Commodity management',
    url: '/pages/product/product.manage',
  },
  {
    image: '//net.huanmusic.com/weapp/-icon_menu_member.png',
    value: '会员管理',
    subTitle: 'Member management',
    url: '/pages/member/member',
  },
  {
    image: '//net.huanmusic.com/weapp/-icon_menu_proceeds.png',
    value: '收款',
    subTitle: 'Gathering',
    url: '/pages/pay/pay.input',
  },
  {
    image: '//net.huanmusic.com/weapp/icon_menu_details.png',
    value: '订单',
    subTitle: 'Transcation details',
    url: '/pages/order/order.main',
  },
  {
    image: '//net.huanmusic.com/weapp/icon_menu_procurement1.png',
    value: '采购',
    subTitle: 'Procurement',
    url: '/pages/inventory/inventory.list',
  },
  {
    image: '//net.huanmusic.com/weapp/icon_menu_inventory1.png',
    value: '进货',
    subTitle: 'inventory',
    url: '/pages/inventory/inventory.main',
  },
  {
    image: '//net.huanmusic.com/weapp/icon_menu_more.png',
    value: '更多',
    subTitle: 'Even more',
    url: '/pages/',
  },
  {
    image: '//net.huanmusic.com/weapp/icon_menu_more.png',
    value: '退货',
    subTitle: 'Even more',
    url: '/pages/product/product.refund',
  },
  {
    image: '//net.huanmusic.com/weapp/icon_menu_more.png',
    value: '测试主页',
    subTitle: 'Even more',
    url: '/pages/test/test',
  }
];

type PageState = {};
type IProps = {};

interface Home {
  props: IProps;
}

class Home extends Component {

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

  async componentDidMount () {
    try {
      const userinfo = await LoginManager.getUserInfo();
      invariant(userinfo.success, userinfo.msg || ' ');
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none',
        duration: 500,
        success: () => {
          Taro.navigateTo({ url: '/pages/sign/login' });
        }
      });
    }
  }

  /**
   * @todo [跳转函数]
   *
   * @memberof Home
   */
  public onNavHandle = (item: any) => {
    if (
      item.value === '盘点' ||
      item.value === '更多'
    ) {
      Taro.showToast({
        icon: 'none',
        title: '正在开发中'
      });
      return;
    }
    Taro.navigateTo({url: item.url});
  }

  render () {
    return (
      <View className={classnames(['container', 'home'])}>
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-container`}>
          <View className="home-name">
            <Image src="//net.huanmusic.com/weapp/icon_shop.png" className={classnames(['home-name-icon', 'home-icon'])} />
            <Text className="home-name-text">可乐便利店</Text>
          </View>
          <View className="home-card">
            <View className="home-buttons">
              <View 
                className={`home-buttons-button home-buttons-button-border ${cssPrefix}-buttons-button-start`}
                onClick={() => Taro.switchTab({url: '/pages/report/report'})}
              >
                <View className={`normal-text ${cssPrefix}-buttons-button-box`}>
                  <View>{`今日销售额 >`}</View>
                </View>
                <View className="home-money">100000.00</View>
              </View>
              <View 
                className="home-buttons-button home-buttons-button-end"
                onClick={() => Taro.switchTab({url: '/pages/report/report'})}
              >
                <View className={`normal-text ${cssPrefix}-buttons-button-box`}>
                  <View>{`销售笔数 >`}</View>
                </View>
                <View className="home-money">200</View>
              </View>
            </View>
          </View>
          <View onClick={() => Taro.navigateTo({url: '/pages/product/product.order'})}>
            <Card card-class="home-order">
              <Image src="//net.huanmusic.com/weapp/icon_home_bill.png" className="home-order-icon" />
              <Text className="home-order-text" >开单</Text>
            </Card>
          </View>
          <View className="home-bar">
            {
              NavItems.map((item, index) => {
                return (
                  <Card 
                    key={item.value}
                    shadow={false} 
                    card-class={`home-bar-card ${(index + 1) % 3 !== 0 ? 'home-bar-card-right' : ''}`} 
                  >
                    <View className="home-bar-card-content" onClick={() => this.onNavHandle(item)}>
                      <Image className="home-icon home-card-icon" src={item.image} />
                      <Text className="normal-text">{item.value}</Text>
                      <Text className="home-small-text">{item.subTitle}</Text>
                    </View>
                  </Card>
                );
              })
            }
          </View>
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

export default Home as ComponentClass<IProps, PageState>;
