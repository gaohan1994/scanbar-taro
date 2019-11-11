import '@tarojs/async-await';
import Taro, { Component, Config } from '@tarojs/taro';
import { Provider } from '@tarojs/redux';
import Home from './pages/home/home';
import configStore from './store';
import 'taro-ui/dist/style/index.scss';
import "./styles/reset.less";

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

export const store = configStore();

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

      /**
       * @todo [sign相关页面]
       */
      'pages/sign/login',

      /**
       * @todo [报表相关页面]
       */
      'pages/report/report',

      /**
       * @todo [我的相关页面]
       */
      'pages/user/user',

      /**
       * @todo [会员相关]
       */
      'pages/member/member',
      'pages/member/member.add',
      /**
       * @param {id} number
       * 
       * ```js
       * Taro.navigateTo({url: 'pages/member/member.detail?id=1',});
       * ```
       */
      'pages/member/member.detail',
      /**
       * @param {id} number
       * 
       * ```js
       * Taro.navigateTo({url: 'pages/member/member.edit?id=1',});
       * ```
       */
      'pages/member/member.edit',

      /**
       * @todo [支付相关]
       */
      'pages/pay/pay.receive',

      /**
       * @todo [测试页面]
       */
      'pages/test/test',
      'pages/test/test.date.picker',
      'pages/test/test.notice',
      'pages/test/test.accordion',
      'pages/test/test.control',
      'pages/test/test.listview',
      'pages/test/test.cart',
      'pages/test/test.modal',
      'pages/test/test.form',
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
      borderStyle: 'black',
      list: [{
        pagePath: "pages/home/home",
        iconPath: "./assets/tab-bar/icon_nav_home.png",
        selectedIconPath: "./assets/tab-bar/icon_nav_home_xuan.png",
        text: "首页"
      }, {
        pagePath: "pages/report/report",
        iconPath: "./assets/tab-bar/icon_nav_home.png",
        selectedIconPath: "./assets/tab-bar/icon_nav_home_xuan.png",
        text: "报表"
      }, {
        pagePath: "pages/user/user",
        iconPath: "./assets/tab-bar/icon_nav_home.png",
        selectedIconPath: "./assets/tab-bar/icon_nav_home_xuan.png",
        text: "我的"
      }, {
        pagePath: "pages/test/test",
        iconPath: "./assets/tab-bar/icon_nav_user.png",
        selectedIconPath: "./assets/tab-bar/icon_nav_user_xuan.png",
        text: "测试"
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
        <Home />
      </Provider>
    );
  }
}

Taro.render(<App />, document.getElementById('app'));
