/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-06 17:55:33
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../style/member.less";
import "../style/home.less";
import "../style/report.less";
import "../../component/card/form.card.less";
import classnames from 'classnames';
import { Card } from '../../component/common/card/card.common';

const tabs = [
  {
    title: '所有门店'
  },
  {
    title: '经营报表'
  },
  {
    title: '今日'
  }
];
const Rows = [
  {
    title: '退货统计',
  },
  {
    title: '收款方式统计',
  },
  {
    title: '退款方式统计',
  }
];

const cssPrefix = 'report';
const userCssPrefix = 'user';
const memberCssPrefix = 'member';

interface ReportMainProps { }

class ReportMain extends Taro.Component<ReportMainProps> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: '报表'
  };

  render () {
    return (
      <View className="container">
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-tabs`}>
          {
            tabs.map((tab) => {
              return (
                <View  className={`${cssPrefix}-tab`} key={tab.title}>{this.renderTab(tab)}</View>
              );
            })
          }
        </View>
        <View className={`${cssPrefix}-container`}>
          <Card card-class="home-card member-card report-card">
            <View className={`${cssPrefix}-detail`}>
              <View className={`${cssPrefix}-detail-title`}>{'—  销售额  —'}</View>
              <View className={`${cssPrefix}-detail-price`}>{'￥ 1000.00'}</View>
            </View>
            <View className="home-buttons member-buttons">
              <View className="member-buttons-button home-buttons-button-border">
                <View className="title-text">200</View>
                <View className="small-text">累计消费</View>
              </View>
              <View className="member-buttons-button home-buttons-button-border">
                <View className="title-text">200</View>
                <View className="small-text">购买次数</View>
              </View>
              <View className="member-buttons-button ">
                <View className="title-text">200</View>
                <View className="small-text">累计消费</View>
              </View>
            </View>
          </Card>
          <View className={`${userCssPrefix}-rows`}>
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
        <View className={`${userCssPrefix}-row`}>
          <View className={`${userCssPrefix}-row-left`}>
            {row.icon && (
              <Image src={row.icon}  className={`${userCssPrefix}-row-left-icon`} />
            )}
            <Text>{row.title}</Text>
          </View>
          <View className={`${userCssPrefix}-row-right`}>
            <View className={`${cssPrefix}-row-extra-icon`} />
          </View>
        </View>
      </View>
    );
  }

  private renderTab = (tab: any) => {
    return (
      <View  className={`${cssPrefix}-tab`} >
        <Text className={`${cssPrefix}-tab-text`}>{tab.title}</Text>
        <View className={`${cssPrefix}-tab-icon`} />
      </View>
    );
  }
}

export default ReportMain;