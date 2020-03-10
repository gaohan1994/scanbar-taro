/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-02 11:26:13
 */
import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";

const cssPrefix = 'user';

type Props = {};

class UserAbount extends Taro.Component<Props> {

  config: Config = {
    navigationBarTitleText: '关于千阳'
  };
  
  render () {
    return (
      <View className="container">
        <View className={`${cssPrefix}-about-box`}>
          <Image 
            src="//net.huanmusic.com/weapp/v2/logo.png" 
            className={`${cssPrefix}-about-box-img`}
          />
          <Text className={`${cssPrefix}-about-box-title`}>千阳</Text>
          <Text className={`${cssPrefix}-about-box-version`}>版本号V1.0</Text>
        </View>
        <View className={`${cssPrefix}-about-bottom`}>
          <Text className={`${cssPrefix}-about-bottom-text`}>福建升腾资讯 版权所有</Text>
          <Text className={`${cssPrefix}-about-bottom-text`}>Copyright © 2006-2019 Centrem</Text>
          <Text className={`${cssPrefix}-about-bottom-text`}>All Right Reserved</Text>
        </View>
      </View>
    );
  }
}

export default UserAbount;