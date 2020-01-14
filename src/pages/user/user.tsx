/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-09 17:16:01
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import classnames from 'classnames';

const Rows = [
  {
    title: '我的门店',
    url: '/pages/mine/user.merchant',
    icon: '//net.huanmusic.com/weapp/icon_mine_shop.png',
  },
  {
    title: '我的设置',
    url: '/pages/mine/user.set',
    icon: '//net.huanmusic.com/weapp/icon_mine_massage.png',
  },
  {
    title: '关于千阳',
    url: '/pages/mine/user.about',
    icon: '//net.huanmusic.com/weapp/icon_mine_about.png',
  }
];

const cssPrefix = 'user';

interface UserMainProps { }

class UserMain extends Taro.Component<UserMainProps> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: '我的'
  };

  public onRowClick = (row: any) => {
    Taro.navigateTo({
      url: `${row.url}`
    });
  }

  public onNavDetail = () => {
    Taro.navigateTo({
      url: `/pages/mine/user.detail`
    });
  }

  render () {
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-container`}>
          <View 
            className={`${cssPrefix}-user`}
            onClick={() => this.onNavDetail()}
          >
            <Image 
              src="//net.huanmusic.com/weapp/icon_user.png"
              className={`${cssPrefix}-user-image`}
            />
            <View className={`${cssPrefix}-user-name`}>黄小姐</View>
            <View className={`${cssPrefix}-user-text`}>采购专员</View>
          </View>

          <View 
            className={`${cssPrefix}-user-edit`}
            onClick={() => {}}
          >
            <Image 
              src="//net.huanmusic.com/weapp/icon_edit.png"
              className={`${cssPrefix}-user-edit-img`}
            />
          </View>
          <View className={`${cssPrefix}-rows component-form`}>
            {
              Rows.map((row) => {
                return (
                  <View 
                    key={row.title}
                    onClick={() => this.onRowClick(row)}
                  >
                    {this.renderRow(row)}
                  </View>
                );
              })
            }
          </View>
        </View>
      </View>
    );
  }

  private renderRow = (row: any) => {
    return (
      <View 
        className={`${cssPrefix}-row`}
      >
        <View className={`${cssPrefix}-row-left`}>
          {row.icon && (
            <Image src={row.icon}  className={`${cssPrefix}-row-left-icon`} />
          )}
          <Text className={`${cssPrefix}-row-title`}>{row.title}</Text>
        </View>
        <View className={`${cssPrefix}-row-right`}>
          <View className={`${cssPrefix}-row-right-icon`} />
        </View>
      </View>
    );
  }
}

export default UserMain;