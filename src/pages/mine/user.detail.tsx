/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-09 17:06:54
 */
import Taro from '@tarojs/taro';
import { View, Image, } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import "../style/product.less";
import { FormRowProps } from '../../component/card/form.row';
import FormRow from '../../component/card/form.row';

const cssPrefix = 'user';

type Props = {};

class UserMerchant extends Taro.Component<Props> {
  render () {
    const form: FormRowProps[] = [
      {
        title: '姓名',
        extraText: '黄可乐',
      },
      {
        title: '角色',
        extraText: '店长',
        hasBorder: false
      },
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <View className="component-form">
            <FormRow
              title="头像"
              arrow="right"
            >
              <Image 
                src="//net.huanmusic.com/weapp/icon_user.png" 
                className={`${cssPrefix}-detail-img`}
              />
            </FormRow>
            {form.map((item) => {
              return <FormRow key={item.title} {...item} />;
            })}
          </View>
        </View>
      </View>
    );
  }
}

export default UserMerchant;