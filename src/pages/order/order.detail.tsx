import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import "../style/order.less";
import "../style/product.less";
import dayJs from 'dayjs';
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

const cssPrefix = 'order';

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

type State = {};

class OrderDetail extends Taro.Component<Props, State> {

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

  public onRefund = async () => {
    try {
      Taro.navigateTo({
        url: `/pages/order/order.refund`
      });
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
          <View className={`${cssPrefix}-detail-status-title`}>
            {transFlag === -1
              ? '交易失败'
              : '交易成功'}
          </View>
        )}
      </View>
    );
  }

  private renderCards = () => {
    const { orderDetail } = this.props;
    const extraTextColor: any = orderDetail.order.transType === 1 ? '#FC4E44' : '#333333';
    const symbol = orderDetail.order.transType === 1 ? '-' : '';

    const Form: FormRowProps[] = [
      {
        title: '订单号',
        extraText: `${orderDetail.order && orderDetail.order.orderNo}`,
      },
      {
        title: '下单时间',
        extraText: `${orderDetail.order && dayJs(orderDetail.order.createTime).format('YYYY/MM/DD HH:mm:ss')}`,
      },
      
    ];

    if (orderDetail.order && orderDetail.order.username) {
      Form.push({
        title: '收银员',
        extraText: `${orderDetail.order && orderDetail.order.username}`,
      });
    }

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
        extraText: orderDetail.order.transFlag === -1 
          ? `${orderDetail.order.transType !== 1 ? '收款' : '退款'}失败` 
          : `${symbol}￥ ${numeral(orderDetail.order.transAmount).format('0.00')}`,
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
      {
        title: '商品优惠',
        extraText: `-￥ ${numeral(orderDetail.order.discount).format('0.00')}`,
        extraTextStyle: 'price',
      },
      {
        title: '整单优惠',
        extraText: `-￥ ${numeral(orderDetail.order.erase).format('0.00')}`,
        extraTextStyle: 'price',
        hasBorder: false
      },
    ];

    const memberForm = orderDetail.order && orderDetail.order.memberPhone && [{
      title: '会员',
      extraText: orderDetail.order.memberPhone,
      hasBorder: false,
    }];

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
          <View className={`${cssPrefix}-detail-card`}>
            <FormCard items={Form2} />
          </View>
        )}
        {Form3 && (
          <View className={`${cssPrefix}-detail-card`}>
            <FormCard items={Form3} />
          </View>
        )}
        {memberForm && (
          <View className={`${cssPrefix}-detail-card container-color`}>
            <FormCard items={memberForm} />
          </View>
        )}
        <View className={`${cssPrefix}-detail-card container-color`}>
          {this.renderList()}
        </View>
        <View className={`${cssPrefix}-detail-card ${cssPrefix}-detail-card-mar container-color`}>
          <FormCard items={Form} margin={false} />
        </View>

        {orderDetail.order && orderDetail.order.originOrderNo && (
          <View 
            className={`${cssPrefix}-detail-card container-color`}
            onClick={() => {
              Taro.navigateTo({
                url: `/pages/order/order.detail?id=${orderDetail.order.originOrderNo}`
              });
            }}
          >
            <View className={`${cssPrefix}-detail-item`}>
              <View className={`${cssPrefix}-detail-item-box`}>
                <Text className={`${cssPrefix}-detail-item-title`}>原销售订单</Text>
                <Text className={`${cssPrefix}-detail-item-text`}>未返回</Text>
              </View>
              <View className={`${cssPrefix}-detail-item-extra`}>
                <Text className={`${cssPrefix}-detail-item-price`}>未返回</Text>
                <View  
                  className={`${cssPrefix}-detail-item-arrow`}
                />
              </View>
            </View>
          </View>
        )}

        <View style='width: 100%; height: 100px; background: #f2f2f2;' />
        {orderDetail.orderDetailList && orderDetail.orderDetailList.length > 0 
        && orderDetail.order && orderDetail.order.orderSource !== 3 && orderDetail.order.transType !== 1 && (
          <ButtonFooter
            buttons={[{
              title: '退货',
              onPress: () => this.onRefund()
            }]}
          />
        )}
      </View>
    );
  }

  private renderList = () => {
    const { orderDetail } = this.props;
    if (orderDetail.orderDetailList) {
      const productList: ProductCartInterface.ProductCartInfo[] = orderDetail.orderDetailList.map((item) => {
        /**
         * @time 0319
         * @todo [修改价格和原价]
         */
        const formartItem: any = {
          id: item.productId,
          name: item.productName,
          price: item.originPrice,
          sellNum: item.num,
          changePrice: item.unitPrice,
        };
        return formartItem;
      });
      return (
        <ProductPayListView
          padding={false}
          area={false}
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
