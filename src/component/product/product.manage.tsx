import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './product.less';
import { ProductInterface } from 'src/constants';

const cssPrefix = 'component-product';
interface Props { 
  product: ProductInterface.ProductInfo;
}

class ProductManageComponent extends Taro.Component<Props> {

  public onProductClick = () => {
    const { product } = this.props;
    Taro.navigateTo({
      url: `/pages/product/product.detail?id=${product.id}`
    });
  }

  render () {
    const { product } = this.props;
    return (
      <View 
        className={`${cssPrefix}-manage ${cssPrefix}-border`}
        onClick={() => this.onProductClick()}
      >
        <View className={`${cssPrefix}-content`}>
          <View className={`${cssPrefix}-content-cover`}>
            <Image src={product.pictures} className={`${cssPrefix}-content-cover-image`} />
          </View>
          <View className={`${cssPrefix}-content-detail`}>
            <Text className={`${cssPrefix}-title`}>{product.name}</Text>
            <View className={`${cssPrefix}-manage-detail`}>
              <Text className={`${cssPrefix}-manage-font`}>进价: ￥{product.cost}</Text>
              <Text className={`${cssPrefix}-manage-font ${cssPrefix}-manage-font-theme`}>
                售价: ￥{product.price}
              </Text>
            </View>
          </View>

          <View className={`${cssPrefix}-manage-corner`}>
            <Text className={`${cssPrefix}-manage-font`}>库存: {product.number}{product.unit}</Text>
          </View>
        </View>
      </View>
    );
  }
}

export default ProductManageComponent;