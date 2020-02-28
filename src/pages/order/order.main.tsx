/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-02-25 11:38:27
 */

import Taro, { Config } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Image, Picker } from '@tarojs/components';
import { OrderInterface } from '../../constants';
import { getOrderList, getOrderListTotal, getOrderSearchList } from '../../reducers/app.order';
import { connect } from '@tarojs/redux';
import { OrderAction } from '../../actions';
import "../style/report.less";
import "../style/order.less";
import "../style/member.less";
import "../style/product.less";
import "../style/inventory.less";
import OrderItem from '../../component/order/order';
import dayJs from 'dayjs';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';
import ModalLayout from '../../component/layout/modal.layout';
import classnames from 'classnames';
import merge from 'lodash.merge';
import { ConsoleUtil } from '../../common/util/common';
const cu = new ConsoleUtil({title: 'OrderMain'});

const cssPrefix = 'order';

let pageNum: number = 1;
const pageSize: number = 20;

let searchPage: number = 1;

interface Props {
  orderList: OrderInterface.OrderDetail[];
  orderSearchList: OrderInterface.OrderDetail[];
  orderListTotal: number;
}

interface State {
  value: string;
  date: string;
  visible: boolean;
  selectStatus: any[];
  selectTypes: any[];
}

class OrderMain extends Taro.Component<Props, State> {
  config: Config = {
    navigationBarTitleText: '订单'
  };

  state: State = {
    value: '',
    date: dayJs().format('YYYY-MM-DD'),
    visible: false,
    selectStatus: [],
    selectTypes: [],
  };

  componentDidMount() {
    this.init();
  }

