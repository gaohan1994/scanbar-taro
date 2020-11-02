/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-18 17:26:00
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
import "../../component/card/form.card.less";
import TabsSwitch from '../../component/tabs/tabs.switch';
import OrderItem from '../../component/order/order.online';
import Empty from '../../component/empty/index';
import classnames from 'classnames';
import merge from 'lodash.merge';
import ModalLayout from '../../component/layout/modal.layout';
import { TRANS_FLAG, DELIVERY_STATUS, AFTER_SALE_STATUS } from '../../actions/order.action';

let pageNum: number = 1;
const pageSize: number = 20;

const cssPrefix = 'order';
const productPrefix = 'product'

type Props = { 
  orderList: OrderInterface.OrderDetail[];
  orderListTotal: number;
  orderCount: any;
};

type State = {
  currentType: number;
  getUserinfoModal: boolean;
  loginModal: boolean;
  loading: boolean;
  value: string,
  visible: boolean;
  selectTransFlags: string[],
  selectDeliveryStatus: string[],
  selectAfterSaleStatus: string[],
  transFlagList: any[],
  afterSaleStatusList: any[],
  deliveryStatusList: any[]
}

class OrderOnlineList extends Taro.Component<Props> {

  state:State = {
    currentType: 0,
    getUserinfoModal: false,
    loginModal: false,
    loading: false,
    value: '',
    visible: false,
    selectTransFlags: [],
    selectDeliveryStatus: [],
    selectAfterSaleStatus: [],
    transFlagList: [],
    afterSaleStatusList: [],
    deliveryStatusList: []
    
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
    // getDictList({ dictType: 'after_sale_status' }, (list) => this.setState({afterSaleStatusList: list}))
    // getDictList({ dictType: 'delivery_status' }, (list) => this.setState({deliveryStatusList: list}))
    // getDictList({ dictType: 'trans_flag' }, (list) => this.setState({transFlagList: list}))
    this.setState({
      afterSaleStatusList: AFTER_SALE_STATUS,
      deliveryStatusList: DELIVERY_STATUS,
      transFlagList: TRANS_FLAG
    })
    OrderAction.orderList({ pageNum: pageNum++, pageSize, orderSource: 3, ...OrderAction.getFetchType(currentType) });
    OrderAction.orderCount();
  }

  public onChange = (value: string) => {
    this.setState({value}, () => {
      this.fetchOrder(1);
    });
  }

  public changeSelect = (type:string, item: any) => {
    this.setState((prevState: any) => {
      const prevIds = merge([], prevState[type]);

      const index = prevIds.findIndex(p => p === item.dictValue);
      if (index === -1) {
        prevIds.push(item.dictValue);
      } else {
        prevIds.splice(index, 1);
      }
      return {
        ...prevState,
        [type]: prevIds
      };
    });
  }

  public changeAll = (key: string, list) => {
    const { selectAfterSaleStatus, afterSaleStatusList, selectDeliveryStatus, deliveryStatusList, selectTransFlags, transFlagList} = this.state
    const flag = selectAfterSaleStatus.length === afterSaleStatusList.length && selectTransFlags.length === transFlagList.length && selectDeliveryStatus.length === deliveryStatusList.length
    this.setState(prevState => {
      const prevData = merge([], prevState[key]);
      let nextData: any[] = [];
      if (!flag) {
        nextData = list.map((s) => s.dictValue);
      }
      return {
        ...prevState,
        [key]: nextData
      };
    });
  }

