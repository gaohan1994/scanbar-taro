/**
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-18 16:28:08
 */
import Taro from "@tarojs/taro";
import { View, ScrollView, Input, Image, Text } from "@tarojs/components";
import MemberAction from "../../actions/member.action";
import { connect } from "@tarojs/redux";
import { AppReducer } from "../../reducers";
import { MemberInterface, ReportInterface } from "../../constants";
import "../../component/card/form.card.less";
import "../style/member.less";
import "../style/home.less";
import invariant from "invariant";
import { AtActivityIndicator } from "taro-ui";
import classnames from "classnames";
import "../style/product.less";
import { getMemberList } from "../../reducers/app.member";
import numeral from "numeral";
import { getReportTodayData } from "../../reducers/app.report";
import dayjs from "dayjs";

const cssPrefix = "member";

let pageNum: number = 1;
const pageSize: number = 20;

interface MemberMainProps {
  // memberListByDate: MemberInterface.MemberListByDate[];
  memberList: MemberInterface.MemberInfo[];
  reportTodayData: ReportInterface.ReportTodayData;
  memberListTotal: number;
}

type MemberQuery = "total_amount" | "last_pay_time" | "create_time";
type MemberSelect = "desc" | "asc";

interface State {
  searchValue: string;
  refreshing: boolean;
  loading: boolean;
  lastIsSearch: boolean;
  memberQuery: MemberQuery;
  memberSelect: MemberSelect;
}
class MemberMain extends Taro.Component<MemberMainProps, State> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: "会员管理"
  };

  readonly state = {
    searchValue: "",
    refreshing: false,
    loading: false,
    lastFetch: "",
    lastIsSearch: false,
    memberQuery: "total_amount" as MemberQuery,
    memberSelect: "desc" as MemberSelect
  };

  componentDidShow() {
    if (this.state.lastIsSearch === false && this.state.searchValue === "") {
      this.fetchMember(1);
    }
  }

  public changeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  };

  public onTabClick = (type: MemberQuery) => {
    const { memberQuery } = this.state;
    if (memberQuery === type) {
      this.setState(
        prevState => {
          return {
            ...prevState,
            memberSelect: prevState.memberSelect === "desc" ? "asc" : "desc"
          };
        },
        () => {
          this.fetchMember(1);
        }
      );
      return;
    }

    // 说明不是
    this.setState(
      {
        memberQuery: type,
        memberSelect: "desc"
      },
      () => {
        this.fetchMember(1);
      }
    );
  };

  /**
   * @todo [修改loading状态]
   *
   * @memberof MemberMain
   */
  public changeLoading = (loading: boolean) => {
    this.setState({ loading });
  };

  /**
   * @todo [修改刷新状态]
   *
   * @memberof MemberMain
   */
  public changeRefreshing = (refreshing: boolean) => {
    this.setState({ refreshing });
  };

  /**
   * @todo 修改搜索的value同时触发搜索查询
   *
   * @memberof MemberMain
   */
  public changeSearchValue = (value: string) => {
    this.setState({ searchValue: value }, () => {
      this.searchMember(1);
    });
  };

  /**
   * @todo [上次请求是否是查询]
   *
   * @memberof MemberMain
   */
  public changeLastIsSearch = (lastIsSearch: boolean) => {
    this.setState({ lastIsSearch });
  };

  public fetchMember = async (page?: number) => {
    try {
      /**
       * @todo [如果外部传入的page那么使用外面初入的page并给全局page赋值]
       */
      const { memberListTotal, memberList } = this.props;
      const currentPage = typeof page === "number" ? page : pageNum;
      if (currentPage === 1) {
        if (this.state.refreshing === true) {
          return;
        }
        this.changeRefreshing(true);
      } else {
        if (this.state.loading === true) {
          return;
        }
        if (memberList.length >= memberListTotal) {
          Taro.showToast({
            title: "已经到底了",
            icon: "none"
          });
          return;
        }
        this.changeLoading(true);
      }
      Taro.showLoading();
      const { memberQuery, memberSelect } = this.state;
      const payload: MemberInterface.MemberInfoListFetchFidle = {
        pageNum: currentPage,
        pageSize,
        orderByColumn: `${memberQuery} ${memberSelect}`
      };
      const result = await MemberAction.memberList(payload);
      Taro.hideLoading();
      invariant(result.success, result.result || "服务器开了个小差");
      /**
       * @todo [请求结束之后如果外部传入的page那么赋值给全局，如果没传那么默认+1]
       */
      if (typeof page === "number") {
        pageNum = page;
      } else {
        pageNum += 1;
      }
      this.changeRefreshing(false);
      this.changeLoading(false);
    } catch (error) {
      this.changeRefreshing(false);
      this.changeLoading(false);
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  /**
   * @todo [搜索会员，每次搜索的时候重置pageNum]
   *
   * @memberof MemberMain
   */
  public searchMember = async (page?: number): Promise<void> => {
    try {
      const { searchValue: value } = this.state;
      this.changeLastIsSearch(true);
      if (value === "") {
        /**
         * @todo [如果搜索是''那么回归查询全部]
         */
        this.fetchMember(1);
        this.changeLastIsSearch(false);
        return;
      }
      const currentPage = typeof page === "number" ? page : pageNum;
      if (currentPage === 1) {
        if (this.state.refreshing === true) {
          return;
        } else {
          this.changeRefreshing(true);
        }
      } else {
        if (this.state.loading === true) {
          return;
        } else {
          this.changeLoading(true);
        }
      }
      const params: MemberInterface.MemberInfoSearchFidle = {
        pageSize,
        pageNum: currentPage,
        identity: value
      };
      const result = await MemberAction.memberSearch(params);
      invariant(result.success === true, result.result || "服务器开了个小差");
      if (typeof page === "number") {
        pageNum = page;
      } else {
        pageNum += 1;
      }
      this.changeRefreshing(false);
      this.changeLoading(false);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
      this.changeLastIsSearch(false);
      this.changeRefreshing(false);
      this.changeLoading(false);
    }
  };

  public loadMore = async (): Promise<void> => {
    const { lastIsSearch } = this.state;
    if (lastIsSearch === false) {
      this.fetchMember();
    } else {
      this.searchMember();
    }
  };

  public refresh = async (): Promise<void> => {
    const { lastIsSearch } = this.state;
    if (lastIsSearch === false) {
      this.fetchMember(1);
    } else {
      this.searchMember(1);
    }
  };

  render() {
    const { reportTodayData } = this.props;
    return (
      <View className={`container ${cssPrefix}-main container-color`}>
        <View className={`${cssPrefix}-main-header`}>
          <View className={`${cssPrefix}-main-header-search`}>
            <Image
              src="//net.huanmusic.com/weapp/icon_search.png"
              className={`${cssPrefix}-main-header-search-icon`}
            />
            <Input
              className={`${cssPrefix}-main-header-search-input`}
              placeholder="请输入手机号/姓名"
              placeholderClass={`${cssPrefix}-main-header-search-input-holder`}
              value={this.state.searchValue}
              onInput={event => this.changeSearchValue(event.detail.value)}
              onConfirm={() => this.searchMember()}
            />
          </View>
          <View
            className={`${cssPrefix}-main-header-add`}
            onClick={() => Taro.navigateTo({ url: "/pages/member/member.add" })}
          >
            <Text className={`${cssPrefix}-main-header-add-text`}>添加</Text>
          </View>
        </View>

        <View className={`product-manage-list`}>
          <View className={`${cssPrefix}-main-card`}>
            <View className="home-card">
              <View className="home-buttons member-card-buttons">
                <View
                  className={`home-buttons-button home-buttons-button-border ${cssPrefix}-main-button`}
                >
                  <View className="home-money">
                    {reportTodayData.totalMember || 0}
                  </View>
                  <View
                    className={`normal-text home-buttons-button-box home-buttons-button-mar`}
                  >
                    会员总数
                  </View>
                </View>
                <View
                  className={`home-buttons-button  ${cssPrefix}-main-button`}
                >
                  <View className="home-money">
                    {reportTodayData.todayAddMember || 0}
                  </View>
                  <View
                    className={`normal-text home-buttons-button-box home-buttons-button-mar`}
                  >
                    今日新增
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {this.renderTabs()}
      </View>
    );
  }

  private renderTabsHeader = () => {
    const { memberQuery, memberSelect } = this.state;

    const tabs: { key: MemberQuery; value: string }[] = [
      { key: "total_amount", value: "累计消费" },
      { key: "last_pay_time", value: "上次消费时间" },
      { key: "create_time", value: "注册时间" }
    ];
    return (
      <View className={`${cssPrefix}-tabs-header`}>
        {tabs.map(tab => {
          return (
            <View
              key={tab.key}
              className={classnames(`${cssPrefix}-tabs-header-item`, {
                [`${cssPrefix}-tabs-header-item-active`]:
                  memberQuery === tab.key
              })}
              onClick={() => this.onTabClick(tab.key)}
            >
              {tab.value}
              {memberQuery === tab.key && memberSelect === "desc" && (
                <Image
                  src="//net.huanmusic.com/weapp/icon_sort2.png"
                  className={`${cssPrefix}-tabs-header-item-icon`}
                />
              )}
              {memberQuery === tab.key && memberSelect === "asc" && (
                <Image
                  src="//net.huanmusic.com/weapp/icon_sort1.png"
                  className={`${cssPrefix}-tabs-header-item-icon ${cssPrefix}-tabs-header-item-icon`}
                />
              )}
              {memberQuery !== tab.key && (
                <Image
                  src="//net.huanmusic.com/weapp/icon_sort3.png"
                  className={`${cssPrefix}-tabs-header-item-icon ${cssPrefix}-tabs-header-item-icon`}
                />
              )}
              {memberQuery === tab.key && (
                <View className={`${cssPrefix}-tabs-header-item-border`} />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  private renderTabs = () => {
    const { loading, refreshing, memberQuery } = this.state;
    const { memberList } = this.props;
    return (
      <View className={`${cssPrefix}-tabs`}>
        {this.renderTabsHeader()}
        <ScrollView
          scrollY={true}
          className={`${cssPrefix}-tabs-list`}
          onScrollToUpper={this.refresh}
          onScrollToLower={this.loadMore}
        >
          {refreshing === true && (
            <View className={`${cssPrefix}-loading`}>
              <AtActivityIndicator mode="center" />
            </View>
          )}
          {memberList.length > 0 ? (
            <View
              className={classnames("component-form", {
                "component-form-shadow": true,
                [`${cssPrefix}-list-pos`]: true
              })}
            >
              {memberList.map(member => {
                return (
                  <View
                    key={member.id}
                    className={classnames(`${cssPrefix}-card-row`, {
                      [`${cssPrefix}-card-row-border`]: true
                    })}
                    onClick={() => {
                      Taro.navigateTo({
                        url: `/pages/member/member.detail?id=${member.id}`
                      });
                    }}
                  >
                    <View className={`${cssPrefix}-card-row-box`}>
                      <View
                        className={`${cssPrefix}-card-row-image`}
                        style={
                          member.avatar
                            ? `background-image: url(${member.avatar})`
                            : `background-image: url(//net.huanmusic.com/weapp/icon_vip_user.png)`
                        }
                      />
                      <View className={`${cssPrefix}-card-row-detail`}>
                        <View className={`${cssPrefix}-card-row-detail-name`}>
                          <Text className={`${cssPrefix}-card-text`}>
                            {member.username}
                          </Text>
                          <View className={`${cssPrefix}-card-row-detail-icon`}>
                            {member.levelName}
                          </View>
                        </View>
                        <Text
                          className={`${cssPrefix}-card-row-margin ${cssPrefix}-card-phone`}
                        >
                          {member.phoneNumber}
                        </Text>
                      </View>
                    </View>
                    {memberQuery === "total_amount" && (
                      <Text className={`${cssPrefix}-card-price`}>{`￥${numeral(
                        member.totalAmount
                      ).format("0.00")}`}</Text>
                    )}
                    {memberQuery === "create_time" && (
                      <Text className={`${cssPrefix}-card-price`}>
                        {dayjs(member.createTime).format("  YY/MM/DD HH:mm")}
                      </Text>
                    )}
                    {memberQuery === "last_pay_time" && (
                      <Text className={`${cssPrefix}-card-price`}>
                        {member.lastPayTime
                          ? dayjs(member.lastPayTime).format("  YY/MM/DD HH:mm")
                          : "暂无消费"}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className={`product-suspension`}>
              <Image
                src="//net.huanmusic.com/weapp/img_kong.png"
                className={`product-suspension-image`}
              />
              <Text className={`product-suspension-text`}>会员不存在</Text>
            </View>
          )}
          {loading && (
            <View className={`${cssPrefix}-loading`}>
              <AtActivityIndicator mode="center" />
            </View>
          )}
        </ScrollView>
      </View>
    );
  };
}

const mapState = (state: AppReducer.AppState) => {
  return {
    memberList: getMemberList(state).data || [],
    memberListTotal: getMemberList(state).total || 0,
    reportTodayData: getReportTodayData(state)
  };
};

export default connect(mapState)(MemberMain);
