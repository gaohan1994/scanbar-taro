import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './product.less';
import { ProductInterface } from 'src/constants';

const cssPrefix = 'component-product';
interface Props { 
  product: ProductInterface.ProductInfo;
}

class ProductComponent extends Taro.Component<Props> {
  render () {
    const { product } = this.props;
    return (
      <View className={`${cssPrefix} ${cssPrefix}-border`}>
        <View className={`${cssPrefix}-content`}>
          <View className={`${cssPrefix}-content-cover`}>
            <Image src={product.pictures} className={`${cssPrefix}-content-cover-image`} />
          </View>
          <View className={`${cssPrefix}-content-detail`}>
            <Text className={`${cssPrefix}-title`}>{product.name}</Text>
            <Text className={`${cssPrefix}-normal`}>
              <Text className={`${cssPrefix}-price-bge`}>￥</Text>
              <Text className={`${cssPrefix}-price`}>{product.price}</Text>
              /{product.unit}
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

export default ProductComponent;