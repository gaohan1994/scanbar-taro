import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "../../../pages/style/product.less";
import productSdk, {
  ProductCartInterface
} from "../../../common/sdk/product/product.sdk";
import { MemberInterface } from "../../../constants";

const cssPrefix = "product";

type Props = {
  product: ProductCartInterface.ProductCartInfo;
  numeral: any;
  sort?: string;
  selectMember?: MemberInterface.MemberInfo;
};

class PayListPrice extends Taro.Component<Props> {
  render() {
    const { sort, selectMember, product, numeral } = this.props;

    /**
     * @time 03.02
     * @todo 加入活动价格
     * @todo 如果称重商品有改价 则优先计算改价，如果没有改价 计算会员价和活动价格的最低价
     */
    const itemPrice: number = productSdk.getProductItemPrice(product);

    if ((product as any).priceType !== undefined) {
      const priceType = (product as any).priceType;
      return (
        <View
          className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}
        >
          {(product as any).priceType === 0 ? (
            <Text className={`${cssPrefix}-row-normal`}>
              {`￥ ${this.setNumber(itemPrice)}`}
            </Text>
          ) : (
            <View className={`${cssPrefix}-row-content-items`}>
              <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>
                {`￥ ${this.setNumber(product.price)}`}
              </Text>
              <View
                className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-refund`}
              >
                {priceType === 0
                  ? "原价"
                  : priceType === 1
                  ? "会员价"
                  : priceType === 2
                  ? "活动价"
                  : "改价"}
              </View>
              <Text className={`${cssPrefix}-row-normal`}>
                {`￥ ${numeral(product.changePrice).format("0.00")}`}
              </Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <View
        className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}
      >
        {sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE ? (
          <Text className={`${cssPrefix}-row-normal`}>
            {`￥ ${this.setNumber(itemPrice)}`}
          </Text>
        ) : sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND ? (
          product.changePrice &&
          numeral(product.changePrice).value() !==
            numeral(product.price).value() ? (
            <View className={`${cssPrefix}-row-content-items`}>
              <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>
                {`￥ ${this.setNumber(product.price)}`}
              </Text>
              <View
                className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-refund`}
              >
                退货价
              </View>
              <Text className={`${cssPrefix}-row-normal`}>{`￥ ${numeral(
                product.changePrice
              ).format("0.00")}`}</Text>
            </View>
          ) : (
            <Text className={`${cssPrefix}-row-normal`}>
              {`￥ ${this.setNumber(itemPrice)}`}
            </Text>
          )
        ) : !!product.changePrice && product.changePrice !== product.price ? (
          /**
           * @todo 2.26修改 当改价和员价相同时不显示改价图标
           */
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>
              {`￥ ${this.setNumber(product.price)}`}
            </Text>
            <View
              className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}
            >
              改价
            </View>
            <Text className={`${cssPrefix}-row-normal`}>
              {`￥ ${numeral(product.changePrice).format("0.00")}`}
            </Text>
          </View>
        ) : itemPrice !== product.price ? (
          /**
           * @time 03.02
           * @todo [改价>活动价=会员价>原价]
           */
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>
              {`￥ ${this.setNumber(product.price)}`}
            </Text>
            <View
              className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}
            >
              {productSdk.getProductItemPriceType(product, selectMember)}
            </View>
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${this.setNumber(
              itemPrice
            )}`}</Text>
          </View>
        ) : (
          <Text className={`${cssPrefix}-row-normal`}>
            {`￥ ${this.setNumber(product.price)}`}
          </Text>
        )}
        <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-bold`}>
          {`小计：￥ ${this.setNumber(itemPrice * product.sellNum)}`}
        </Text>
      </View>
    );
  }

  private setNumber = (num: number | string): string => {
    const { numeral } = this.props;
    return numeral(num).format("0.00");
  };
}
export default PayListPrice;
