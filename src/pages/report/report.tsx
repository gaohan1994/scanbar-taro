/*
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-11 10:29:01
 */
import Taro from "@tarojs/taro";
import { View, Image, Text, Picker } from "@tarojs/components";
import "../style/report.less";
import "../../component/card/form.card.less";
import ModalLayout from "../../component/layout/modal.layout";
import ReportRow from "../../component/report/row";
import { ReportAction } from "../../actions";
import { AppReducer } from "../../reducers";
import { getReportBaseInfo } from "../../reducers/app.report";
import { connect } from "@tarojs/redux";
import { ReportInterface, ResponseCode } from "../../constants";
import numeral from "numeral";
import TabsMenu from "../../component/layout/menu";
import "../../component/layout/header.layout.less";
import dayJs from "dayjs";
import { getMonthEndDate, createMonth } from "../../common/util/common";
import classnames from "classnames";
import loginManager from "../../common/sdk/sign/login.manager";
import invariant from "invariant";
import merchantAction from "../../actions/merchant.action";
import {
  getProfileInfo,
  getMerchantSubList
} from "../../reducers/app.merchant";
import { MerchantInterface } from "../../constants";

const cssPrefix = "report";

interface ReportMainProps {
  reportBaseInfo: ReportInterface.ReportBaseInfo;
  userinfo: MerchantInterface.ProfileInfo;
  merchantSubList: MerchantInterface.MerchantDetail[];
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
  monthData: any[];
  weeksData: ReportInterface.WeekItem[];
  weekValue: number;
  costomMinDate: string;
  costomMaxDate: string;
  currentMerchant?: MerchantInterface.MerchantDetail;
};

