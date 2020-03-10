import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import '../product/product.less'
import { ProductInterface } from 'src/constants';

const cssPrefix = 'component-product';

type Props = {
  product: ProductInterface.ProductInfo;
  numeral: any;
};

class PriceComponent extends Taro.Component<Props> {
  render () {
    const { product, numeral } = this.props;
    const price = product && product.price ? numeral(product.price).format('0.00') : '0.00';
    return (
      <View className={`${cssPrefix}-normal ${cssPrefix}-price-normal`}>
        <Text className={`${cssPrefix}-price-bge`}>￥</Text>
        <Text className={`${cssPrefix}-price`}>{price.split('.')[0]}</Text>
        <Text className={`${cssPrefix}-price-bge ${cssPrefix}-price-pos`}>{`.${price.split('.')[1]}`}</Text>
        {/* <Text className={`${cssPrefix}-price-origin`}>{price}</Text> */}
        {product.unit && (
          <Text className={`${cssPrefix}-price-unit`}>{`/${product.unit}`}</Text>
        )}
      </View>
    );
  }
}

export default PriceComponent;