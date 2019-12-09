/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-01 15:44:11
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import classnames from 'classnames';

const Rows = [
  {
    title: '我的门店',
    icon: '//net.huanmusic.com/weapp/icon_mine_shop.png',
  },
  {
    title: '我的消息',
    icon: '//net.huanmusic.com/weapp/icon_mine_massage.png',
  },
  {
    title: '设置',
    icon: '//net.huanmusic.com/weapp/icon_mine_set.png',
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

  render () {
    return (
      <View className="container">
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-container`}>
          <View className={`${cssPrefix}-user`}>
            <Image 
              src="//net.huanmusic.com/weapp/icon_user.png"
              className={`${cssPrefix}-user-image`}
            />
            <View className={`${cssPrefix}-user-name`}>黄小姐</View>
            <View className={`${cssPrefix}-user-text`}>13705799999</View>
            <View className={`${cssPrefix}-user-text`}>可乐便利店</View>
          </View>

          <View className={`${cssPrefix}-rows`}>
            {
              Rows.map((row) => {
                return (
                  <View key={row.title}>{this.renderRow(row)}</View>
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
        className={classnames('component-form', {
          'component-form-shadow': true
        })}
      >
        <View className={`${cssPrefix}-row`}>
          <View className={`${cssPrefix}-row-left`}>
            {row.icon && (
              <Image src={row.icon}  className={`${cssPrefix}-row-left-icon`} />
            )}
            <Text>{row.title}</Text>
          </View>
          <View className={`${cssPrefix}-row-right`}>
            <View className={`${cssPrefix}-row-right-icon`} />
          </View>
        </View>
      </View>
    );
  }
}

export default UserMain;