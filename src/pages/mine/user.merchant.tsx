/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-10 15:32:26
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../../component/card/form.card.less";
import classnames from 'classnames';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';

const cssPrefix = 'user';

type Props = {};

class UserMerchant extends Taro.Component<Props> {
  render () {
    const form1: FormRowProps[] = [
      {
        title: '门店编号',
        extraText: '001',
        extraTextColor: '#999999',
      },
      {
        title: '门店名称',
        extraText: '可乐便利店杨桥门店',
        onClick: () => {
          Taro.navigateTo({url: '/pages/mine/user.merchant.name'});
        },
        arrow: 'right',
        extraTextColor: '#999999',
      },
      {
        title: '地址',
        extraText: '福建省福州市鼓楼区',
        onClick: () => {
          Taro.navigateTo({url: '/pages/mine/user.merchant.address'});
        },
        arrow: 'right',
        extraTextColor: '#999999',
        hasBorder: false
      },
    ];

    const form2: FormRowProps[] = [
      {
        title: '负责人',
        extraText: '黄橙1',
        extraTextColor: '#999999',
        onClick: () => {
          Taro.navigateTo({url: '/pages/mine/user.merchant.owner'});
        },
        arrow: 'right'
      },
      {
        title: '手机号',
        extraText: '15659995443',
        arrow: 'right',
        onClick: () => {
          Taro.navigateTo({url: '/pages/mine/user.merchant.phone'});
        },
        extraTextColor: '#999999',
        hasBorder: false,
      },
    ];
    return (
      <View className="container container-color">
        <View className={`container-color ${cssPrefix}-merchant`}>
          <FormCard items={form1} />
          <FormCard items={form2} />
        </View>
      </View>
    );
  }
}

export default UserMerchant;