  public onChangeValue = (key: string, value: any) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    }, () => {
      if (key === 'value') {
        this.searchOrder(1);
      }
    });
  }

  public changeSelect = (value: number, key: string = 'selectStatus') => {
    this.setState(prevState => {
      const prevData: number[] = merge([], prevState[key]);
      const index = prevData.findIndex(p => p === value);
      /**
       * @time 02.29
       * @todo 修改订单筛选功能
       * @todo 当全部选择的时候，再点成功/失败，则重置为点击的状态
       */
      if (prevData.length === 2) {
        return {
          ...prevState,
          [`${key}`]: [value]
        }
      }

      if (index === -1) {
        prevData.push(value);
      } else {
        prevData.splice(index, 1);
      }
      return {
        ...prevState,
        [`${key}`]: prevData
      };
    });
  }

  public changeAll = (key: string = 'selectStatus') => {
    this.setState(prevState => {
      const prevData = merge([], prevState[key]);
      let nextData: any[] = [];
      if (prevData.length === 0) {
        nextData = [0, 1];
      }
      return {
        ...prevState,
        [key]: nextData
      };
    });
  }

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateChange = (event: any) => {
    this.setState({ date: event.detail.value }, () => {
      this.fetchOrder(1);
    });
  }

  public prevDate = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        date: dayJs(prevState.date).subtract(1, 'day').format('YYYY-MM-DD')
      };
    }, () => {
      this.fetchOrder(1);
    });
  }

  public nextDate = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        date: dayJs(prevState.date).add(1, 'day').format('YYYY-MM-DD')
      };
    }, () => {
      this.fetchOrder(1);
    });
  }

  public searchOrder = async (page?: number) => {
    try {
      const { value } = this.state;

      if (value === '') {
        OrderAction.emptyOrderSearchList();
        return;
      }
      const payload = {
        orderNo: value,
        pageNum: typeof page === 'number' ? page : searchPage,
        pageSize: 20,
      };
      const result = await OrderAction.orderListSearch(payload as any);
      // console.log('result', result);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      cu.console(`result`, result);
      if (typeof page === 'number') {
        searchPage = page;
      } else {
        searchPage += 1;
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public fetchOrder = async (page?: number) => {
    try {
      const { date, selectStatus, selectTypes } = this.state;

      /**
       * @todo [如果正常查询订单则取消搜索]
       */
      this.onChangeValue('value', '');

      let payload: OrderInterface.OrderListFetchFidle = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
        startTime: date,
        endTime: date,
      };
      if (selectStatus && selectStatus.length === 1) {
        const fetchType = selectStatus[0];
        if (fetchType === 0) {
          (payload as any).transFlags = '1, 7'
        } else {
          payload.transFlag = -1
        }
      }
      if (selectTypes && selectTypes.length === 1) {
        payload.transType = selectTypes[0];
      }
      const result = await OrderAction.orderList(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
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
    }
  }

  public reset = () => {
    this.setState({
      selectStatus: [],
      selectTypes: [],
    }, () => {
      this.fetchOrder(1);
    });
  }

  public init = async () => {
    pageNum = 1;
    const today = dayJs().format('YYYY-MM-DD');
    OrderAction.orderList({ pageNum: pageNum++, pageSize, startTime: today, endTime: today });
  }

  render() {
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-box`}>
          {this.renderSearch()}
        </View>
        {this.renderContainer()}
        {this.renderModal()}
      </View>
    );
  }

  private renderSearch = () => {
    const cssPrefix = 'member';
    const { value } = this.state;
    return (
      <View className={`order-header`}>
        <View className={`${cssPrefix}-main-header-search order-search`}>
          <Image src="//net.huanmusic.com/weapp/icon_search.png" className={`${cssPrefix}-main-header-search-icon`} />
          <Input
            className={`${cssPrefix}-main-header-search-input`}
            placeholder="请输入订单号"
            placeholderClass={`${cssPrefix}-main-header-search-input-holder`}
            value={value}
            onInput={({ detail: { value } }) => this.onChangeValue('value', value)}
          // onConfirm={() => this.searchMember()}
          />
        </View>
        <View
          className={'inventory-header-item'}
          onClick={() => this.onChangeValue('visible', true)}
        >
          <Image
            src="//net.huanmusic.com/weapp/icon_shaixuan.png"
            className={`inventory-header-item-sort`}
          />
          <Text className="inventory-header-item-text">筛选</Text>
        </View>
      </View>
    );
  }

  private renderContainer = () => {
    const { value } = this.state;
    const { orderList, orderListTotal, orderSearchList } = this.props;
    const hasMore = orderList.length < orderListTotal;
    return (
      <View className={`${cssPrefix}-container`}>
        {value === '' && (
          <View>{this.renderTime()}</View>
        )}
        <ScrollView
          scrollY={true}
          className={`${classnames(`${cssPrefix}-list`, {
            [`${cssPrefix}-list-pos`]: value === '',
            [`${cssPrefix}-list-pos-search`]: value !== '',
          })}`}
          onScrollToLower={() => {
            if (!!value) {
              this.searchOrder();
              return;
            }
            if (hasMore) {
              this.fetchOrder();
              return;
            }
          }}
        >
          {!!value && (
            orderSearchList.length > 0 ? orderSearchList.map((orderDetail) => {
              return (
                <OrderItem
                  key={orderDetail.order.orderNo}
                  data={orderDetail}
                />
              );
            }) : (
              <View className={`product-suspension order-list-empty`}>
                <Image src="//net.huanmusic.com/weapp/img_kong.png" className={`product-suspension-image`} />
                <Text className={`product-suspension-text`}>暂无内容</Text>
              </View>
            )
          )}
          {!value && (
            orderList.length > 0
            ? orderList.map((orderDetail) => {
              return (
                <OrderItem
                  key={orderDetail.order.orderNo}
                  data={orderDetail}
                />
              );
            })
            : (
              <View className={`product-suspension order-list-empty`}>
                <Image src="//net.huanmusic.com/weapp/img_kong.png" className={`product-suspension-image`} />
                <Text className={`product-suspension-text`}>暂无内容</Text>
              </View>
            )
          )}
          {!value && (
            !hasMore && orderList.length > 10 && (
              <View className={`${cssPrefix}-list-bottom`}>已经到底了</View>
            )
          )}
        </ScrollView>
      </View>
    );
  }

  private renderTime = () => {
    const { date } = this.state;
    return (
      <View className={`${cssPrefix}-time`} >
        <View className={`${cssPrefix}-time-box ${cssPrefix}-time-box-left`} onClick={() => this.prevDate()}>
          <Image
            src="//net.huanmusic.com/weapp/v1/icon_time_left.png"
            className={`${cssPrefix}-time-icon`}
          />
        </View>

        <Picker
          mode='date'
          onChange={this.onDateChange}
          value={date}
        >
          <View className={`${cssPrefix}-time-date`}>
            <Image src="//net.huanmusic.com/weapp/v1/icon_rili.png" className={`${cssPrefix}-time-rili`} />
            <Text>{date}</Text>
          </View>
        </Picker>
        <View className={`${cssPrefix}-time-box ${cssPrefix}-time-box-right`} onClick={() => this.nextDate()}>
          <Image
            src="//net.huanmusic.com/weapp/v1/icon_time_right.png"
            className={`${cssPrefix}-time-icon`}
          />
        </View>

      </View>
    );
  }

  private renderModal = () => {
    const { visible, selectStatus, selectTypes } = this.state;
    return (
      <ModalLayout
        visible={visible}
        onClose={() => this.onChangeValue('visible', false)}
        contentClassName={`${cssPrefix}-layout`}
        title="筛选"
        buttons={[
          {
            title: '重置', type: 'cancel', onPress: () => {
              this.reset();
            }
          },
          {
            title: '确定', onPress: () => {
              this.onChangeValue('visible', false);
              this.fetchOrder(1);
            }
          },
        ]}
      >
        <View className={`inventory-select`}>
          <View className={`inventory-select-item`}>
            <View className={`inventory-select-title`}>订单状态</View>
            <View className={"inventory-select-item-box"}>
              <View
                onClick={() => this.changeAll()}
                className={classnames(
                  'inventory-select-item-button',
                  { 'inventory-select-item-button-active': selectStatus.length === 2 }
                )}
              >
                全部状态
              </View>
              <View
                onClick={() => this.changeSelect(0, 'selectStatus')}
                className={classnames("inventory-select-item-button", {
                  'inventory-select-item-button-active': selectStatus.length === 1 && selectStatus.some((s) => s === 0)
                })}
              >
                交易成功
              </View>
              <View
                onClick={() => this.changeSelect(1, 'selectStatus')}
                className={classnames("inventory-select-item-button", {
                  'inventory-select-item-button-active': selectStatus.length === 1 && selectStatus.some((s) => s === 1)
                })}
              >
                交易失败
              </View>
            </View>
          </View>
          <View className={`inventory-select-item`}>
            <View className={`inventory-select-title`}>交易类型</View>
            <View className={"inventory-select-item-box"}>
              <View
                onClick={() => this.changeAll('selectTypes')}
                className={classnames(
                  'inventory-select-item-button',
                  { 'inventory-select-item-button-active': selectTypes.length === 2 }
                )}
              >
                全部订单
              </View>
              <View
                onClick={() => this.changeSelect(0, 'selectTypes')}
                className={classnames("inventory-select-item-button", {
                  'inventory-select-item-button-active': selectTypes.length === 1 && selectTypes.some((t) => t === 0)
                })}
              >
                销售单
              </View>
              <View
                onClick={() => this.changeSelect(1, 'selectTypes')}
                className={classnames("inventory-select-item-button", {
                  'inventory-select-item-button-active': selectTypes.length === 1 && selectTypes.some((t) => t === 1)
                })}
              >
                退货单
              </View>
            </View>
          </View>
        </View>
      </ModalLayout>
    );
  }
}

const select = (state: any) => ({
  orderList: getOrderList(state),
  orderListTotal: getOrderListTotal(state),
  orderSearchList: getOrderSearchList(state),
});

export default connect(select)(OrderMain);