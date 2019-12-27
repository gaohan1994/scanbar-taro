/**
 * @Author: Ghan 
 * @Date: 2019-12-09 11:01:19 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-27 10:09:37
 */

import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input, Image, Picker } from '@tarojs/components';
import { OrderInterface } from '../../constants';
import { getOrderList } from '../../reducers/app.order';
import { connect } from '@tarojs/redux';
import { OrderAction } from '../../actions';
import "../style/report.less";
import "../style/order.less";
import "../style/member.less";
import "../style/product.less";
import OrderItem from '../../component/order/order';
import dayJs from 'dayjs';
import { ResponseCode } from '../../constants/index';
import invariant from 'invariant';

const cssPrefix = 'order';

let pageNum: number = 1;
const pageSize: number = 20;

interface Props { 
  orderList: OrderInterface.OrderDetail[];
}

interface State { 
  value: string;
  date: string;
}

class OrderMain extends Taro.Component<Props, State> {

  state: State = {
    value: '', 
    date: dayJs().format('YYYY-MM-DD'),
  };

  componentDidMount() {
    this.init();
  }

  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    }, () => {
      this.searchOrder();
    });
  }

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateChange = (event: any) => {
    this.setState({date: event.detail.value}, () => {
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

  public searchOrder = () => {
    const { value } = this.state;
  }

  public fetchOrder = async (page?: number) => {
    try {
      const { date } = this.state;
      const payload: OrderInterface.OrderListFetchFidle = {
        pageNum: typeof page === 'number' ? page : pageNum,
        pageSize: 20,
        startTime: date,
        endTime: date,
      };
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

  public init = async () => {
    pageNum = 1;
    OrderAction.orderList({pageNum: pageNum++, pageSize});
  }

  render () {
    return (
      <View className="container container-color">
        <View className={`${cssPrefix}-bg`} />
        <View className={`${cssPrefix}-box`}>
          {this.renderSearch()}
        </View>
        {this.renderContainer()}
      </View>
    );
  }

  private renderSearch = () => {
    const cssPrefix = 'member';
    const { value } = this.state;
    return (
      <View className={`order-header`}>
        <View className={`${cssPrefix}-main-header-search order-search order-search`}>
          <Image src="//net.huanmusic.com/weapp/icon_search.png" className={`${cssPrefix}-main-header-search-icon`} />
          <Input
            className={`${cssPrefix}-main-header-search-input`} 
            placeholder="请输入订单号"
            placeholderClass={`${cssPrefix}-main-header-search-input-holder`}
            value={value}
            onInput={({detail: {value}}) => this.onChangeValue('value', value)}
            // onConfirm={() => this.searchMember()}
          />
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
          }
        </ScrollView>
      </View>
    );
  }

  private renderTime = () => {
    const { date } = this.state;
    return (
      <View className={`${cssPrefix}-time`} >
        <View className={`${cssPrefix}-time-box`} onClick={() => this.prevDate()}>
          <Image 
            src="//net.huanmusic.com/weapp/icon_time_left.png" 
            className={`${cssPrefix}-time-icon`} 
          />
        </View>
        
        <Picker
          mode='date'
          onChange={this.onDateChange} 
          value={date}
        >
          <View className={`${cssPrefix}-time-date`}>
            <Text>{date}</Text>
            <Image src="//net.huanmusic.com/weapp/icon_time_choose.png" className={`${cssPrefix}-time-wid`} />
          </View>
        </Picker>
        <View className={`${cssPrefix}-time-box`} onClick={() => this.nextDate()}>
          <Image 
            src="//net.huanmusic.com/weapp/icon_time_right.png" 
            className={`${cssPrefix}-time-icon`} 
          />
        </View>
        
      </View>
    );
  }
}

const select = (state: any) => ({
  orderList: getOrderList(state),
});

export default connect(select)(OrderMain);