class ReportMain extends Taro.Component<ReportMainProps, State> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: "数据"
  };

  constructor(props) {
    super(props);
    this.state = {
      saleVisible: false,
      refundVisible: false,
      merchantVisible: false,
      reportVisible: false,
      dateVisible: false,
      currentDate: "今日",
      minDate: `${dayJs().format("YYYY-MM-DD HH:mm:ss")}`,
      maxDate: `${dayJs().format("YYYY-MM-DD HH:mm:ss")}`,
      currentReportType: "经营报表",
      currentChartType: 0,
      monthData: [],
      weeksData: [],
      weekValue: 0,
      costomMinDate: ``,
      costomMaxDate: ``,
      currentMerchant: undefined
    };
  }

  componentDidShow() {
    this.init();
  }

  public init = async () => {
    try {
      Taro.showLoading();
      const currentMonth = dayJs().month();
      const cmonth = createMonth(2020);
      const weeks = await ReportAction.reportWeekData();
      invariant(weeks.code === ResponseCode.success, weeks.msg || " ");
      this.setState(
        {
          currentDate: "今日",
          monthData: cmonth.slice(0, currentMonth + 1),
          weeksData: weeks.data,
          weekValue: weeks.data.length - 1,
          minDate: `${dayJs().format("YYYY-MM-DD HH:mm:ss")}`,
          maxDate: `${dayJs().format("YYYY-MM-DD HH:mm:ss")}`
        },
        () => {
          this.fetchData();
        }
      );
      Taro.hideLoading();

      /**
       * @time 03.02
       * @todo 如果是总店店员那么加入
       */
      const result = await merchantAction.profileInfo();
      invariant(result.code === ResponseCode.success, result.msg || " ");
      if (result.data.roleNames === "总店管理员") {
        merchantAction.merchantSubList();
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  /**
   * @todo 总店管理员可以查看分店
   */
  public onMerchantPress = (merchant: MerchantInterface.MerchantDetail) => {
    this.setState({ currentMerchant: merchant }, () => {
      this.fetchData();
    });
  };

  public onDatePress = (date: any) => {
    this.setState(
      (prevState: State) => {
        /**
         * @time 03.01 增加自定义
         */
        if (date.title === "自定义") {
          return {
            ...prevState,
            currentDate: "自定义",
            costomMinDate: "",
            costomMaxDate: ""
          };
        }

        let newMinDate = "";
        let newMaxDate = "";
        if (date.title === "今日") {
          /**
           * @todo 当min和max为同一天时返回空数据
           */
          newMinDate = dayJs().format("YYYY-MM-DD HH:mm:ss");
          newMaxDate = dayJs().format("YYYY-MM-DD HH:mm:ss");
        } else if (date.title === "本周") {
          /**
           * @time 02.29
           * @todo 加入本周数据，点击本周则自动选择当前周为起始和开始日期
           * @todo 用户点击日期弹出picker选择具体周
           */
          const { weeksData, weekValue } = this.state;
          const currentWeek = weeksData[weekValue];
          newMinDate = dayJs(currentWeek.beginDateStr).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          newMaxDate = dayJs(currentWeek.endDateStr).format(
            "YYYY-MM-DD HH:mm:ss"
          );
        } else if (date.title === "本月") {
          const month = dayJs().month();
          const year = dayJs().year();
          newMinDate = dayJs(new Date(year, month, 1)).format(
            "YYYY-MM-DD HH:mm:ss"
          );
          newMaxDate = dayJs(
            new Date(year, month, getMonthEndDate(month, year))
          ).format("YYYY-MM-DD HH:mm:ss");
        }
        return {
          currentDate: date.title,
          minDate: newMinDate,
          maxDate: newMaxDate
        };
      },
      () => {
        this.fetchData();
      }
    );
  };

  public onReportTypePress = (item: any) => {
    this.setState({
      currentReportType: item.title
    });
  };

  public prevDate = () => {
    const { currentDate, minDate, weeksData, weekValue } = this.state;
    if (currentDate === "今日") {
      this.setState(
        {
          minDate: dayJs(minDate)
            .subtract(24, "hour")
            .format("YYYY-MM-DD HH:mm:ss"),
          maxDate: dayJs(minDate).format("YYYY-MM-DD HH:mm:ss")
        },
        () => {
          this.fetchData();
        }
      );
    }

    if (currentDate === "本周") {
      if (weekValue === 0) {
        Taro.showToast({
          title: "已经是本年第一周了",
          icon: "none"
        });
        return;
      }
      const prevWeek = weeksData[weekValue - 1];
      const newMinDate = dayJs(prevWeek.beginDateStr).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const newMaxDate = dayJs(prevWeek.endDateStr).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      this.setState(
        {
          minDate: newMinDate,
          maxDate: newMaxDate,
          weekValue: weekValue - 1
        },
        () => {
          this.fetchData();
        }
      );
    }

    if (currentDate === "本月") {
      let currentMonth = dayJs(minDate).month();
      let currentYear = dayJs(minDate).year();
      if (currentMonth === 1) {
        currentMonth = 13;
        currentYear -= 1;
      }
      const newMinDate = dayJs(
        new Date(currentYear, currentMonth - 1, 1)
      ).format("YYYY-MM-DD HH:mm:ss");
      const newMaxDate = dayJs(
        new Date(
          currentYear,
          currentMonth - 1,
          getMonthEndDate(currentMonth - 1, currentYear)
        )
      ).format("YYYY-MM-DD HH:mm:ss");

      this.setState(
        {
          minDate: newMinDate,
          maxDate: newMaxDate
        },
        () => {
          this.fetchData();
        }
      );
    }
  };

  public nextDate = () => {
    const { currentDate, maxDate, weekValue, weeksData, minDate } = this.state;
    if (
      currentDate === "今日" &&
      dayJs(dayJs(minDate).format("YYYY-MM-DD")).isSame(
        dayJs().format("YYYY-MM-DD")
      )
    ) {
      // 已经是最后一天了
      Taro.showToast({
        title: "只能选择今天以前的日期",
        icon: "none"
      });
      return;
    }

    if (currentDate === "本周") {
      if (weekValue === weeksData.length - 1) {
        Taro.showToast({
          title: "只能选择本周以前的日期",
          icon: "none"
        });
        return;
      }
      const nextWeek = weeksData[weekValue + 1];
      const newMinDate = dayJs(nextWeek.beginDateStr).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      const newMaxDate = dayJs(nextWeek.endDateStr).format(
        "YYYY-MM-DD HH:mm:ss"
      );

      this.setState(
        {
          minDate: newMinDate,
          maxDate: newMaxDate,
          weekValue: weekValue + 1
        },
        () => {
          this.fetchData();
        }
      );
    }

    if (
      currentDate === "本月" &&
      dayJs(dayJs(maxDate).format("YYYY-MM")).isSame(dayJs().format("YYYY-MM"))
    ) {
      // 已经是最后一月了
      Taro.showToast({
        title: "只能选择本月以前的日期",
        icon: "none"
      });
      return;
    }

    if (currentDate === "今日") {
      this.setState(
        {
          minDate: dayJs(minDate)
            .add(24, "hour")
            .format("YYYY-MM-DD HH:mm:ss"),
          maxDate: dayJs(maxDate)
            .add(24, "hour")
            .format("YYYY-MM-DD HH:mm:ss")
        },
        () => {
          this.fetchData();
        }
      );
    }

    if (currentDate === "本月") {
      const currentMonth = dayJs(minDate).month();
      const currentYear = dayJs(minDate).year();
      const newMinDate = dayJs(
        new Date(currentYear, currentMonth + 1, 1)
      ).format("YYYY-MM-DD HH:mm:ss");
      const newMaxDate = dayJs(
        new Date(
          currentYear,
          currentMonth + 1,
          getMonthEndDate(currentMonth + 1, currentYear)
        )
      ).format("YYYY-MM-DD HH:mm:ss");

      this.setState(
        {
          minDate: newMinDate,
          maxDate: newMaxDate
        },
        () => {
          this.fetchData();
        }
      );
    }
  };

  public fetchData = async () => {
    try {
      const userinfo = await loginManager.getUserInfo();
      invariant(userinfo.success, "暂未登录");
      invariant(
        userinfo.result.menus.some(menu => menu.name === "数据"),
        "您没有查看数据权限"
      );
      const {
        minDate,
        maxDate,
        currentDate,
        costomMinDate,
        costomMaxDate,
        currentMerchant
      } = this.state;
      let payload: ReportInterface.ReportBaseFetchFidle = {
        beginDate: dayJs(minDate).format("YYYY-MM-DD 00:00:00"),
        endDate: dayJs(maxDate).format("YYYY-MM-DD 23:59:59")
      };
      if (currentDate === "本月") {
        payload = {
          beginDate: dayJs(minDate).format("YYYY-MM-DD 00:00:00"),
          endDate: dayJs(maxDate).format("YYYY-MM-DD 23:59:59")
        };
      }
      if (currentDate === "自定义") {
        invariant(!!costomMinDate, "请选择开始日期");
        invariant(!!costomMaxDate, "请选择结束日期");

        payload = {
          beginDate: dayJs(costomMinDate).format("YYYY-MM-DD 00:00:00"),
          endDate: dayJs(costomMaxDate).format("YYYY-MM-DD 23:59:59")
        };
      }

      /**
       * @todo 加入总店管理员可以查看分店
       */
      if (!!currentMerchant && currentMerchant.id) {
        payload.merchantId = currentMerchant.id;
      }

      ReportAction.reportBaseSaleInfo(payload);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public onCostomMinChange = (event: any) => {
    const { value } = event.detail;
    this.setState(
      {
        costomMinDate: dayJs(value).format("YYYY-MM-DD HH:mm:ss")
      },
      () => {
        this.fetchData();
      }
    );
  };

  public onCostomMaxChange = (event: any) => {
    const { value } = event.detail;
    this.setState(
      {
        costomMaxDate: dayJs(value).format("YYYY-MM-DD HH:mm:ss")
      },
      () => {
        this.fetchData();
      }
    );
  };

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateChange = (event: any) => {
    const value = event.detail.value;
    const { currentDate } = this.state;

    if (currentDate === "今日") {
      if (
        dayJs(dayJs().format("YYYY-MM-DD")).valueOf() <
        dayJs(dayJs(value).format("YYYY-MM-DD")).valueOf()
      ) {
        // 已经是最后一天了
        Taro.showToast({
          title: "只能选择今天以前的日期",
          icon: "none"
        });
        return;
      }
      this.setState(
        {
          minDate: dayJs(value).format("YYYY-MM-DD HH:mm:ss"),
          maxDate: dayJs(value).format("YYYY-MM-DD 23:59:59")
        },
        () => {
          this.fetchData();
        }
      );

      return;
    }

    if (currentDate === "本周") {
      /**
       * @time 02.29
       * @todo 加入本周选择点击本周picker的时候把点击的数据赋值到state中
       */
      const { weeksData } = this.state;
      const currentWeek = weeksData[value];

      this.setState(
        {
          minDate: dayJs(currentWeek.beginDateStr).format(
            "YYYY-MM-DD HH:mm:ss"
          ),
          maxDate: dayJs(currentWeek.endDateStr).format("YYYY-MM-DD HH:mm:ss"),
          weekValue: value
        },
        () => {
          this.fetchData();
        }
      );
      return;
    }

    if (currentDate === "本月") {
      const { monthData } = this.state;
      const selectMonth = monthData[value];
      this.setState(
        {
          minDate: dayJs(selectMonth.startDate).format("YYYY-MM-DD HH:mm:ss"),
          maxDate: dayJs(selectMonth.endDate).format("YYYY-MM-DD HH:mm:ss")
        },
        () => {
          this.fetchData();
        }
      );
      return;
    }
  };

  public onChangeValue = (key: string, value: any) => {
    const { reportBaseInfo } = this.props;
    if (key === "saleVisible" && value === true) {
      if (
        !(
          reportBaseInfo &&
          reportBaseInfo.saleStatistics &&
          reportBaseInfo.saleStatistics.length > 0
        )
      ) {
        Taro.showToast({
          title: "暂无销售额统计",
          icon: "none"
        });
        return;
      }
    } else if (key === "refundVisible" && value === true) {
      if (
        !(
          reportBaseInfo &&
          reportBaseInfo.refundStatistics &&
          reportBaseInfo.refundStatistics.length > 0
        )
      ) {
        Taro.showToast({
          title: "暂无退货额统计",
          icon: "none"
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
  };

  public onSalesAnalysisTypeChange = (type: any) => {
    this.setState({ currentChartType: type });
  };

  render() {
    const { userinfo, merchantSubList } = this.props;
    const {
      dateVisible,
      currentDate,
      currentReportType,
      merchantVisible
    } = this.state;

    const tabs = [
      {
        title: " ",
        visible: "merchantVisible",
        emphasis: false,
        more: false
      },
      {
        title: `${currentReportType}`,
        visible: "reportVisible",
        emphasis: true,
        more: false
      },
      {
        title: `${currentDate}`,
        visible: "dateVisible",
        emphasis: false,
        more: true
      }
    ];

    /**
     * @todo 加入管理员可以查看门店列表
     */
    if (userinfo.roleNames === "总店管理员") {
      tabs[0].title = "门店";
      tabs[0].more = true;
    }

    const merchantListData =
      merchantSubList && merchantSubList.length > 0
        ? merchantSubList.map(item => {
            return {
              ...item,
              title: item.name
            };
          })
        : [];

    const dateData = [
      {
        title: "今日"
      },
      {
        title: "本周"
      },
      {
        title: "本月"
      }
    ];

    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-tabs`}>
          {tabs.map(tab => {
            return (
              <View
                className={`${cssPrefix}-tab`}
                key={tab.title}
                onClick={() => {
                  loginManager.checkAuth(() => {
                    this.onChangeValue(tab.visible, true);
                  });
                }}
              >
                {this.renderTab(tab)}
              </View>
            );
          })}
        </View>
        <View className={`${cssPrefix}-container`}>
          {this.renderTime()}
          {currentReportType === "经营报表"
            ? this.renderCard()
            : this.renderChartCard()}
        </View>
        {this.renderModal()}
        {this.renderRefundModal()}
        <TabsMenu
          current={currentDate}
          visible={merchantVisible}
          position="left"
          menus={merchantListData}
          onPress={item => this.onMerchantPress(item as any)}
          onClose={() => this.onChangeValue("merchantVisible", false)}
        />
        <TabsMenu
          current={currentDate}
          visible={dateVisible}
          position="right"
          menus={dateData}
          onPress={date => this.onDatePress(date)}
          onClose={() => this.onChangeValue("dateVisible", false)}
        >
          <Picker
            mode="date"
            onChange={this.onCostomMinChange}
            value={dayJs(this.state.costomMinDate).format("YYYY.MM.DD")}
          >
            <View
              className={classnames(`tabs-header-content-menu`, {
                [`tabs-header-content-menu-active`]: currentDate === "自定义"
              })}
              onClick={() => {
                this.onDatePress({ title: "自定义" });
                this.onChangeValue("dateVisible", false);
              }}
            >
              {"自定义"}
            </View>
          </Picker>
        </TabsMenu>
      </View>
    );
  }

  private getIcon = (type: number) => {
    if (type === 0) {
      return "//net.huanmusic.com/weapp/icon_cash_s.png";
    } else if (type === 1) {
      return "//net.huanmusic.com/weapp/icon_aliplay_s.png";
    } else if (type === 2) {
      return "//net.huanmusic.com/weapp/icon_wechat_s.png";
    } else if (type === 5) {
      return "//net.huanmusic.com/weapp/icon_bank_s.png";
    } else if (type === 6) {
      return "//net.huanmusic.com/weapp/icon_aliplay_s.png";
    } else {
      return "//net.huanmusic.com/weapp/icon_chuzhi_s.png";
    }
  };

  private getTitle = (type: number) => {
    // 0=现金，1=支付宝，2=微信，5=银行卡，6=人脸，7=储值卡
    if (type === 0) {
      return "现金";
    } else if (type === 1) {
      return "支付宝";
    } else if (type === 2) {
      return "微信";
    } else if (type === 5) {
      return "银行卡";
    } else if (type === 6) {
      return "人脸";
    } else {
      return "储值卡";
    }
  };

  private renderRefundModal = () => {
    const { refundVisible } = this.state;
    const { reportBaseInfo } = this.props;
    const datas: any[] = [];

    if (reportBaseInfo && reportBaseInfo.refundStatistics) {
      reportBaseInfo.refundStatistics.map(item => {
        // 0=现金，1=支付宝，2=微信，5=银行卡，6=人脸，7=储值卡
        datas.push({
          icon: this.getIcon(item.payType),
          items: [
            {
              title: this.getTitle(item.payType),
              titleClassName: `${cssPrefix}-row-item-title`,
              valueClassName: `${cssPrefix}-row-item-title`
            },
            {
              title: `${item.times}笔`,
              titleClassName: `${cssPrefix}-row-item-title`,
              valueClassName: `${cssPrefix}-row-item-title`
            },
            {
              title: `${numeral(item.amount || 0).format("0.00")}`,
              titleClassName: `${cssPrefix}-row-item-title`,
              valueClassName: `${cssPrefix}-row-item-title`
            }
          ],
          arrow: false,
          className: `${cssPrefix}-row-thin`
        });
      });
    }

    return (
      <ModalLayout
        visible={refundVisible}
        onClose={() => this.onChangeValue("refundVisible", false)}
        contentClassName={`${cssPrefix}-layout`}
        title="退货额统计"
      >
        <View>
          {datas.map(data => {
            return (
              <View key={data.icon} className={`${cssPrefix}-row-thin`}>
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
  };

  private renderModal = () => {
    const { saleVisible } = this.state;
    const { reportBaseInfo } = this.props;
    const datas: any[] = [];
    if (reportBaseInfo && reportBaseInfo.saleStatistics) {
      reportBaseInfo.saleStatistics.map(item => {
        // 0=现金，1=支付宝，2=微信，5=银行卡，6=人脸，7=储值卡
        datas.push({
          icon: this.getIcon(item.payType),
          items: [
            {
              title: this.getTitle(item.payType),
              titleClassName: `${cssPrefix}-row-item-title`,
              valueClassName: `${cssPrefix}-row-item-title`
            },
            {
              title: `${item.times}笔`,
              titleClassName: `${cssPrefix}-row-item-title`,
              valueClassName: `${cssPrefix}-row-item-title`
            },
            {
              title: `${numeral(item.amount || 0).format("0.00")}`,
              titleClassName: `${cssPrefix}-row-item-title`,
              valueClassName: `${cssPrefix}-row-item-title`
            }
          ],
          arrow: false,
          className: `${cssPrefix}-row-thin`
        });
      });
    }

    return (
      <ModalLayout
        visible={saleVisible}
        onClose={() => this.onChangeValue("saleVisible", false)}
        contentClassName={`${cssPrefix}-layout`}
        title="销售额统计"
      >
        <View>
          {datas.map(data => {
            return (
              <View key={data.icon} className={`${cssPrefix}-row-thin`}>
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
  };

  private renderPicker = () => {
    const {
      currentDate,
      minDate,
      maxDate,
      monthData,
      weeksData,
      weekValue,
      costomMaxDate,
      costomMinDate
    } = this.state;

    const month = monthData ? monthData.map(item => item.monthStr) : [];

    const weeks = weeksData ? weeksData.map(item => item.weekStr) : [];

    return (
      <View className={`${cssPrefix}-time-box`}>
        {currentDate === "自定义" ? (
          <View className={`${cssPrefix}-time-costom`}>
            <Image
              src="//net.huanmusic.com/weapp/v1/icon_rili.png"
              className={`${cssPrefix}-time-cal`}
            />
            <Picker
              mode="date"
              onChange={this.onCostomMinChange}
              value={dayJs(costomMinDate).format("YYYY.MM.DD")}
            >
              <Text className={`${cssPrefix}-time-text`}>
                {!!costomMinDate
                  ? dayJs(costomMinDate).format("YYYY.MM.DD")
                  : "开始日期"}
              </Text>
            </Picker>
            -
            <Picker
              mode="date"
              onChange={this.onCostomMaxChange}
              value={dayJs(costomMaxDate).format("YYYY.MM.DD")}
            >
              <Text className={`${cssPrefix}-time-text`}>
                {!!costomMaxDate
                  ? dayJs(costomMaxDate).format("YYYY.MM.DD")
                  : "结束日期"}
              </Text>
            </Picker>
          </View>
        ) : currentDate === "今日" ? (
          <Picker
            mode="date"
            onChange={this.onDateChange}
            value={dayJs(minDate).format("YYYY.MM.DD")}
          >
            <View className={`${cssPrefix}-time-date`}>
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_rili.png"
                className={`${cssPrefix}-time-cal`}
              />
              <Text className={`${cssPrefix}-time-text`}>
                {dayJs(minDate).format("YYYY.MM.DD")}
              </Text>
            </View>
          </Picker>
        ) : currentDate === "本周" ? (
          <Picker
            mode="selector"
            range={weeks}
            onChange={this.onDateChange}
            value={weekValue}
          >
            <View className={`${cssPrefix}-time-date`}>
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_rili.png"
                className={`${cssPrefix}-time-cal`}
              />
              <Text className={`${cssPrefix}-time-text`}>
                {`${dayJs(minDate).format("YYYY.MM.DD")} - ${dayJs(
                  maxDate
                ).format("YYYY.MM.DD")}`}
              </Text>
            </View>
          </Picker>
        ) : (
          <Picker
            mode="selector"
            range={month}
            onChange={this.onDateChange}
            value={0}
          >
            <View className={`${cssPrefix}-time-date`}>
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_rili.png"
                className={`${cssPrefix}-time-cal`}
              />
              <Text className={`${cssPrefix}-time-text`}>
                {`${dayJs(minDate).format("YYYY.MM.DD")} - ${dayJs(
                  maxDate
                ).format("YYYY.MM.DD")}`}
              </Text>
            </View>
          </Picker>
        )}
      </View>
    );
  };

  private renderTime = () => {
    const { currentDate } = this.state;

    return (
      <View className={`${cssPrefix}-time`}>
        {currentDate !== "自定义" && (
          <View
            className={`${cssPrefix}-time-item`}
            onClick={() =>
              loginManager.checkAuth(() => {
                this.prevDate();
              })
            }
          >
            <Image
              src="//net.huanmusic.com/weapp/v1/icon_time_left.png"
              className={`${cssPrefix}-time-icon`}
            />
          </View>
        )}
        {this.renderPicker()}
        {currentDate !== "自定义" && (
          <View
            className={`${cssPrefix}-time-item`}
            onClick={() =>
              loginManager.checkAuth(() => {
                this.nextDate();
              })
            }
          >
            <Image
              src="//net.huanmusic.com/weapp/v1/icon_time_right.png"
              className={`${cssPrefix}-time-icon`}
            />
          </View>
        )}
      </View>
    );
  };

  private renderCard = () => {
    const { reportBaseInfo } = this.props;
    const Rows = [
      {
        icon: "//net.huanmusic.com/weapp/icon_sale.png",
        title: "saleVisible",
        id: "saleVisible",
        onClick: () =>
          loginManager.checkAuth(() => {
            this.onChangeValue("saleVisible", true);
          }),
        items: [
          {
            title: "销售额",
            value: `￥${numeral(reportBaseInfo.sales).format("0.00")}`
          },
          {
            title: "销售笔数",
            value: `${numeral(reportBaseInfo.salesTimes || 0).value()}`
          }
        ],
        arrow: true
      },
      {
        icon: "//net.huanmusic.com/weapp/icon_refound.png",
        id: "refundVisible",
        title: "refundVisible",
        onClick: () =>
          loginManager.checkAuth(() => {
            this.onChangeValue("refundVisible", true);
          }),
        items: [
          {
            title: "退货额",
            value: `${numeral(reportBaseInfo.refundPrice || 0).format("0.00")}`
          },
          {
            title: "退货笔数",
            value: `${numeral(reportBaseInfo.refundTimes || 0).value()}`
          }
        ],
        arrow: true
      },
      {
        icon: "//net.huanmusic.com/weapp/icon_grossprofit.png",
        id: "saleVisible",
        title: "saleVisible",
        items: [
          {
            title: "销售利润",
            value: `${numeral(reportBaseInfo.profit).format("0.00")}`
          },
          {
            title: "利润率",
            value: `${numeral(
              numeral(reportBaseInfo.profitRate || 0).value()
            ).format("0.00")}%`
          }
        ],
        arrow: false
      }
    ];
    return (
      <View className={`${cssPrefix}-card`}>
        <View className={`${cssPrefix}-card-report`}>
          <Text className={`${cssPrefix}-card-report-text`}>
            —— 营业实收 ——
          </Text>
          <Text className={`${cssPrefix}-card-report-price`}>
            ￥{numeral(reportBaseInfo.turnover || 0).format("0.00")}
          </Text>
        </View>
        {Rows.map((row, index) => {
          return (
            <ReportRow
              key={row.icon}
              row={row}
              last={index + 1 === Rows.length}
            />
          );
        })}
      </View>
    );
  };

  private renderTab = (tab: any) => {
    const { currentMerchant } = this.state;
    return (
      <View className={`${cssPrefix}-tab`}>
        {tab.emphasis ? (
          <Text className={`${cssPrefix}-tab-text-emphasis`}>{tab.title}</Text>
        ) : (
          <Text className={`${cssPrefix}-tab-text`}>
            {tab.title === "门店"
              ? !!currentMerchant
                ? currentMerchant.name.length < 5
                  ? currentMerchant.name
                  : (currentMerchant.name as string).slice(0, 5)
                : tab.title
              : tab.title}
          </Text>
        )}
        {tab.more ? <View className={`${cssPrefix}-tab-icon`} /> : <View />}
      </View>
    );
  };

  private renderChartTabs = () => {
    const { currentChartType } = this.state;
    const salesAnalysisTypes = [
      {
        title: "畅销产品"
      },
      {
        title: "滞销产品"
      }
    ];
    return (
      <View className={`${cssPrefix}-chart-tabs`}>
        {salesAnalysisTypes.map((tab, index) => {
          return (
            <View
              key={tab.title}
              className={classnames(`${cssPrefix}-chart-tabs-tab`, {
                [`${cssPrefix}-chart-tabs-tab-active`]:
                  index === currentChartType
              })}
              onClick={() => {
                this.onSalesAnalysisTypeChange(index);
              }}
            >
              {tab.title}
            </View>
          );
        })}
      </View>
    );
  };

  private renderChartCard = () => {
    return (
      <View className={`${cssPrefix}-card`}>{this.renderChartTabs()}</View>
    );
  };
}

const select = (state: AppReducer.AppState) => ({
  reportBaseInfo: getReportBaseInfo(state),
  userinfo: getProfileInfo(state),
  merchantSubList: getMerchantSubList(state)
});

export default connect(select)(ReportMain);