  public fetchOrder = async (page?: number) => {
    try {
      const { currentType, value, selectTransFlags, selectDeliveryStatus, selectAfterSaleStatus, deliveryStatusList, transFlagList, afterSaleStatusList } = this.state;
      this.setState({loading: true});
      Taro.showLoading()
      let payload: OrderInterface.OrderListFetchFidle = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
        orderSource: 3,
        orderByColumn: 'o.create_time desc',
        ...OrderAction.getFetchType(currentType)
      };

      if (!!value) {
        // 加入搜索
        payload.identity = value;
        
      }

      const checkAll = selectAfterSaleStatus.length === afterSaleStatusList.length && selectTransFlags.length === transFlagList.length && selectDeliveryStatus.length === deliveryStatusList.length
      const noCheck = selectAfterSaleStatus.length === 0 && selectDeliveryStatus.length === 0 && selectTransFlags.length === 0
      if(!checkAll && !noCheck){
        payload.isMultiCondition = true
        selectTransFlags.length > 0 && (payload.transFlags = selectTransFlags.join(','))
        selectDeliveryStatus.length > 0 && (payload.deliveryStatus = selectDeliveryStatus.join(','))
        selectAfterSaleStatus.length > 0 && (payload.afterSaleStatus = selectAfterSaleStatus.join(','))
      }

      const result = await OrderAction.orderList(payload);
      this.setState({loading: false});
      Taro.hideLoading()
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      if (typeof page === 'number') {
        pageNum = page + 1;
      } else {
        pageNum += 1;
      }
    } catch (error) {
      this.setState({loading: false});
      Taro.hideLoading()
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onChangeTab = (tabNum: number) => {
    this.setState({
      currentType: tabNum,
      selectAfterSaleStatus: [],
      selectDeliveryStatus: [],
      selectTransFlags: []

    }, () => {
      this.fetchOrder(1);
      OrderAction.orderCount();
    });
  }

  public reset = () => {
    this.setState({
      selectTransFlags: [],
      selectDeliveryStatus: [],
      selectAfterSaleStatus: []
    });
  }

  render () {

    const { orderList, orderListTotal } = this.props;
    const hasMore = orderList.length < orderListTotal;
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
          {/* {!loading ? ( */}
          {
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
          // ) 
          // : (
          //   <AtActivityIndicator
          //     mode='center'
          //   />
          // )}
          }
        </ScrollView>
        {this.renderModal()}
      </View>
    );
  }
  
