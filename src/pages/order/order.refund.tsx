import Taro, { Config } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { connect } from "@tarojs/redux";
import { AppReducer } from "../../reducers";
import "../style/order.less";
import "../style/product.less";
import Modal from "../../component/modal/modal";
import invariant from "invariant";
import {
  ResponseCode,
  OrderInterface,
  OrderService
} from "../../constants/index";
import { getOrderDetail } from "../../reducers/app.order";
import numeral from "numeral";
import ProductComponent from "./component/product";
import merge from "lodash.merge";
import Footer from "./component/footer";
import { ModalInput } from "../../component/modal/modal";
import productSdk, {
  ProductCartInterface
} from "../../common/sdk/product/product.sdk";

const cssPrefix = "order";

export type CartItem = OrderInterface.OrderDetailItem & {
  sellNum: number;
  changePrice?: number;
};

type Props = {
  orderDetail: OrderInterface.OrderDetail;
};

type State = {
  damageList: number[];
  cartList: CartItem[];
  changePrice: string;
  changeSellNum: string;
  changeProduct: ProductCartInterface.ProductCartInfo;
  changeProductVisible: boolean;
};

class OrderDetail extends Taro.Component<Props, State> {
  config: Config = {
    navigationBarTitleText: "退货退款"
  };

  state: State = {
    damageList: [],
    cartList: [],
    changePrice: "",
    changeSellNum: "",
    changeProduct: {} as any,
    changeProductVisible: false
  };

  componentDidShow() {
    this.setState({
      cartList: [],
      damageList: []
    });
  }

  public onRefund = async () => {
    try {
      const { cartList, damageList } = this.state;
      Taro.navigateTo({
        url: `/pages/order/order.refund.confirm?damageList=${JSON.stringify(
          damageList
        )}&cartList=${JSON.stringify(cartList)}`
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public pickAll = () => {
    const token = this.allSellected();

    if (!token) {
      /**
       * @todo 没全选则全选
       */
      const { orderDetail } = this.props;
      const { orderDetailList } = orderDetail;
      this.setState({
        cartList: orderDetailList
          ? orderDetailList.map(item => {
              return {
                ...item,
                sellNum: item.num
              };
            })
          : []
      });
      return;
    }

    this.setState({
      cartList: []
    });
  };

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
    cartList.forEach(item => {
      if (item.sellNum !== item.num) {
        token = false;
      }
    });
    return token;
  };

  public onExtraClick = (
    product: OrderInterface.OrderDetailItem | CartItem
  ) => {
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
  };

  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  };

  public onChangeProductClose = () => {
    this.setState({
      changePrice: "",
      changeSellNum: "",
      changeProduct: {} as any,
      changeProductVisible: false
    });
  };

  public confirmChangeProduct = () => {
    const { changeSellNum, changePrice, changeProduct } = this.state;

    if (changeSellNum === "" || numeral(changeSellNum).value() <= 0) {
      return;
    }
    if (changePrice === "" || numeral(changePrice).value() <= 0) {
      return;
    }

    this.manageProduct(
      "ADD",
      changeProduct as any,
      numeral(changeSellNum).value(),
      !!changePrice && numeral(changePrice).value() !== changeProduct.unitPrice
        ? numeral(changePrice).value()
        : undefined
    );
    this.onChangeProductClose();
  };

  public manageProduct = (
    type: string,
    product: OrderInterface.OrderDetailItem | CartItem,
    sellNum: number = 1,
    changePrice?: number
  ) => {
    product = merge({}, product, !!changePrice ? { changePrice } : {});
    let cartList: CartItem[] = merge([], this.state.cartList);
    const index = cartList.findIndex(p => p.productId === product.productId);
    if (type === "ADD") {
      /**
       * @todo [如果已经存在购物车中+1]
       * @todo [如果没存在购物车中加入购物车]
       */
      if (index !== -1) {
        const currentItem = cartList[index];
        if (currentItem.sellNum + sellNum > currentItem.num) {
          Taro.showToast({
            title: "超过最大退货数量"
          });
          return;
        }
        currentItem.sellNum = sellNum !== 1 ? sellNum : currentItem.sellNum + 1;
      } else {
        if (sellNum > product.num) {
          Taro.showToast({
            title: "超过最大退货数量"
          });
          return;
        }

        cartList.push({
          ...product,
          sellNum
        });
      }
      this.setState({ cartList });
      return;
    }

    if (index !== -1) {
      const currentItem = cartList[index];
      /**
       * @todo 如果是非整数商品直接清零
       */
      if (`${currentItem.sellNum}`.indexOf(".") !== -1) {
        cartList.splice(index, 1);
      } else if (currentItem.sellNum === 1) {
        cartList.splice(index, 1);
      } else {
        cartList[index].sellNum =
          sellNum !== 1 ? sellNum : cartList[index].sellNum - 1;
      }
      this.setState({ cartList });
      return;
    }
    return;
  };

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
                style="background-image: url(//net.huanmusic.com/weapp/bt_normal.png)"
              />
            ) : (
              <View
                className={`${cssPrefix}-refund-title-icon`}
                style="background-image: url(//net.huanmusic.com/weapp/bt_selected.png)"
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
        {this.renderChangeProductModal()}
      </View>
    );
  }

