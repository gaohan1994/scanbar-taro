import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
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
const cssPrefix = 'order';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

type State = {};

class OrderDetail extends Taro.Component<Props, State> {

  config: Config = {
    navigationBarTitleText: '订单详情'
  };

  componentWillMount() {
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

  public onCopy = async () => {
    try {
      const { orderDetail } = this.props;
      invariant(orderDetail && orderDetail.order && orderDetail.order.orderNo, '请选择要复制的数据');
      await Taro.setClipboardData({ data: orderDetail.order.orderNo });
      Taro.showToast({ title: '已复制订单号' });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }


  render() {
    return (
      <View className={`container ${cssPrefix}`}>
        <View className={`${cssPrefix}-detail-bg`} />
        <View className={`${cssPrefix}-detail-container`}>
          {this.renderStatus()}
          {this.renderCards()}
        </View>
      </View>
    );
  }

  private renderStatus = () => {
    const { orderDetail } = this.props;
    const { order } = orderDetail;
    const { transFlag } = order;
    return (
      <View className={`${cssPrefix}-detail-status`}>
        {
          transFlag === -1
            ? (
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_fail.png"
                className={`${cssPrefix}-detail-status-icon`}
              />
            )
            : (
              <Image
                src="//net.huanmusic.com/weapp/v1/icon_success.png"
                className={`${cssPrefix}-detail-status-icon`}
              />
            )
        }

        {orderDetail.order && (
          <View className={`${cssPrefix}-detail-status-detail`}>
            <View
              onClick={() => this.onCopy()}
              className={`${cssPrefix}-detail-status-detail-box`}
            >
              <Text className={`${cssPrefix}-detail-status-result`}>{orderDetail.order.orderNo}</Text>
              <Image
                src="//net.huanmusic.com/weapp/icon_copy.png"
                className={`${cssPrefix}-detail-status-copy`}
              />
            </View>
            <Text className={`${cssPrefix}-detail-status-time`}>{orderDetail.order.transTime}</Text>
            <Text className={`${cssPrefix}-detail-status-time`}>{orderDetail.order.username}</Text>
          </View>
        )}
      </View>
    );
  }

  private renderCards = () => {
    const { orderDetail } = this.props;
    const extraTextColor: any = orderDetail.order.transType === 1 ? '#FC4E44' : '#333333';
    const symbol = orderDetail.order.transType === 1 ? '-' : '';

    const Form2: FormRowProps[] = orderDetail.order && [
      {
        title: `${orderDetail.order.transType !== 1 ? '应收金额' : '应退金额'}`,
        extraText: `${symbol}￥ ${numeral(orderDetail.order.totalAmount).format('0.00')}`,
        extraTextStyle: 'title',
        extraTextColor: extraTextColor,
        extraTextBold: 'bold',
      },
      {
        title: `${OrderAction.orderPayType(orderDetail)}${orderDetail.order.transType !== 1 ? '收款' : '退款'}`,
        extraText: orderDetail.order.transFlag === -1 ? `${orderDetail.order.transType !== 1 ? '收款' : '退款'}失败` : `${symbol}￥ ${numeral(orderDetail.order.transAmount).format('0.00')}`,
        extraTextStyle: 'title',
        extraTextColor: extraTextColor,
        extraTextBold: 'bold',
        hasBorder: false,
      },
    ];

    // @ts-ignore
    const Form3: FormRowProps[] = orderDetail.order && [
      {
        title: '商品数量',
        extraText: orderDetail.order.totalNum,
        extraTextColor: '#4d4d4d'
      },
      {
        title: '原价金额',
        extraText: `￥ ${numeral(orderDetail.order.totalAmount).format('0.00')}`,
        extraTextColor: '#4d4d4d'
      },
    ];

    /**
     * @time 02.27
     * @todo [退货订单不显示这两项]
     * 
     * @time 02.28
     * @todo 不再显示 商品优惠 整单优惠
     */

    return (
      <View className={`${cssPrefix}-detail-cards`}>
        {Form2 && (
          <FormCard items={Form2} />
        )}
        {Form3 && (
          <FormCard items={Form3} />
        )}
        {/* {memberForm && (
          <FormCard items={memberForm} />
        )} */}
        {this.renderList()}
        <View className={`${cssPrefix}-area`} />
      </View>
    );
  }

  private renderList = () => {
    const { orderDetail } = this.props;
    if (orderDetail.orderDetailList) {
      const productList: ProductCartInterface.ProductCartInfo[] = orderDetail.orderDetailList.map((item) => {
        const formartItem: any = {
          id: item.productId,
          name: item.productName,
          price: item.transAmount / item.num,
          sellNum: item.num,
        }

        if (item.originPrice) {
          formartItem.changePrice = item.originPrice
        }
        return formartItem
      });
      return (
        <ProductPayListView
          padding={false}
          sort={orderDetail.order && orderDetail.order.transType === 1
            ? productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND
            : productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER}
          productList={productList}
        />
      );
    }
    return <View />;
  }
}

const select = (state: AppReducer.AppState) => ({
  orderDetail: getOrderDetail(state),
});

export default connect(select)(OrderDetail);
