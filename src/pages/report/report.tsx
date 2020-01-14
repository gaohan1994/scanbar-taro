/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-10 15:07:09
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../style/member.less";
import "../style/home.less";
import "../style/report.less";
import "../../component/card/form.card.less";
import moment from 'dayjs';
import ModalLayout from '../../component/layout/modal.layout';
import ReportRow from '../../component/report/row';

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

const cssPrefix = 'report';

interface ReportMainProps { }

type State = {
  saleVisible: boolean;
};

class ReportMain extends Taro.Component<ReportMainProps, State> {

  readonly state: State = {
    saleVisible: false,
  };
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

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  render () {
    return (
      <View className="container container-color">
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
          {this.renderTime()}
          {this.renderCard()}
        </View>

        {this.renderModal()}
      </View>
    );
  }

  private renderModal = () => {
    const { saleVisible } = this.state;
    const datas = [
      {
        icon: '//net.huanmusic.com/weapp/icon_aliplay_s.png',
      },
      {
        icon: '//net.huanmusic.com/weapp/icon_wechat_s.png'
      },
      {
        icon: '//net.huanmusic.com/weapp/icon_cash_s.png'
      },
      {
        icon: '//net.huanmusic.com/weapp/icon_bank_s.png'
      },
      {
        icon: '//net.huanmusic.com/weapp/icon_chuzhi_s.png'
      },
    ].map((item) => {
      return {
        ...item,
        items: [
          {title: '支付宝', titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title`},
          {title: '6笔', titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title`},
          {title: '￥10000.00', titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title`},
        ],
        arrow: false,
        className: `${cssPrefix}-row-thin`
      };
    });
    return (
      <ModalLayout
        visible={saleVisible}
        onClose={() => this.onChangeValue('saleVisible', false)}
        contentClassName={`${cssPrefix}-layout`}
        title="销售额统计"
      >
        <View>
          {datas.map((data, index) => {
            return (
              <ReportRow 
                key={data.icon} 
                row={data}
                last={index + 1 === datas.length}
              />
            );
          })}
        </View>
      </ModalLayout>
    );
  }

  private renderTime = () => {
    return (
      <View className={`${cssPrefix}-time`}>
        <View className={`${cssPrefix}-time-item`}>
          <Image 
            src="//net.huanmusic.com/weapp/icon_time_left.png" 
            className={`${cssPrefix}-time-icon`}
          />
        </View>
        <View className={`${cssPrefix}-time-box`}>
          <Image 
            src="//net.huanmusic.com/weapp/icon_rili.png"
            className={`${cssPrefix}-time-cal`}
          />
          <Text className={`${cssPrefix}-time-text`}>{moment().format('YYYY.MM.DD')}</Text>
        </View>
        <View className={`${cssPrefix}-time-item`}>
          <Image 
            src="//net.huanmusic.com/weapp/icon_time_right.png" 
            className={`${cssPrefix}-time-icon`}
          />
        </View>
      </View>
    );
  }

  private renderCard = () => {
    const Rows = [
      {
        icon: '//net.huanmusic.com/weapp/icon_chuzhi_s.png',
        title: 'saleVisible',
        id: 'saleVisible',
        onClick: () => this.onChangeValue('saleVisible', true),
        items: [
          {
            title: '销售额',
            value: '￥2000.00'
          },
          {
            title: '销售笔数',
            value: '200'
          }
        ],
        arrow: true,
      },
      {
        icon: '//net.huanmusic.com/weapp/icon_refound.png',
        id: 'saleVisible',
        title: 'saleVisible',
        items: [
          {
            title: '退货额',
            value: '￥2000.00'
          },
          {
            title: '退货笔数',
            value: '200'
          }
        ],
        arrow: true,
      },
      {
        icon: '//net.huanmusic.com/weapp/icon_grossprofit.png',
        id: 'saleVisible',
        title: 'saleVisible',
        items: [
          {
            title: '销售利润',
            value: '￥2000.00'
          },
          {
            title: '利润率',
            value: '200'
          }
        ],
        arrow: false,
      },
    ];
    return (
      <View className={`${cssPrefix}-card`}>
        <View className={`${cssPrefix}-card-report`}>
          <Text className={`${cssPrefix}-card-report-text`}>——  营业实收  ——</Text>
          <Text className={`${cssPrefix}-card-report-price`}>￥1000.00</Text>
        </View>
        {
          Rows.map((row, index) => {
            return (
              <ReportRow 
                key={row.icon} 
                row={row}
                last={index + 1 === Rows.length}
              />
            );
          })
        }
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