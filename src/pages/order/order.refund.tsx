import Taro, { Config } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import "../style/order.less";
import "../style/product.less";
import invariant from 'invariant';
import { ResponseCode, OrderInterface, OrderService } from '../../constants/index';
import { getOrderDetail } from '../../reducers/app.order';
import numeral from 'numeral';
import ProductComponent from './component/product';
import merge from 'lodash.merge';
import Footer from './component/footer';

const cssPrefix = 'order';

export type CartItem = OrderInterface.OrderDetailItem & {sellNum: number; changePrice?: number};

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

type State = {
  damageList: number[];
  cartList: CartItem[];
};

class OrderDetail extends Taro.Component<Props, State> {

  config: Config = {
    navigationBarTitleText: '退货退款'
  };

  state: State = {
    damageList: [],
    cartList: [], 
  };

  componentDidShow () {
    this.setState({
      cartList: [],
      damageList: [],
    });
  }

  public onRefund = async () => {
    try {
      const { cartList, damageList } = this.state;
      const { orderDetail } = this.props;

      let priceNumber = 0;
      cartList.map((item) => {
        priceNumber += numeral(item.sellNum).value() * numeral(item.changePrice || item.unitPrice).value();
      });

      const payload: OrderInterface.RefundByOrderPayload = {
        order: {
          orderNo: orderDetail.orderNo,
          refundByPreOrder: true,
          orderSource: 0,
          payType: 0,
          terminalCd: "",
          terminalSn: "",
          transAmount: priceNumber,
        },
        productInfoList: cartList.map((item) => {
          const itemPrice = item.changePrice || item.unitPrice;
          const damageToken = damageList.findIndex(d => d === item.productId);
          return {
            changeNumber: item.sellNum,
            isDamaged: damageToken !== -1,
            orderDetailId: item.id,
            priceChangeFlag: !!item.changePrice,
            remark: "",
            unitPrice: itemPrice,
          };
        })
      };
      console.log('payload: ', payload);
      const result = await OrderService.orderRefund(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '退款成功',
        duration: 1000
      });

      setTimeout(() => {
        Taro.navigateBack({});
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public pickAll = () => {
    const token = this.allSellected();

    if (!token) {
      /**
       * @todo 没全选则全选
       */
      const { orderDetail } = this.props;
      const { orderDetailList } = orderDetail;
      this.setState({
        cartList: orderDetailList ? orderDetailList.map((item) => {
          return {
            ...item,
            sellNum: item.num
          };
        }) : []
      });
      return;
    }

    this.setState({
      cartList: []
    });
  }

  public allSellected = (): boolean => {
    const { cartList } = this.state;
    const { orderDetail } = this.props;
    const { orderDetailList } = orderDetail;

    if (!orderDetailList) {
      return false;
    }

    if (cartList.length !== orderDetailList.length) {
      return false;
    }
    
    let token = true;
    cartList.forEach((item) => {
      if (item.sellNum !== item.num) {
        token = false;
      }
    });
    return token;
  }

  public onExtraClick = (product: OrderInterface.OrderDetailItem | CartItem) => {
    let damageList: number[] = merge([], this.state.damageList);
    const index = damageList.findIndex(p => p === product.productId);

    if (index !== -1) {
      damageList.splice(index, 1);
      this.setState({
        damageList: damageList
      });
      return;
    }

    this.setState({
      damageList: damageList.concat([product.productId])
    });
  }

  public manageProduct = (type: string, product: OrderInterface.OrderDetailItem | CartItem, sellNum: number = 1) => {
    let cartList: CartItem[] = merge([], this.state.cartList);
    const index = cartList.findIndex(p => p.productId === product.productId);
    if (type === 'ADD') {
      /**
       * @todo [如果已经存在购物车中+1]
       * @todo [如果没存在购物车中加入购物车]
       */
      if (index !== -1) {
        const currentItem = cartList[index];
        if (currentItem.sellNum + sellNum > currentItem.num) {
          Taro.showToast({
            title: '超过最大退货数量'
          });
          return;
        }
        currentItem.sellNum = sellNum !== 1 ? sellNum : currentItem.sellNum + 1;
      } else {

        if (sellNum > product.num) {
          Taro.showToast({
            title: '超过最大退货数量'
          });
          return;
        }

        cartList.push({
          ...product,
          sellNum
        });
      }
      this.setState({cartList});
      return;
    }

    if (index !== -1) {
      const currentItem = cartList[index];
      if (currentItem.sellNum === 1) {
        cartList.splice(index, 1);
      } else {
        cartList[index].sellNum = sellNum !== 1 ? sellNum : cartList[index].sellNum - 1;
      }
      this.setState({cartList});
      return;
    }
    return;
  }

  render() {
    return (
      <View className={`container`}>
        <View className={`${cssPrefix}-refund-title`}>
          <View className={`${cssPrefix}-refund-title-text`}>退货商品</View>
          <View 
            onClick={() => this.pickAll()}
            className={`${cssPrefix}-refund-title-box`}
          >
            {!this.allSellected() ? (
              <View 
                className={`${cssPrefix}-refund-title-icon`}
                style='background-image: url(//net.huanmusic.com/weapp/bt_normal.png)'
              />
            ) : (
              <View 
                className={`${cssPrefix}-refund-title-icon`}
                style='background-image: url(//net.huanmusic.com/weapp/bt_selected.png)'
              />
            )}
            <View className={`${cssPrefix}-refund-title-text`}>全选</View>
          </View>
        </View>
        {this.renderList()}
        <Footer 
          cartList={this.state.cartList} 
          onClick={() => this.onRefund()}
        />
      </View>
    );
  }

  private renderList = () => {
    const { orderDetail } = this.props;
    const { cartList, damageList } = this.state;
    const { orderDetailList } = orderDetail;
    return (
      <View>
        {orderDetailList && orderDetailList.map((product) => {
          const productInCart = cartList.find((p) => p.productId === product.productId);
          return (
            <ProductComponent
              key={product.productId}
              product={product}
              damageList={damageList}
              onContentClick={() => {}}
              productInCart={productInCart}
              manageProduct={this.manageProduct}
              onExtraClick={this.onExtraClick}
            />
          );
        })}
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  orderDetail: getOrderDetail(state),
});

export default connect(select)(OrderDetail);