  private renderChangeProductModal = () => {
    const {
      changePrice,
      changeSellNum,
      changeProductVisible,
      changeProduct
    } = this.state;
    const unit =
      changeProduct && changeProduct.unit && changeProduct.unit.length > 0
        ? changeProduct.unit
        : "个";
    let inputs: ModalInput[] = [
      {
        title: `${
          !!changeProduct
            ? !productSdk.isWeighProduct(changeProduct as any)
              ? "数量"
              : "重量"
            : "数量"
        }`,
        value: changeSellNum,
        placeholder: "请输入数量",
        type: `${
          !!changeProduct && changeProduct.saleType === 0 ? "number" : "digit"
        }` as any,
        endfix: changeProduct && changeProduct.unit,
        onInput: ({ detail: { value } }) => {
          this.onChangeValue("changeSellNum", value);
        }
      },
      {
        title: "价格",
        prefix: "￥",
        value: changePrice || `0`,
        type: "digit",
        onInput: ({ detail: { value } }) => {
          this.onChangeValue("changePrice", value);
        }
      }
    ];
    const buttons: any[] = [
      {
        title: "取消",
        type: "cancel",
        onPress: () => this.onChangeProductClose()
      },
      {
        title: "确定",
        type: "confirm",
        onPress: () => this.confirmChangeProduct()
      }
    ];
    return (
      <Modal
        header={(changeProduct && (changeProduct as any).productName) || ""}
        isOpened={changeProductVisible}
        onClose={() => this.onChangeProductClose()}
        inputs={inputs}
        buttons={buttons}
      />
    );
  };

  private renderList = () => {
    const { orderDetail } = this.props;
    const { cartList, damageList } = this.state;
    const { orderDetailList } = orderDetail;
    return (
      <View>
        {orderDetailList &&
          orderDetailList.map(product => {
            const productInCart = cartList.find(
              p => p.productId === product.productId
            );
            return (
              <ProductComponent
                key={product.productId}
                product={product}
                damageList={damageList}
                onContentClick={() => {
                  this.setState({
                    changePrice: `${product.unitPrice}`,
                    changeProduct: product as any,
                    changeProductVisible: true
                  });
                }}
                productInCart={productInCart}
                manageProduct={this.manageProduct}
                onExtraClick={this.onExtraClick}
              />
            );
          })}
      </View>
    );
  };
}

const select = (state: AppReducer.AppState) => {
  /**
   * @time 0507操作一下
   * @todo [如果有退货的单子了记得把对应退货数量减去]
   */
  const orderDetail = getOrderDetail(state);
  return {
    orderDetail
  };
};

export default connect(select)(OrderDetail);
