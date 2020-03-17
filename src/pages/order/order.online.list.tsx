/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-17 14:02:15
 */

import Taro from '@tarojs/taro';
import { View, ScrollView, Input } from '@tarojs/components';
import { AtActivityIndicator } from 'taro-ui';
import { OrderInterface } from '../../constants';
import { getOrderListOnline, getOrderListOnlineTotal, getOrderCount } from '../../reducers/app.order';
import { connect } from '@tarojs/redux';
import { OrderAction } from '../../actions';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';
import './index.less';
import "../style/inventory.less";
import "../style/product.less";
import TabsSwitch from '../../component/tabs/tabs.switch';
import OrderItem from '../../component/order/order.online';
import Empty from '../../component/empty/index';
import classnames from 'classnames';
import merge from 'lodash.merge';
import ModalLayout from '../../component/layout/modal.layout';
import { ORDER_STATUS } from '../../actions/order.action';

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
    value: '',
    visible: false,
    selectType: [],
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
    OrderAction.orderCount();
  }

  public onChange = (value: string) => {
    this.setState({value}, () => {
      this.fetchOrder(1);
    });
  }

  public changeSelectSupplier = (item: any) => {
    this.setState((prevState: any) => {
      const prevIds = merge([], prevState.selectType);

      const index = prevIds.findIndex(p => p === item.id);
      if (index === -1) {
        prevIds.push(item.id);
      } else {
        prevIds.splice(index, 1);
      }
      return {
        ...prevState,
        selectType: prevIds
      };
    });
  }

  public changeAll = (key: string = 'selectType') => {
    this.setState(prevState => {
      const prevData = merge([], prevState[key]);
      let nextData: any[] = [];
      if (prevData.length !== ORDER_STATUS.length) {
        nextData = ORDER_STATUS.map((s) => s.id);
      }
      return {
        ...prevState,
        [key]: nextData
      };
    });
  }

  public fetchOrder = async (page?: number) => {
    try {
      const { currentType, value, selectType } = this.state;
      this.setState({loading: true});
      let payload: OrderInterface.OrderListFetchFidle = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
        orderSource: 3,
        ...OrderAction.getFetchType(currentType)
      };

      if (!!value) {
        // 加入搜索
        payload.orderNo = value;
      }
      
      if (selectType.length > 0) {
        payload.transFlags = selectType.join(',');
      }

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

  public onChangeTab = (tabNum: number) => {
    this.setState({
      currentType: tabNum,
      selectType: [],
    }, () => {
      this.fetchOrder(1);
      OrderAction.orderCount();
    });
  }

  public reset = () => {
    this.setState({
      selectType: [],
    });
  }

  render () {

    const { orderList } = this.props;
    const hasMore = false;
    const { currentType, loading } = this.state;
    return (
      <View className={`container ${cssPrefix}`}>
        {this.renderTabs()}
        <ScrollView
          scrollY={true}
          className={`${cssPrefix}-scrollview`}
          onScrollToLower={() => {
            if (hasMore) {
              this.fetchOrder();
            }
          }}
        >
          {currentType === 4 && (
            <View className={`${cssPrefix}-search`}>
              <View className={`${cssPrefix}-search-box`}>
                <View className={`${cssPrefix}-search-box-icon`} />
                <Input 
                  placeholder='请输入单号或会员手机号'
                  className={`${cssPrefix}-search-box-input`}
                  value={this.state.value}
                  onInput={({detail: {value}}) => this.onChange(value)}
                />
              </View>
              <View 
                className={`${cssPrefix}-search-select`} 
                onClick={() => this.setState({visible: true})}
              />
            </View>
          )}
          {!loading ? (
            orderList && orderList.length > 0
            ? (
              <View>
                {orderList.map((item: any) => {
                  return (
                    <View className={`${cssPrefix}-scrollview-item`} key={item.orderNo}>
                      <OrderItem 
                        data={item} 
                        orderAllStatus={[]} 
                        currentType={currentType}
                      />
                    </View>
                  );
                })}
                {!hasMore && orderList.length > 0 && (
                  <View className={`${cssPrefix}-scrollview-bottom`}>已经到底了</View>
                )}
              </View>
            )
            : (
              <Empty
                img='//net.huanmusic.com/img_order_empty.png'
                text='还没有订单'
              />
            )
          ) : (
            <AtActivityIndicator
              mode='center'
            />
          )}
        </ScrollView>
        {this.renderModal()}
      </View>
    );
  }
  
  private renderModal = () => {
    const { visible, selectType } = this.state;
    return (
      <ModalLayout
        visible={visible}
        onClose={() => this.setState({visible: false})}
        contentClassName={`product-layout`}
        title="筛选"
        buttons={[
          {title: '重置', onPress: () => this.reset(), type: 'cancel'},
          {title: '确定', onPress: () => {
            this.setState({visible: false});
            this.fetchOrder(1);
          }},
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
                  {'inventory-select-item-button-active': selectType.length === ORDER_STATUS.length}
                )}
              >
                全部
              </View>
              {
                ORDER_STATUS.map((item) => {
                  return (
                    <View 
                      key={item.id}
                      onClick={() => this.changeSelectSupplier(item)}
                      className={classnames("inventory-select-item-button", {
                        'inventory-select-item-button-active': selectType.length !== ORDER_STATUS.length && selectType.some((t) => t === item.id),
                      })}
                    >
                      {item.title}
                    </View>
                  );
                })
              }
            </View>
          </View>
        </View>
      </ModalLayout>
    );
  }

  private renderTabs = () => {
    const { currentType } = this.state;
    const { orderCount = {} } = this.props;
    const orderTypes = [
      {
        title: '待发货',
        num: orderCount.waitForSend || 0,
      },
      {
        title: '配送中',
        num: orderCount.inTransNum || 0,
      },
      {
        title: '待自提',
        num: orderCount.waitForReceiptNum || 0,
      },
      {
        title: '申请退款',
        num: orderCount.refundApplying || 0,
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
  orderCount: getOrderCount(state),
  // orderAllStatus: getOrderAllStatus(state)
});

export default connect(select)(OrderOnlineList);