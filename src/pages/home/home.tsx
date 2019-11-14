import { ComponentClass } from 'react';
import Taro, { Component, Config } from '@tarojs/taro';
import { View, Image, Text, Swiper, SwiperItem } from '@tarojs/components';
import './style/home.less';
import classnames from 'classnames';
import { LoginManager } from '../../common/sdk';
import { AtTabs, AtTabsPane, AtGrid } from 'taro-ui';
import TradeList from '../../component/product/list';

type PageState = {};
type IProps = {};

interface Home {
  props: IProps;
}

interface State {
  current: any;
}

class Home extends Component<any, State> {

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

  constructor () {
    super(...arguments);
    this.state = {
      current: 0,
    };
  }
  handleClick (value: any) {
    this.setState({
      current: value
    });
  }

  async componentDidShow () {
    const userinfo = await LoginManager.login();
    console.log('userinfo: ', userinfo);
  }

  /**
   * @todo [跳转函数]
   *
   * @memberof Home
   */
  public onNavHandle = ({url}: {url: string}) => {
    Taro.navigateTo({url});
  }

  render () {
    const swiperData = [1, 2, 3, 4, 5];
    const tabList = [{ title: '二手图书' }, { title: '推荐小物' }, { title: '美妆口红' }, { title: '科技数码' }, { title: '二手电动车' }];
    return (
      <View className={classnames(['container', 'home'])}>
        <Swiper
          className='home-swiper'
          indicatorColor='#999'
          indicatorActiveColor='#333'
          circular={true}
          indicatorDots={true}
          autoplay={true}
        >
          {
            swiperData.map((item) => {
              return (
                <SwiperItem key={item}>
                  <Image 
                    className='home-swiper-image'
                    src="https://img11.360buyimg.com/babel/s700x360_jfs/t1/4776/39/2280/143162/5b9642a5E83bcda10/d93064343eb12276.jpg!q90!cc_350x180" 
                  />
                </SwiperItem>
              );
            })
          }
        </Swiper>
        <View className='home-grid'>
          <AtGrid 
            
            data={
              [
                {
                  image: 'https://img12.360buyimg.com/jdphoto/s72x72_jfs/t6160/14/2008729947/2754/7d512a86/595c3aeeNa89ddf71.png',
                  value: '书籍笔记'
                },
                {
                  image: 'https://img20.360buyimg.com/jdphoto/s72x72_jfs/t15151/308/1012305375/2300/536ee6ef/5a411466N040a074b.png',
                  value: '日用电器'
                },
                {
                  image: 'https://img10.360buyimg.com/jdphoto/s72x72_jfs/t5872/209/5240187906/2872/8fa98cd/595c3b2aN4155b931.png',
                  value: '零食水果'
                },
                {
                  image: 'https://img12.360buyimg.com/jdphoto/s72x72_jfs/t10660/330/203667368/1672/801735d7/59c85643N31e68303.png',
                  value: '生活用品'
                },
                {
                  image: 'https://img14.360buyimg.com/jdphoto/s72x72_jfs/t17251/336/1311038817/3177/72595a07/5ac44618Na1db7b09.png',
                  value: '服饰鞋包'
                },
                {
                  image: 'https://img30.360buyimg.com/jdphoto/s72x72_jfs/t5770/97/5184449507/2423/294d5f95/595c3b4dNbc6bc95d.png',
                  value: '美妆捡漏'
                }
              ]
            } 
          />
        </View>

        <View className="home-grid">
          <AtTabs 
            current={this.state.current} 
            tabList={tabList} 
            scroll={true}
            onClick={(params) => this.handleClick(params)}
          >
            <AtTabsPane current={this.state.current} index={0} >
              <TradeList />
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={1}>
              <TradeList />
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={2}>
              <TradeList />
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={3}>
              <TradeList />
            </AtTabsPane>
            <AtTabsPane current={this.state.current} index={4}>
              <TradeList />
            </AtTabsPane>
            
          </AtTabs>
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
