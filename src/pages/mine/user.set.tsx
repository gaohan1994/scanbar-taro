/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-09 16:45:53
 */
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { AtButton } from 'taro-ui';

const cssPrefix = 'user';

type Props = {};

class UserMerchant extends Taro.Component<Props> {
  render () {
    const form: FormRowProps[] = [
      {
        title: '更改手机号',
        arrow: 'right',
      },
      {
        title: '重置密码',
        arrow: 'right',
        hasBorder: false
      },
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <FormCard items={form} />

          <View className={`product-add-buttons-one ${cssPrefix}-merchant-button`}>
            <AtButton
              className="theme-button"
              onClick={() => {}}
            >
              <Text className="theme-button-text" >退出登录</Text>
            </AtButton>
          </View>
        </View>
      </View>
    );
  }
}

export default UserMerchant;