/**
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 19:28:43
 */
import Taro from '@tarojs/taro';
import { View, ScrollView, Input, Image, Text } from '@tarojs/components';
import MemberAction from '../../actions/member.action';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { MemberInterface } from '../../constants';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import './style/member.less';
import invariant from 'invariant';
import { AtActivityIndicator } from 'taro-ui';

const cssPrefix = 'member';

let pageNum: number = 1;
const pageSize: number = 20;

interface MemberMainProps { 
  memberListByDate: MemberInterface.MemberListByDate[];
}

interface State {
  searchValue: string;
  refreshing: boolean;
  loading: boolean;
  lastIsSearch: boolean;
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
    navigationBarTitleText: '会员管理'
  };

  readonly state = {
    searchValue: '',
    refreshing: false,
    loading: false,
    lastFetch: '',
    lastIsSearch: false,
  };
  
  componentDidShow () {
    this.fetchMember(1);
  }

  /**
   * @todo [修改loading状态]
   *
   * @memberof MemberMain
   */
  public changeLoading = (loading: boolean) => {
    this.setState({loading});
  }

  /**
   * @todo [修改刷新状态]
   *
   * @memberof MemberMain
   */
  public changeRefreshing = (refreshing: boolean) => {
    this.setState({refreshing});
  }

  /**
   * @todo 修改搜索的value同时触发搜索查询
   *
   * @memberof MemberMain
   */
  public changeSearchValue = (value: string) => {
    this.setState({ searchValue: value }, () => {
      this.searchMember(1);
    });
  }

  /**
   * @todo [上次请求是否是查询]
   *
   * @memberof MemberMain
   */
  public changeLastIsSearch = (lastIsSearch: boolean) => {
    this.setState({ lastIsSearch });
  }

  public fetchMember = async (page?: number) => {
    try {
      /**
       * @todo [如果外部传入的page那么使用外面初入的page并给全局page赋值]
       */
      const currentPage = typeof page === 'number' ? page : pageNum;
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
      
      const result = await MemberAction.memberList({pageNum: currentPage, pageSize});
      invariant(result.success, result.result || '服务器开了个小差');
      /**
       * @todo [请求结束之后如果外部传入的page那么赋值给全局，如果没传那么默认+1]
       */
      if (typeof page === 'number') {
        pageNum = page;
      } else {
        pageNum += 1;
      }
      this.changeRefreshing(false);
      this.changeLoading(false);
    } catch (error) {
      this.changeLoading(false);
      this.changeRefreshing(false);
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  /**
   * @todo [搜索会员，每次搜索的时候重置pageNum]
   *
   * @memberof MemberMain
   */
  public searchMember = async (page?: number): Promise<void> => {
    try {
      const { searchValue: value } = this.state;
      this.changeLastIsSearch(true);
      if (value === '') {
        /**
         * @todo [如果搜索是''那么回归查询全部]
         */
        this.fetchMember(1);
        this.changeLastIsSearch(false);
        return;
      }
      const currentPage = typeof page === 'number' ? page : pageNum;
      const params: MemberInterface.MemberInfoSearchFidle = {
        pageNum: currentPage,
        pageSize,
        cardNo: value,
        phoneNumber: value,
      };
      const result = await MemberAction.memberSearch(params);
      invariant(result.success === true, result.result || '服务器开了个小差');
      if (typeof page === 'number') {
        pageNum = page;
      } else {
        pageNum += 1;
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
      this.changeLastIsSearch(false);
    }
  }

  public loadMore = async (): Promise<void> => {
    const { lastIsSearch } = this.state;
    if (lastIsSearch === false) {
      this.fetchMember();
    } else {
      this.searchMember();
    }
  }

  render () {
    const { loading } = this.state;
    const { memberListByDate } = this.props;
    return (
      <View className={`container ${cssPrefix}-main`}>
        <View className={`${cssPrefix}-bg-color`} />
        <View className={`${cssPrefix}-main-header`}>
          <View className={`${cssPrefix}-main-header-search`}>
            <Image src="//net.huanmusic.com/weapp/icon_search.png" className={`${cssPrefix}-main-header-search-icon`} />
            <Input 
              className={`${cssPrefix}-main-header-search-input`} 
              placeholder="请输入手机号/姓名"
              placeholderClass={`${cssPrefix}-main-header-search-input-holder`}
              value={this.state.searchValue}
              onInput={(event) => this.changeSearchValue(event.detail.value)}
              onConfirm={() => this.searchMember()}
            />
          </View>
          <View 
            className={`${cssPrefix}-main-header-add`}
            onClick={() => Taro.navigateTo({url: '/pages/member/member.add'})}
          >
            <Image src="//net.huanmusic.com/weapp/icon_add.png" className={`${cssPrefix}-main-header-add-icon`} />
            <Text className={`${cssPrefix}-main-header-add-text`}>添加</Text>
          </View>
        </View>
        <ScrollView 
          scrollY={true}
          className={`${cssPrefix} ${cssPrefix}-list`}
        >
          {memberListByDate && memberListByDate.length > 0 ? (
            memberListByDate.map((dateList) => {
              const formData: FormRowProps[] = dateList.data.map((member) => {
                return {
                  title: `姓名: ${member.username}`,
                  onClick: () => Taro.navigateTo({url: `/pages/member/member.detail?id=${member.id}`})
                };
              });
              formData.unshift({title: dateList.date});
              return (
                <FormCard items={formData} key={dateList.date} />
              );
            })
          ) : (
            <View>暂无数据</View>
          )}
          {loading === true && (
            <AtActivityIndicator mode='center' />
          )}
          <View className={`${cssPrefix}-loading`}>
            <AtActivityIndicator mode='center' />
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapState = (state: AppReducer.AppState) => {
  return {
    memberListByDate: 
      state.member.memberList && state.member.memberList.data 
      ? MemberAction.fliterDataByDate(state.member.memberList.data) 
      : []
  };
};

export default connect(mapState)(MemberMain);