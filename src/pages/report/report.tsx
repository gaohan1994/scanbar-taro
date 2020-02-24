/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-21 16:12:17
 */
import Taro from '@tarojs/taro';
import { View, Image, Text, Picker } from '@tarojs/components';
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
import classnames from 'classnames';

const cssPrefix = 'report';

interface ReportMainProps {
  reportBaseInfo: ReportInterface.ReportBaseInfo;
}

type State = {
  saleVisible: boolean;
  refundVisible: boolean;
  merchantVisible: boolean;
  reportVisible: boolean;
  dateVisible: boolean;
  currentDate: string;
  minDate: string;
  maxDate: string;
  currentReportType: string;
  currentChartType: number;
};

class ReportMain extends Taro.Component<ReportMainProps, State> {

  readonly state: State = {
    saleVisible: false,
    refundVisible: false,
    merchantVisible: false,
    reportVisible: false,
    dateVisible: false,
    currentDate: '今日',
    minDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
    maxDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
    currentReportType: '经营报表',
    currentChartType: 0
  };
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: '数据'
  };

  componentDidShow() {
    this.init();
  }

  public init = async () => {
    this.setState({
      currentDate: '今日',
      minDate: `${dayJs().format('YYYY-MM-DD HH:mm:ss')}`,
      maxDate: `${dayJs().add(24, 'hour').format('YYYY-MM-DD HH:mm:ss')}`,
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
        const year = dayJs().year();
        newMinDate = dayJs(new Date(year, month, 1)).format('YYYY-MM-DD HH:mm:ss');
        newMaxDate = dayJs(new Date(year, month, getMonthEndDate(month, year))).format('YYYY-MM-DD HH:mm:ss');
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

  public onReportTypePress = (item: any) => {
    this.setState({
      currentReportType: item.title
    });
  }

  public prevDate = () => {
    const { currentDate, minDate } = this.state;
    const year = dayJs(minDate).year();
    // if (currentDate === '今日' && dayJs(minDate).isSame(dayJs(new Date(year, 0, 1)))) {
    //   // 已经是第一天了
    //   Taro.showToast({
    //     title: '只能选择1月1日以后的日期',
    //     icon: 'none'
    //   });
    //   return;
    // }

    // if (currentDate === '本月' && dayJs(minDate).month() === 0) {
    //   // 已经是最后一月了
    //   Taro.showToast({
    //     title: '只能选择1月以后的日期',
    //     icon: 'none'
    //   });
    //   return;
    // }

    if (currentDate === '今日') {
      this.setState({
        minDate: dayJs(minDate).subtract(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
        maxDate: dayJs(minDate).format('YYYY-MM-DD HH:mm:ss'),
      }, () => {
        this.fetchData();
      });
    }

    if (currentDate === '本月') {
      let currentMonth = dayJs(minDate).month();
      let currentYear = dayJs(minDate).year();
      if (currentMonth === 1) {
        currentMonth = 13;
        currentYear -= 1;
      }
      const newMinDate = dayJs(new Date(currentYear, currentMonth - 1, 1)).format('YYYY-MM-DD HH:mm:ss');
      const newMaxDate = dayJs(new Date(currentYear, currentMonth - 1, getMonthEndDate(currentMonth - 1, currentYear))).format('YYYY-MM-DD HH:mm:ss');
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
    if (currentDate === '今日' && dayJs(dayJs(minDate).format('YYYY-MM-DD')).isSame(dayJs().format('YYYY-MM-DD'))) {
      // 已经是最后一天了
      Taro.showToast({
        title: '只能选择今天以前的日期',
        icon: 'none'
      });
      return;
    }
    if (currentDate === '本月' && dayJs(dayJs(maxDate).format('YYYY-MM')).isSame(dayJs().format('YYYY-MM'))) {
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
        maxDate: dayJs(maxDate).add(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }, () => {
        this.fetchData();
      });
    }

    if (currentDate === '本月') {
      const currentMonth = dayJs(minDate).month();
      const currentYear = dayJs(minDate).year();
      const newMinDate = dayJs(new Date(currentYear, currentMonth + 1, 1)).format('YYYY-MM-DD HH:mm:ss');
      const newMaxDate = dayJs(new Date(currentYear, currentMonth + 1, getMonthEndDate(currentMonth + 1, currentYear))).format('YYYY-MM-DD HH:mm:ss');
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
    const { minDate, maxDate, currentDate } = this.state;
    let payload: ReportInterface.ReportBaseFetchFidle = {
      beginDate: dayJs(minDate).format('YYYY-MM-DD 00:00:00'),
      endDate: dayJs(maxDate).format('YYYY-MM-DD 00:00:00'),
    };
    if (currentDate === '本月') {
      payload = {
        beginDate: dayJs(minDate).format('YYYY-MM-DD 00:00:00'),
        endDate: dayJs(maxDate).add(24, 'hour').format('YYYY-MM-DD 00:00:00'),
      };
    }
    ReportAction.reportBaseSaleInfo(payload);
  }

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateChange = (event: any) => {
    const value = event.detail.value;
    const { currentDate } = this.state;

    if (currentDate === '今日') {
      if (dayJs(dayJs().format('YYYY-MM-DD')).valueOf() < dayJs(dayJs(value).format('YYYY-MM-DD')).valueOf()) {
        // 已经是最后一天了
        Taro.showToast({
          title: '只能选择今天以前的日期',
          icon: 'none'
        });
        return;
      }
      this.setState({
        minDate: dayJs(value).format('YYYY-MM-DD HH:mm:ss'),
        maxDate: dayJs(value).add(24, 'hour').format('YYYY-MM-DD HH:mm:ss'),
      }, () => {
        this.fetchData();
      });
    } else {
      if (dayJs(dayJs().format('YYYY-MM')).valueOf() < dayJs(dayJs(value).format('YYYY-MM')).valueOf()) {
        // 已经是最后一月了
        Taro.showToast({
          title: '只能选择本月以前的日期',
          icon: 'none'
        });
        return;
      }
      const currentYear = dayJs(value).year();
      const currentMonth = dayJs(value).month();
      const newMinDate = dayJs(new Date(currentYear, currentMonth, 1)).format('YYYY-MM-DD HH:mm:ss');
      const newMaxDate = dayJs(new Date(currentYear, currentMonth, getMonthEndDate(currentMonth, currentYear))).format('YYYY-MM-DD HH:mm:ss');
      this.setState({
        minDate: newMinDate,
        maxDate: newMaxDate,
      }, () => {
        this.fetchData();
      });
    }

  }

  public onChangeValue = (key: string, value: any) => {
    const { reportBaseInfo } = this.props;
    if (key === 'saleVisible' && value === true) {
      if (!(reportBaseInfo && reportBaseInfo.saleStatistics && reportBaseInfo.saleStatistics.length > 0)) {
        Taro.showToast({
          title: '暂无销售额统计',
          icon: 'none',
        });
        return;
      }
    } else if (key === 'refundVisible' && value === true) {
      if (!(reportBaseInfo && reportBaseInfo.refundStatistics && reportBaseInfo.refundStatistics.length > 0)) {
        Taro.showToast({
          title: '暂无退货额统计',
          icon: 'none',
        });
        return;
      }
    }

    this.setState(prevState => {
      return {
        ...prevState,
        [`${key}`]: value
      };
    });
  }

  public onSalesAnalysisTypeChange = (type: any) => {
    this.setState({ currentChartType: type });
  }

  render() {
    const { dateVisible, currentDate, currentReportType, reportVisible } = this.state;

    const tabs = [
      {
        title: '所有门店',
        visible: 'merchantVisible',
        emphasis: false,
        more: false,
      },
      {
        title: `${currentReportType}`,
        visible: 'reportVisible',
        emphasis: true,
        more: false,
      },
      {
        title: `${currentDate}`,
        visible: 'dateVisible',
        emphasis: false,
        more: true,
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
    const reportTypes = [
      {
        title: '经营报表',
      },
      {
        title: '产品销量分析',
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
          {
            currentReportType === '经营报表'
              ? this.renderCard()
              : this.renderChartCard()
          }
          {/*this.renderCard()*/}
          {/*this.renderChartCard()*/}

        </View>
        {this.renderModal()}
        {this.renderRefundModal()}
        {/* <TabsMenu
          current={currentReportType}
          visible={reportVisible}
          position="center"
          menus={reportTypes}
          onPress={(type) => this.onReportTypePress(type)}
          onClose={() => this.onChangeValue('reportVisible', false)}
        /> */}
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
    const { refundVisible } = this.state;
    const { reportBaseInfo } = this.props;
    const datas: any[] = [];

    if (reportBaseInfo && reportBaseInfo.refundStatistics) {
      reportBaseInfo.refundStatistics.map((item) => {
        // 0=现金，1=支付宝，2=微信，5=银行卡，6=人脸，7=储值卡
        datas.push({
          icon: this.getIcon(item.payType),
          items: [
            { title: this.getTitle(item.payType), titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title` },
            { title: `${item.times}笔`, titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title` },
            { title: `${numeral(item.amount || 0).format('0.00')}`, titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title` },
          ],
          arrow: false,
          className: `${cssPrefix}-row-thin`
        });
      });
    }

    return (
      <ModalLayout
        visible={refundVisible}
        onClose={() => this.onChangeValue('refundVisible', false)}
        contentClassName={`${cssPrefix}-layout`}
        title="退货额统计"
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
                  ￥{data.items && data.items[2].title}
                </View>
              </View>
            );
          })}
        </View>
      </ModalLayout>
    );
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
            { title: this.getTitle(item.payType), titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title` },
            { title: `${item.times}笔`, titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title` },
            { title: `${numeral(item.amount || 0).format('0.00')}`, titleClassName: `${cssPrefix}-row-item-title`, valueClassName: `${cssPrefix}-row-item-title` },
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
                  ￥{data.items && data.items[2].title}
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
          <Picker
            mode='date'
            onChange={this.onDateChange}
            value={dayJs(minDate).format('YYYY.MM.DD')}
          >
            <View className={`${cssPrefix}-time-date`}>
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
          </Picker>
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
            value: `￥${numeral(reportBaseInfo.sales).format('0.00')}`
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
        id: 'refundVisible',
        title: 'refundVisible',
        onClick: () => this.onChangeValue('refundVisible', true),
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
            value: `${numeral(reportBaseInfo.profitRate || 0).value()}%`
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
        {
          tab.emphasis
            ? <Text className={`${cssPrefix}-tab-text-emphasis`}>{tab.title}</Text>
            : <Text className={`${cssPrefix}-tab-text`}>{tab.title}</Text>
        }
        {
          tab.more
            ? <View className={`${cssPrefix}-tab-icon`} />
            : <View />
        }
      </View>
    );
  }

  private renderChartTabs = () => {
    const { currentChartType } = this.state;
    const salesAnalysisTypes = [
      {
        title: '畅销产品'
      },
      {
        title: '滞销产品'
      }
    ];
    return (
      <View className={`${cssPrefix}-chart-tabs`}>
        {
          salesAnalysisTypes.map((tab, index) => {
            return (
              <View
                key={tab.title}
                className={classnames(`${cssPrefix}-chart-tabs-tab`, {
                  [`${cssPrefix}-chart-tabs-tab-active`]: index === currentChartType,
                })}
                onClick={() => { this.onSalesAnalysisTypeChange(index); }}
              >
                {tab.title}
              </View>
            );
          })
        }
      </View>
    );
  }

  private renderChartCard = () => {
    return (
      <View className={`${cssPrefix}-card`}>
        {this.renderChartTabs()}
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  reportBaseInfo: getReportBaseInfo(state),
});

export default connect(select)(ReportMain);