/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-09 14:13:32
 */

import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { OrderService, OrderInterface } from '../../constants';
import { getOrderList } from '../../reducers/app.order';
import { connect } from '@tarojs/redux';
import { OrderAction } from '../../actions';

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
    const { orderList } = this.props;
    return (
      <ScrollView
        scrollY={true}
        className="container"
      >
        {
          orderList.map((orderDetail) => {
            return (
              <View key={orderDetail.order.orderNo}>
                <Text>订单号 {orderDetail.order.orderNo}</Text>
              </View>
            );
          })
        }
      </ScrollView>
    );
  }
}

const select = (state: any) => ({
  orderList: getOrderList(state),
});

export default connect(select)(OrderMain);