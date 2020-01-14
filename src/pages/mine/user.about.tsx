/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-09 17:00:39
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";

const cssPrefix = 'user';

type Props = {};

class UserAbount extends Taro.Component<Props> {
  render () {
    return (
      <View className="container">
        <View className={`${cssPrefix}-about-box`}>
          <Image 
            src="//net.huanmusic.com/weapp/icon_mine_shop.png" 
            className={`${cssPrefix}-about-box-img`}
          />
          <Text className={`${cssPrefix}-about-box-title`}>千阳零售</Text>
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