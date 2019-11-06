/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-06 14:00:22
 */
import Taro from '@tarojs/taro';
import { View, ScrollView, Image } from '@tarojs/components';
import "./style/member.less";
import "../home/style/home.less";
import { Card } from '../../component/common/card/card.common';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { AtButton, AtMessage } from 'taro-ui';

const cssPrefix: string = 'member';

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
    navigationBarTitleText: '会员详情'
  };

  /**
   * @todo [点击编辑会员事件:跳转到编辑会员页面]
   *
   * @memberof MemberMain
   */
  public onEditClick = () => {
    Taro.atMessage({
      'message': '编辑会员',
      'type': 'success'
    });
  }

  render () {
    const form1: FormRowProps[] = [
      {
        title: '卡号',
        extraText: '001 0000 01'
      },
      {
        title: '性别',
        extraText: '女士'
      },
      {
        title: '生日',
        extraText: '1994-04-25'
      },
    ];
    const form2: FormRowProps[] = [
      {
        title: '开发门店',
        extraText: '杨桥分店'
      },
      {
        title: '开卡时间',
        extraText: '1994-04-25'
      },
    ];
    const form3: FormRowProps[] = [
      {
        title: '会员状态',
        extraText: '正常'
      },
    ];
    return (
      <ScrollView scrollY={true} className={`container`}>
        <AtMessage />
        <Image src="//net.huanmusic.com/weapp/bg_member.png" className={`${cssPrefix}-bg`} />
        <View className={`container ${cssPrefix} ${cssPrefix}-pos`}>
          <Card card-class="home-card member-card">
            <View className={`${cssPrefix}-detail-img`}>
              <Image className={`${cssPrefix}-detail-avator`} src="//net.huanmusic.com/weapp/icon_user.png" />
            </View>
            <View className={`${cssPrefix}-detail`}>
              <View className="title-text">黄小姐</View>
              <View className="small-text">15659995443</View>
            </View>
            <View className="home-buttons member-buttons">
              <View className="member-buttons-button home-buttons-button-border">
                <View className="title-text">100000.00</View>
                <View className="small-text">累计消费</View>
              </View>
              <View className="member-buttons-button">
                <View className="title-text">100000.00</View>
                <View className="small-text">购买次数</View>
              </View>
            </View>
          </Card>
          <FormCard items={form1} />
          <FormCard items={form2} />
          <FormCard items={form3} />

          <View className={`${cssPrefix}-edit`}>
            <AtButton 
              className="theme-button "
              onClick={this.onEditClick}
            >
              编辑
            </AtButton>
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default MemberMain;