import Taro from "@tarojs/taro";
import { View, Text } from "@tarojs/components";
import "../product/product.less";
import { ProductInterface } from "src/constants";
import productSdk from "../../common/sdk/product/product.sdk";

const cssPrefix = "component-product";

type Props = {
  product: ProductInterface.ProductInfo;
  numeral: any;
  sort: string;
};

class PriceComponent extends Taro.Component<Props> {
  render() {
    const { product, numeral, sort } = this.props;
    let price =
      product && product.price ? numeral(product.price).format("0.00") : "0.00";

    // if (
    //   sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER &&
    //   product.activityInfos &&
    //   product.activityInfos.findIndex(t => t.type === 1 || t.type === 2) !== -1
    // ) {
    //   const index = product.activityInfos.findIndex(
    //     t => t.type === 1 || t.type === 2
    //   );
    //   price = numeral(product.activityInfos[index].discountPrice).format(
    //     "0.00"
    //   );
    // }

    return (
      <View className={`${cssPrefix}-normal ${cssPrefix}-price-normal`}>
        <Text className={`${cssPrefix}-price-bge`}>￥</Text>
        <Text className={`${cssPrefix}-price`}>{price.split(".")[0]}</Text>
        <Text className={`${cssPrefix}-price-bge ${cssPrefix}-price-pos`}>
          {`.${price.split(".")[1]}`}
        </Text>
        {/* <Text className={`${cssPrefix}-price-origin`}>{price}</Text> */}
        {product.unit && (
          <Text className={`${cssPrefix}-price-unit`}>
            {`/${product.unit}`}
          </Text>
        )}
      </View>
    );
  }
}

export default PriceComponent;
