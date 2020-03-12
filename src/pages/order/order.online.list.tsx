/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-11 16:20:06
 */

import Taro, { Config } from '@tarojs/taro';
import { View, Text, ScrollView, Input, Image, Picker } from '@tarojs/components';
import { AtActivityIndicator } from 'taro-ui';
import { OrderInterface } from '../../constants';
import { getOrderListOnline, getOrderListOnlineTotal } from '../../reducers/app.order';
import { connect } from '@tarojs/redux';
import { OrderAction } from '../../actions';
import dayJs from 'dayjs';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';
import ModalLayout from '../../component/layout/modal.layout';
import classnames from 'classnames';
import merge from 'lodash.merge';
import { ConsoleUtil } from '../../common/util/common';
import './index.less'
import TabsSwitch from '../../component/tabs/tabs.switch';
import OrderItem from '../../component/order/order.online';
import Empty from '../../component/empty/index';

let pageNum: number = 1;
const pageSize: number = 20;

const cssPrefix = 'order';

type Props = { 
  orderList: OrderInterface.OrderDetail[];
  orderListTotal: number;
  orderCount: any;
};

class OrderOnlineList extends Taro.Component<Props> {

  state = {
    currentType: 0,
    getUserinfoModal: false,
    loginModal: false,
    loading: false,
  };

  config: Taro.Config = {
    navigationBarTitleText: '订单',
  };

  async componentDidShow() {
    this.init();
  }

  public init = async () => {
    const { currentType } = this.state;
    pageNum = 1;
    OrderAction.orderList({ pageNum: pageNum++, pageSize, orderSource: 3, ...OrderAction.getFetchType(currentType) });
    // OrderAction.orderCount();
  }

  public fetchOrder = async (page?: number) => {
    try {
      const { currentType } = this.state;
      this.setState({loading: true});
      let payload: OrderInterface.OrderListFetchFidle = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
        orderSource: 3,
      };
      const result = await OrderAction.orderList(payload);
      this.setState({loading: false});
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      if (typeof page === 'number') {
        pageNum = page;
      } else {
        pageNum += 1;
      }
    } catch (error) {
      this.setState({loading: false});
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {

    const { orderList } = this.props;
    const hasMore = false;
    const { currentType, loading } = this.state;
    return (
      <View className={`container ${cssPrefix}`}>
        {this.renderTabs()}
        {
          !loading
          ? orderList && orderList.length > 0
            ? (
              <ScrollView
                scrollY={true}
                className={`${cssPrefix}-scrollview`}
                onScrollToLower={() => {
                  if (hasMore) {
                    this.fetchOrder();
                  }
                }}
              >
                {
                  orderList.map((item: any) => {
                    return (
                      <View className={`${cssPrefix}-scrollview-item`} key={item.orderNo}>
                        <OrderItem 
                          data={item} 
                          orderAllStatus={[]} 
                          currentType={currentType}
                        />
                      </View>
                    )
                  })
                }

                {!hasMore && orderList.length > 0 && (
                  <View className={`${cssPrefix}-scrollview-bottom`}>已经到底了</View>
                )}
              </ScrollView>
            )
            : (
              <Empty
                img='//net.huanmusic.com/img_order_empty.png'
                text='还没有订单'
              />
            )
          : (
            <AtActivityIndicator
              mode='center'
            />
          )
        }
      </View>
    );
  }

  public onChangeTab = (tabNum: number) => {
    this.setState({
      currentType: tabNum
    }, () => {
      this.fetchOrder(1);
      // OrderAction.orderCount();
    });
  }

  private renderTabs = () => {
    const { currentType } = this.state;
    const { orderCount = {} } = this.props;
    const orderTypes = [
      {
        title: '待支付',
        num: orderCount.initNum || 0,
      },
      {
        title: '待收货',
        num: orderCount.inTransNum || 0,
      },
      {
        title: '待自提',
        num: orderCount.waitForReceiptNum || 0,
      },
      {
        title: '全部'
      },
    ];
    return (
      <View className={`${cssPrefix}-tabs`}>
        <TabsSwitch
          current={currentType}
          tabs={orderTypes}
          onChangeTab={this.onChangeTab}
        />
      </View>
    );
  }
}


const select = (state: any) => ({
  orderList: getOrderListOnline(state),
  orderListTotal: getOrderListOnlineTotal(state),
  // orderCount: getOrderCount(state),
  // orderAllStatus: getOrderAllStatus(state)
});

export default connect(select)(OrderOnlineList);