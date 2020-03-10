import '@tarojs/async-await';
import Taro, { Component, Config } from '@tarojs/taro';
import { Provider } from '@tarojs/redux';
// import Home from './pages/home/home';
import configStore from './store';
import { View } from '@tarojs/components';
import 'taro-ui/dist/style/index.scss';
// import './styles/style/index.sass';
import "./styles/reset.less";

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

export const store = configStore() || {};

class App extends Component {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      /**
       * @todo [首页相关页面]
       */
      'pages/home/home',
      "pages/report/report",
      "pages/user/user",
    ],
    subPackages: [
      {
        root: 'pages/mine',
        pages: [
          'user.merchant',
          'user.set',
          'user.about',
          'user.detail',
          'user.merchant.name',
          'user.merchant.address',
          'user.merchant.owner',
          'user.merchant.phone',
          'user.detail.phone',
          'user.password',
        ],
      },
      {
        /**
         * @todo [盘点模块]
         */
        root: 'pages/inventory',
        pages: [
          'inventory.main',
          'inventory.pay',
          'inventory.purchase.detail',
          'inventory.list',
          'inventory.stock',
          'inventory.stock.detail',
          'inventory.stock.pay',
          'inventory.stock.list',
        ]
      },
      {
        /**
         * @todo 订单模块
         * 
         * ```ts
         * Taro.navigateTo({url: 'pages/order/order.detail?id=1'});
         * ```
         */
        root: 'pages/order',
        pages: [
          'order.main',
          'order.detail',
          'order.refund',
        ],
      },
      {
        root: 'pages/pay',
        pages: [
          'pay.input',
          'pay.receive',
          'pay.result',
        ],
      },
      {
        /**
         * @param {id} number
         * 
         * ```js
         * Taro.navigateTo({url: 'pages/member/member.detail?id=1',});
         * Taro.navigateTo({url: 'pages/member/member.edit?id=1',});
         * ```
         */
        root: 'pages/member',
        pages: [
          'member',
          'member.add',
          'member.detail',
          'member.edit',
        ],
      },
      {
        root: 'pages/sign',
        pages: [
          'login'
        ]
      },
      {
        /**
         * @todo [商品详情]
         * 
         * @todo [开单页面]
         * @todo [商品管理页面]
         * ```js
         * Taro.navigateTo({
         *    url: `/pages/product/product.detail?id=${product.id}`
         * });
         * ```
         */
        root: 'pages/product',
        pages: [
          'product.order',
          'product.pay',
          'product.manage',
          'product.detail',
          'product.add',
          'product.suspension',
          'product.refund',
          'product.refund.pay',
        ],
      }
    ], 
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#2a86fc',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'white',
    },
    tabBar: {
      color: "#ACACAC",
      selectedColor: "#2EAAF8",
      backgroundColor: "#ffffff",
      borderStyle: 'white',
      list: [{
        pagePath: "pages/home/home",
        iconPath: "./assets/tab-bar/icon_nav_home.png",
        selectedIconPath: "./assets/tab-bar/icon_nav_home_xuan.png",
        text: "首页"
      }, {
        pagePath: "pages/report/report",
        iconPath: "./assets/tab-bar/icon_reportforms.png",
        selectedIconPath: "./assets/tab-bar/icon_reportforms_xuan.png",
        text: "数据"
      }, {
        pagePath: "pages/user/user",
        iconPath: "./assets/tab-bar/icon_mine.png",
        selectedIconPath: "./assets/tab-bar/icon_mine_xuan.png",
        text: "我的"
      }]
    }
  };

  /**
   * 在 App 类中的 render() 函数没有实际作用
   * 请勿修改此函数
   */
  render () {
    return (
      <Provider store={store}>
        {/* <Home /> */}
        <View />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
