import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './product.less';
import { ProductInterface } from '../../constants';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getProductCartList } from '../../common/sdk/product/product.sdk.reducer';
import { AtButton } from 'taro-ui';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';

const cssPrefix = 'component-product';
interface Props { 
  product: ProductInterface.ProductInfo;
  productInCart?: ProductCartInterface.ProductCartInfo;
}

class ProductComponent extends Taro.Component<Props> {

  public manageProduct = (type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce) => {
    const { product } = this.props;
    productSdk.manage({type, product});
  }

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

          {this.renderStepper()}
        </View>
      </View>
    );
  }

  private renderStepper = () => {
    const { productInCart } = this.props;

    return (
      <View className={`${cssPrefix}-stepper`}>
        {productInCart !== undefined ? (
          <View className={`${cssPrefix}-stepper-container`}>            
            <AtButton
              type="secondary"
              size="small"
              circle={true}
              onClick={() => this.manageProduct(productSdk.productCartManageType.REDUCE)}
            >
              -
            </AtButton>
            <Text>{productInCart.sellNum}</Text>
            <AtButton
              type="primary"
              size="small"
              circle={true}
              onClick={() => this.manageProduct(productSdk.productCartManageType.ADD)}
            >
              +
            </AtButton>
          </View>
        ) : (
          <View className={`${cssPrefix}-stepper-container`}>            
            <AtButton
              type="primary"
              size="small"
              circle={true}
              onClick={() => this.manageProduct(productSdk.productCartManageType.ADD)}
            >
              +
            </AtButton>
          </View>
        )}
        
      </View>
    );
  }
}

const select = (state: AppReducer.AppState, ownProps: Props) => {
  const { product } = ownProps;
  const productCartList = getProductCartList(state);
  const productInCart = product !== undefined && productCartList.find(p => p.id === product.id);
  return {
    product,
    productInCart,
  };
};

export default connect(select)(ProductComponent as any);