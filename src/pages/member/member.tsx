/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-06 10:30:16
 */
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { AtButton } from 'taro-ui';

interface MemberMainProps { }

class MemberMain extends Taro.Component<MemberMainProps> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: '会员管理'
  };

  render () {
    return (
      <View>
        <AtButton onClick={() => Taro.navigateTo({url: '/pages/member/member.detail'})}>
          detail
        </AtButton>
        会员主页
      </View>
    );
  }
}

export default MemberMain;