/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-21 17:08:14
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/user.less";
import "../style/member.less";
import "../style/home.less";
import "../style/report.less";
import "../../component/card/form.card.less";
import ModalLayout from '../../component/layout/modal.layout';
import ReportRow from '../../component/report/row';
import { ReportAction } from '../../actions';
import { AppReducer } from '../../reducers';
import { getReportBaseInfo } from '../../reducers/app.report';
import { connect } from '@tarojs/redux';
import { ReportInterface } from '../../constants';
import numeral from 'numeral';
import TabsMenu from '../../component/layout/menu';
import dayJs from 'dayjs';
import { getMonthEndDate } from '../../common/util/common';

const cssPrefix = 'report';

interface ReportMainProps { 
  reportBaseInfo: ReportInterface.ReportBaseInfo;
}

type State = {
  saleVisible: boolean;
  merchantVisible: boolean;
  reportVisible: boolean;
  dateVisible: boolean;
  currentDate: string;
  minDate: string;
  maxDate: string;
};

class ReportMain extends Taro.Component<ReportMainProps, State> {

  readonly state: State = {
    saleVisible: false,
    merchantVisible: false,
    reportVisible: false,
    dateVisible: false,
    currentDate: '今日',
    minDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
    maxDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
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

  componentDidShow () {
    this.init();
  }

  public init = async () => {
    this.setState({
      currentDate: '今日',
      minDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
      maxDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
    }, () => {
      this.fetchData();
    });
  }

  public onDatePress = (date: any) => {
    this.setState(() => {
      let newMinDate = '';
      let newMaxDate = '';
      if (date.title === '今日') {
        newMinDate = dayJs().format('YYYY-MM-DD HH:mm:ss');
        newMaxDate = dayJs().format('YYYY-MM-DD HH:mm:ss');
      } else if (date.title === '本月') {
        const month = dayJs().month();
        newMinDate = dayJs(new Date(2020, month, 1)).format('YYYY-MM-DD HH:mm:ss');
        newMaxDate = dayJs(new Date(2020, month, getMonthEndDate(month))).format('YYYY-MM-DD HH:mm:ss');
      }
      return {
        currentDate: date.title,
        minDate: newMinDate,
        maxDate: newMaxDate,
      };
    }, () => {
      console.log('this.state: ', this.state);
      this.fetchData();
    });
  }

  public prevDate = () => {
    const { currentDate, minDate } = this.state;
    if (currentDate === '今日' && dayJs(minDate).isSame(dayJs(new Date(2020, 0, 1)))) {
      // 已经是第一天了
      Taro.showToast({
        title: '只能选择1月1日以后的日期',
        icon: 'none'
      });
      return;
    }

    if (currentDate === '本月' && dayJs(minDate).month() === 0) {
      // 已经是最后一月了
      Taro.showToast({
        title: '只能选择1月以后的日期',
        icon: 'none'
      });
      return;
    }

    if (currentDate === '今日') {
      this.setState({
        minDate: dayJs(minDate).subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        maxDate: dayJs(minDate).subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }, () => {
        this.fetchData();
      });
    }

    if (currentDate === '本月') {
      const currentMonth = dayJs(minDate).month();

      const newMinDate = dayJs(new Date(2020, currentMonth - 1, 1)).format('YYYY-MM-DD HH:mm:ss');
      const newMaxDate = dayJs(new Date(2020, currentMonth - 1, getMonthEndDate(currentMonth - 1))).format('YYYY-MM-DD HH:mm:ss');
      // console.log('newMinDate: ', newMinDate);
      // console.log('newMaxDate: ', newMaxDate);

      this.setState({
        minDate: newMinDate,
        maxDate: newMaxDate,
      }, () => {
        this.fetchData();
      });
    }
  }

  public nextDate = () => {
    const { currentDate, maxDate, minDate } = this.state;
    if (currentDate === '今日' && dayJs(maxDate).isSame(dayJs())) {
      // 已经是最后一天了
      Taro.showToast({
        title: '只能选择今天以前的日期',
        icon: 'none'
      });
      return;
    }
    if (currentDate === '本月' && dayJs(maxDate).month() === dayJs().month()) {
      // 已经是最后一月了
      Taro.showToast({
        title: '只能选择本月以前的日期',
        icon: 'none'
      });
      return;
    }

    if (currentDate === '今日') {
      this.setState({
        minDate: dayJs(minDate).add(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        maxDate: dayJs(minDate).add(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }, () => {
        this.fetchData();
      });
    }

    if (currentDate === '本月') {
      const currentMonth = dayJs(minDate).month();

      const newMinDate = dayJs(new Date(2020, currentMonth + 1, 1)).format('YYYY-MM-DD HH:mm:ss');
      const newMaxDate = dayJs(new Date(2020, currentMonth + 1, getMonthEndDate(currentMonth + 1))).format('YYYY-MM-DD HH:mm:ss');
      // console.log('newMinDate: ', newMinDate);
      // console.log('newMaxDate: ', newMaxDate);

      this.setState({
        minDate: newMinDate,
        maxDate: newMaxDate,
      }, () => {
        this.fetchData();
      });
    }
  }

  public fetchData = () => {
    const { minDate, maxDate } = this.state;
    let payload: ReportInterface.ReportBaseFetchFidle = {
      beginTime: dayJs(minDate).format('YYYY-MM-DD 00:00:00'),
      endTime: dayJs(maxDate).format('YYYY-MM-DD 00:00:00'),
    };
    ReportAction.reportBaseSaleInfo(payload);
  }

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  render () {
    const { dateVisible, currentDate } = this.state;

    const tabs = [
      {
        title: '所有门店',
        visible: 'merchantVisible'
      },
      {
        title: '经营报表',
        visible: 'reportVisible',
      },
      {
        title: `${currentDate}`,
        visible: 'dateVisible'
      }
    ];
    const dateData = [
      {
        title: '今日',
      },
      {
        title: '本月',
      }
    ];
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-tabs`}>
          {
            tabs.map((tab) => {
              return (
                <View 
                  className={`${cssPrefix}-tab`} 
                  key={tab.title}
                  onClick={() => {
                    this.onChangeValue(tab.visible, true);
                  }}
                >
                  {this.renderTab(tab)}
                </View>
              );
            })
          }
        </View>
        <View className={`${cssPrefix}-container`}>
          {this.renderTime()}
          {this.renderCard()}
        </View>

        {this.renderModal()}
        {this.renderRefundModal()}
        <TabsMenu
          current={currentDate}
          visible={dateVisible}
          position="right"
          menus={dateData}
          onPress={(date) => this.onDatePress(date)}
          onClose={() => this.onChangeValue('dateVisible', false)}
        />
      </View>
    );
  }

  private getIcon = (type: number) => {
    if (type === 0) {
      return '//net.huanmusic.com/weapp/icon_cash_s.png';
    } else if (type === 1) {
      return '//net.huanmusic.com/weapp/icon_aliplay_s.png';
    } else if (type === 2) {
      return '//net.huanmusic.com/weapp/icon_wechat_s.png';
    } else if (type === 5) {
      return '//net.huanmusic.com/weapp/icon_bank_s.png';
    } else if (type === 6) {
      return '//net.huanmusic.com/weapp/icon_aliplay_s.png';
    } else {
      return '//net.huanmusic.com/weapp/icon_chuzhi_s.png';
    }
  }

  private getTitle = (type: number) => {
    // 0=现金，1=支付宝，2=微信，5=银行卡，6=人脸，7=储值卡
    if (type === 0) {
      return '现金';
    } else if (type === 1) {
      return '支付宝';
    } else if (type === 2) {
      return '微信';
    } else if (type === 5) {
      return '银行卡';
    } else if (type === 6) {
      return '人脸';
    } else {
      return '储值卡';
    }
  }

  private renderRefundModal = () => {
    return <View />;
  }

  private renderModal = () => {
    const { saleVisible } = this.state;
    const { reportBaseInfo } = this.props;
    const datas: any[] = [];
    if (reportBaseInfo && reportBaseInfo.saleStatistics) {
      reportBaseInfo.saleStatistics.map((item) => {
        // 0=现金，1=支付宝，2=微信，5=银行卡，6=人脸，7=储值卡
        datas.push({
          icon: this.getIcon(item.payType),
          items: [
            {title: this.getTitle(item.payType), titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title`},
            {title: `${item.times}笔`, titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title`},
            {title: `${numeral(item.amount || 0).format('0.00')}`, titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title`},
          ],
          arrow: false,
          className: `${cssPrefix}-row-thin`
        });
      });
    }
    
    return (
      <ModalLayout
        visible={saleVisible}
        onClose={() => this.onChangeValue('saleVisible', false)}
        contentClassName={`${cssPrefix}-layout`}
        title="销售额统计"
      >
        <View>
          {datas.map((data) => {
            return (
              <View 
                key={data.icon}
                className={`${cssPrefix}-row-thin`}
              >
                <View 
                  className={`${cssPrefix}-row-thin-box`} 
                  style="flex: 1; align-items: center; justify-content: flex-start"
                >
                  <Image 
                    src={data.icon} 
                    className={`${cssPrefix}-row-thin-img`}
                  />
                  <View>{data.items && data.items[0].title}</View>
                </View>
                <View 
                  className={`${cssPrefix}-row-thin-box`} 
                  style="flex: 1.5; align-items: center; justify-content: center"
                >
                  {data.items && data.items[1].title}
                </View>
                <View 
                  className={`${cssPrefix}-row-thin-box`} 
                  style="flex: 1; align-items: center; justify-content: flex-end"
                >
                  {data.items && data.items[2].title}
                </View>
              </View>
            );
          })}
        </View>
      </ModalLayout>
    );
  }

  private renderTime = () => {
    const { currentDate, minDate, maxDate } = this.state;
    return (
      <View className={`${cssPrefix}-time`}>
        <View 
          className={`${cssPrefix}-time-item`}
          onClick={() => this.prevDate()}
        >
          <Image 
            src="//net.huanmusic.com/weapp/v1/icon_time_left.png" 
            className={`${cssPrefix}-time-icon`}
          />
        </View>
        <View className={`${cssPrefix}-time-box`}>
          <Image 
            src="//net.huanmusic.com/weapp/v1/icon_rili.png"
            className={`${cssPrefix}-time-cal`}
          />
          {currentDate === '今日' && (
            <Text className={`${cssPrefix}-time-text`}>{dayJs(minDate).format('YYYY.MM.DD')}</Text>
          )}
          {currentDate === '本月' && (
            <Text className={`${cssPrefix}-time-text`}>
              {`${dayJs(minDate).format('YYYY.MM.DD')} - ${dayJs(maxDate).format('YYYY.MM.DD')}`}
            </Text>
          )}
        </View>
        <View   
          className={`${cssPrefix}-time-item`}
          onClick={() => this.nextDate()}
        >
          <Image 
            src="//net.huanmusic.com/weapp/v1/icon_time_right.png" 
            className={`${cssPrefix}-time-icon`}
          />
        </View>
      </View>
    );
  }

  private renderCard = () => {
    const { reportBaseInfo } = this.props;
    const Rows = [
      {
        icon: '//net.huanmusic.com/weapp/icon_sale.png',
        title: 'saleVisible',
        id: 'saleVisible',
        onClick: () => this.onChangeValue('saleVisible', true),
        items: [
          {
            title: '销售额',
            value: `${numeral(reportBaseInfo.sales).format('0.00')}`
          },
          {
            title: '销售笔数',
            value: `${numeral(reportBaseInfo.salesTimes || 0).value()}`
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
            value: `${numeral(reportBaseInfo.refundPrice || 0).format('0.00')}`
          },
          {
            title: '退货笔数',
            value: `${numeral(reportBaseInfo.refundTimes || 0).value()}`
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
            value: `${numeral(reportBaseInfo.profit).format('0.00')}`
          },
          {
            title: '利润率',
            value: `${numeral(reportBaseInfo.profitRate || 0).value()}`
          }
        ],
        arrow: false,
      },
    ];
    return (
      <View className={`${cssPrefix}-card`}>
        <View className={`${cssPrefix}-card-report`}>
          <Text className={`${cssPrefix}-card-report-text`}>——  营业实收  ——</Text>
          <Text className={`${cssPrefix}-card-report-price`}>￥{numeral(reportBaseInfo.turnover || 0).format('0.00')}</Text>
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
      <View 
        className={`${cssPrefix}-tab`}
      >
        <Text className={`${cssPrefix}-tab-text`}>{tab.title}</Text>
        <View className={`${cssPrefix}-tab-icon`} />
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  reportBaseInfo: getReportBaseInfo(state),
});

export default connect(select)(ReportMain);