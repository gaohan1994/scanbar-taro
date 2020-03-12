/**
 * @todo [共12种状态]
 * 
 * @Author: Ghan 
 * @Date: 2020-03-10 15:29:23 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-11 17:18:39
 */
import Taro, { Config } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import "../style/order.less";
import "../style/product.less";
import { OrderAction } from '../../actions';
import invariant from 'invariant';
import { ResponseCode, OrderInterface } from '../../constants/index';
import { getOrderDetail } from '../../reducers/app.order';
import { FormRowProps } from '../../component/card/form.row';
import FormCard from '../../component/card/form.card';
import numeral from 'numeral';
import ProductPayListView from '../../component/product/product.pay.listview';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import ButtonFooter from '../../component/button/button.footer';
import OrderStatus from './component/status';
import OrderDetail from './component/detail';
import OrderList from './component/list';
import OrderContent from './component/content';

const cssPrefix = 'order';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

class OrderOnline extends Taro.Component<Props> {
  config: Config = {
    navigationBarTitleText: '订单详情'
  };

  componentDidShow() {
    try {
      const { params: { id } } = this.$router;
      invariant(!!id, '请传入订单id');
      this.init(id);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public init = async (id: string) => {
    try {
      const result = await OrderAction.orderDetail({ orderNo: id });
      invariant(result.code === ResponseCode.success, result.msg || ' ');
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }
  render () {
    const { orderDetail } = this.props;
    return (
      <View className={`container ${cssPrefix}`}>
        <OrderStatus orderDetail={orderDetail} />
        <OrderDetail orderDetail={orderDetail} />

        <OrderList>
          asd
        </OrderList>
        <OrderContent orderDetail={orderDetail} />

        <ButtonFooter
          buttons={[{
            title: '查看原订单',
            onPress: () => {
              //
            }
          }]}
        />
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  orderDetail: getOrderDetail(state),
});

export default connect(select)(OrderOnline);