  private renderModal = () => {
    const { visible, selectTransFlags, selectDeliveryStatus, selectAfterSaleStatus, afterSaleStatusList, transFlagList, deliveryStatusList } = this.state;
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

        {/**
         * 一种分类
         * */}
        <View className={`${productPrefix}-select-content`} style={{ padding: 0}}>
          {transFlagList.length  && (<View className={`${productPrefix}-select-content-item ${productPrefix}-select-border`}>
            <View className={`${productPrefix}-select-content-item-title`}>订单状态</View>
            <View className={`${productPrefix}-select-content-item-buttons`}>
              <View
                onClick={() => {
                  this.changeAll('selectTransFlags', transFlagList);
                  this.changeAll('selectDeliveryStatus', deliveryStatusList);
                  this.changeAll('selectAfterSaleStatus', afterSaleStatusList);
                }}
                className={
                  classnames("component-form-button", {
                    [`${productPrefix}-select-content-button`]: true,
                    "component-form-button-confirm":
                      selectTransFlags.length === transFlagList.length && selectAfterSaleStatus.length === afterSaleStatusList.length && selectDeliveryStatus.length === deliveryStatusList.length,
                    "component-form-button-cancel":
                      selectTransFlags.length !== transFlagList.length || selectAfterSaleStatus.length !== afterSaleStatusList.length || selectDeliveryStatus.length !== deliveryStatusList.length
                  })}
              >
                全部
              </View>
              {transFlagList.length && transFlagList.map((item) => {
                
                  if(item.dictValue === 1) { return '' }
                  return (
                    <View 
                      key={item.dictValue}
                      onClick={() => this.changeSelect('selectTransFlags', item)}
                      className={classnames("component-form-button", {
                        [`${productPrefix}-select-content-button`]: true,
                        "component-form-button-confirm": selectTransFlags.some((t) => t === item.dictValue),
                        "component-form-button-cancel": !selectTransFlags.some((t) => t === item.dictValue)
                      })}
                    >
                      {item.dictLabel}
                    </View>
                  );
                })
              }
              {deliveryStatusList.length && deliveryStatusList.map((item) => {
                if(item.dictValue === 3) { return '' }
                return (
                  <View 
                    key={item.dictValue}
                    onClick={() => this.changeSelect('selectDeliveryStatus', item)}
                    className={classnames("component-form-button", {
                      [`${productPrefix}-select-content-button`]: true,
                      'component-form-button-confirm': selectDeliveryStatus.some((t) => t === item.dictValue),
                      'component-form-button-cancel': !selectDeliveryStatus.some((t) => t === item.dictValue),
                    })}
                  >
                    {item.dictLabel}
                  </View>
                );
              })}
                  

              {afterSaleStatusList.length && afterSaleStatusList.map((item) => {
                return (
                  <View 
                    key={item.dictValue}
                    onClick={() => this.changeSelect('selectAfterSaleStatus', item)}
                    className={classnames("component-form-button", {
                      [`${productPrefix}-select-content-button`]: true,
                      'component-form-button-confirm':  selectAfterSaleStatus.some((t) => t === item.dictValue),
                      'component-form-button-cancel':  !selectAfterSaleStatus.some((t) => t === item.dictValue),
                    })}
                  >
                    {item.dictLabel}
                  </View>
                );
              })}
            </View>
          </View>)}

          

        {/**
         * 三种分类
         * */}
        {/* <View className={`${productPrefix}-select-content`} style={{ padding: 0}}>
          {transFlagList.length && (<View className={`${productPrefix}-select-content-item ${productPrefix}-select-border`}>
            <View className={`${productPrefix}-select-content-item-title`}>交易状态</View>
            <View className={`${productPrefix}-select-content-item-buttons`}>
              <View
                onClick={() => this.changeAll('selectTransFlags', transFlagList)}
                className={
                  classnames("component-form-button", {
                    [`${productPrefix}-select-content-button`]: true,
                    "component-form-button-confirm":
                      selectTransFlags.length === transFlagList.length,
                    "component-form-button-cancel":
                      selectTransFlags.length !== transFlagList.length
                  })}
              >
                全部
              </View>
              {
                transFlagList.map((item) => {
                  return (
                    <View 
                      key={item.dictValue}
                      onClick={() => this.changeSelect('selectTransFlags', item)}
                      className={classnames("component-form-button", {
                        [`${productPrefix}-select-content-button`]: true,
                        "component-form-button-confirm": selectTransFlags.some((t) => t === item.dictValue),
                        "component-form-button-cancel": !selectTransFlags.some((t) => t === item.dictValue)
                      })}
                    >
                      {item.dictLabel}
                    </View>
                  );
                })
              }
            </View>
          </View>)}
 
          {deliveryStatusList.length && (<View className={`${productPrefix}-select-content-item ${productPrefix}-select-border`}>
            <View className={`${productPrefix}-select-content-item-title`}>物流状态</View>
            <View className={`${productPrefix}-select-content-item-buttons`}>
              <View
                onClick={() => this.changeAll('selectDeliveryStatus', deliveryStatusList)}
                className={classnames(
                  'component-form-button', 
                  
                  {
                    [`${productPrefix}-select-content-button`]: true,
                    'component-form-button-confirm': 
                      selectDeliveryStatus.length === deliveryStatusList.length,
                    'component-form-button-cancel': 
                      selectDeliveryStatus.length !== deliveryStatusList.length
                  }
                )}
              >
                全部
              </View>
              {
                deliveryStatusList.map((item) => {
                  return (
                    <View 
                      key={item.dictValue}
                      onClick={() => this.changeSelect('selectDeliveryStatus', item)}
                      className={classnames("component-form-button", {
                        [`${productPrefix}-select-content-button`]: true,
                        'component-form-button-confirm': 
                          selectDeliveryStatus.some((t) => t === item.dictValue),
                        'component-form-button-cancel': 
                          !selectDeliveryStatus.some((t) => t === item.dictValue),

                      })}
                    >
                      {item.dictLabel}
                    </View>
                  );
                })
              }
            </View>
          </View>)}

          {afterSaleStatusList.length && (<View className={`${productPrefix}-select-content-item ${productPrefix}-select-border`}>
            <View className={`${productPrefix}-select-content-item-title`}>售后状态</View>
            <View className={`${productPrefix}-select-content-item-buttons`}>
              <View
                onClick={() => this.changeAll('selectAfterSaleStatus', afterSaleStatusList)}
                className={classnames(
                  'component-form-button', 
                  {
                    [`${productPrefix}-select-content-button`]: true,
                    'component-form-button-confirm': selectAfterSaleStatus.length === afterSaleStatusList.length,
                    'component-form-button-cancel': selectAfterSaleStatus.length !== afterSaleStatusList.length
                  }
                )}
              >
                全部
              </View>
              {
                afterSaleStatusList.map((item) => {
                  return (
                    <View 
                      key={item.dictValue}
                      onClick={() => this.changeSelect('selectAfterSaleStatus', item)}
                      className={classnames("component-form-button", {
                        [`${productPrefix}-select-content-button`]: true,
                        'component-form-button-confirm':  selectAfterSaleStatus.some((t) => t === item.dictValue),
                        'component-form-button-cancel':  !selectAfterSaleStatus.some((t) => t === item.dictValue),
                      })}
                    >
                      {item.dictLabel}
                    </View>
                  );
                })
              }
            </View>
          </View>)}*/}
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
        num: orderCount.waitForDelivery || 0,
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