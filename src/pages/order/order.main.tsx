/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-17 19:38:25
 */

import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { OrderService, OrderInterface } from '../../constants';
import { getOrderList } from '../../reducers/app.order';
import { connect } from '@tarojs/redux';
import { OrderAction } from '../../actions';
import "../style/report.less";
import "../style/order.less";
import OrderItem from '../../component/order/order';
import classnames from 'classnames';

const cssPrefix = 'order';
const reportCssprefix = 'report';

let pageNum: number = 1;
const pageSize: number = 20;

interface Props { 
  orderList: OrderInterface.OrderDetail[];
}

interface State { }

class OrderMain extends Taro.Component<Props, State> {

  componentDidMount() {
    this.init();
  }

  public init = async () => {
    pageNum = 1;
    OrderAction.orderList({pageNum: pageNum++, pageSize});
  }

  render () {
    return (
      <View className="container">
        {this.renderList()}
      </View>
    );
  }

  private renderList = () => {
    return (
      <View className={`container ${cssPrefix}`}>
        {this.renderHeader()}
        {this.renderContainer()}
      </View>
    );
  }

  private renderHeader = () => {
    const tabs = [
      {
        title: '所有门店'
      },
      {
        title: '经营报表'
      },
      {
        title: '按日统计'
      }
    ];
    const cssPrefix = 'report';
    return (
      <View>
        <View className={`order-bg`} />
        <View className={`${cssPrefix}-tabs`}>
          {
            tabs.map((tab) => {
              return (
                <View  
                  key={tab.title}
                  className={`${cssPrefix}-tab`} 
                >
                  <View  className={`${cssPrefix}-tab`} >
                    <Text className={`${cssPrefix}-tab-text`}>{tab.title}</Text>
                    <View className={`${cssPrefix}-tab-icon`} />
                  </View>
                </View>
              );
            })
          }
        </View>
      </View>
    );
  }

  private renderContainer = () => {
    const { orderList } = this.props;
    return (
      <View className={`${cssPrefix}-container`}>
        {this.renderTime()}
        <ScrollView
          scrollY={true}
          className={`${cssPrefix}-list`}
        >
          {   
            orderList.map((orderDetail, index) => {
              return (
                <View 
                  key={orderDetail.order.orderNo} 
                  className={classnames(`${cssPrefix}-list-item`, {
                    [`${cssPrefix}-list-top`]: index === 0,
                    [`${cssPrefix}-list-bottom`]: (index + 1) === orderList.length,
                  })}
                >
                  <OrderItem data={orderDetail} />
                </View>
              );
            })
          }
        </ScrollView>
      </View>
    );
  }

  private renderTime = () => {
    return (
      <View className={`${cssPrefix}-time`} >
        <Text className={`${cssPrefix}-time-text`} >{`<`}</Text>
        <View className={`${cssPrefix}-time-date`} >{`2019-09-09`}</View>
        <Text className={`${cssPrefix}-time-text`} >{`>`}</Text>
      </View>
    );
  }
}

const select = (state: any) => ({
  orderList: getOrderList(state),
});

export default connect(select)(OrderMain);