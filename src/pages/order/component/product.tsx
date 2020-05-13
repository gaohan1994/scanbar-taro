import Taro from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "./index.less";
import "../../../component/product/product.less";
import classnames from "classnames";
import { OrderInterface } from "../../../constants";
import PriceComponent from "../../../component/layout/price";
import numeral from "numeral";
import merge from "lodash.merge";

const prefix = "component-order-product";
const cssPrefix = "component-product";

type Props = {
  product: OrderInterface.OrderDetailItem;
  onContentClick: any;
  damageList: number[];
  productInCart?: any;
  manageProduct?: any;
  onExtraClick?: any;
};

class OrderProduct extends Taro.Component<Props> {
  public manageProduct = (type: string) => {
    const { manageProduct, product } = this.props;
    manageProduct(type, product);
  };

  render() {
    const { product } = this.props;
    return (
      <View
        className={classnames(`${cssPrefix}-border`, {
          [`${cssPrefix} `]: true,
          [`${cssPrefix}-manage`]: true
        })}
      >
        <View
          className={`${cssPrefix}-content`}
          onClick={this.props.onContentClick.bind(this)}
        >
          <View className={`${cssPrefix}-content-cover`}>
            {product.picUrl && product.picUrl !== "" ? (
              <Image
                src={product.picUrl}
                className={`${cssPrefix}-content-cover-image`}
              />
            ) : (
              <Image
                src="//net.huanmusic.com/weapp/empty.png"
                className={`${cssPrefix}-content-cover-image`}
              />
            )}
          </View>
          {this.renderDetail()}
          {this.renderStepper()}
        </View>
        {this.renderExtra()}
      </View>
    );
  }

  private renderExtra = () => {
    const { damageList, product, onExtraClick } = this.props;
    const token = damageList.find(t => t === product.productId);
    return (
      <View className={`${prefix}-extra`} onClick={() => onExtraClick(product)}>
        {!token ? (
          <View
            className={`${prefix}-extra-icon`}
            style="background-image: url(//net.huanmusic.com/weapp/bt_normal.png)"
          />
        ) : (
          <View
            className={`${prefix}-extra-icon`}
            style="background-image: url(//net.huanmusic.com/weapp/bt_selected.png)"
          />
        )}
        <View className={`${prefix}-tip`}>计入损耗</View>
      </View>
    );
  };

  private renderDetail = () => {
    const { product } = this.props;
    const productData = merge(product, { price: product.unitPrice });
    return (
      <View className={classnames(`${cssPrefix}-content-detail`)}>
        <View className={`${cssPrefix}-title`}>{product.productName}</View>
        <View className={`${prefix}-box`}>
          <PriceComponent product={productData as any} numeral={numeral} />
          <View className={`${prefix}-tip`}>可退x{product.num}</View>
        </View>
      </View>
    );
  };

  private renderStepper = () => {
    const { productInCart } = this.props;
    return (
      <View className={`${cssPrefix}-stepper`}>
        {!!productInCart ? (
          <View className={`${cssPrefix}-stepper-container`}>
            <View
              className={classnames(
                `${cssPrefix}-stepper-button`,
                `${cssPrefix}-stepper-button-reduce`
              )}
              onClick={this.manageProduct.bind(this, "REDUCE")}
            />
            <Text className={`${cssPrefix}-stepper-text`}>
              {productInCart.sellNum}
            </Text>
            <View
              className={classnames(
                `${cssPrefix}-stepper-button`,
                `${cssPrefix}-stepper-button-add`
              )}
              onClick={this.manageProduct.bind(this, "ADD")}
            />
          </View>
        ) : (
          <View className={`${cssPrefix}-stepper-container`}>
            <View
              className={classnames(
                `${cssPrefix}-stepper-button`,
                `${cssPrefix}-stepper-button-add`
              )}
              onClick={this.manageProduct.bind(this, "ADD")}
            />
          </View>
        )}
      </View>
    );
  };
}

export default OrderProduct;
