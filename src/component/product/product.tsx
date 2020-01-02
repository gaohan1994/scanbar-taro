import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './product.less';
import { ProductInterface } from '../../constants';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getProductCartList, getProductRefundList } from '../../common/sdk/product/product.sdk.reducer';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import classnames from 'classnames';

const cssPrefix = 'component-product';
interface Props { 
  product: ProductInterface.ProductInfo;
  productInCart?: ProductCartInterface.ProductCartInfo;
  sort?: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND;
}

interface State {
  priceModal: boolean;
  changePrice: string;
  changeSellNum: string;
}

class ProductComponent extends Taro.Component<Props, State> {

  state = {
    priceModal: false,
    changePrice: '',
    changeSellNum: '',
  };

  /**
   * @todo [新增商品点击改价]
   *
   * @memberof ProductComponent
   */
  public onProductPress = () => {
    this.changePriceModal();
  }

  public changeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  }

  public changePriceModal = () => {
    const { productInCart, product } = this.props;
    const payloadProduct = productInCart !== undefined ? productInCart : product;
    productSdk.changeProductVisible(true, payloadProduct);
  }

  public confirmChangeProduct = () => {
    this.changePriceModal();
    const { product, sort } = this.props;
    const { changeSellNum, changePrice } = this.state;

    if (changeSellNum === '' && changePrice === '') {
      return;
    }
    productSdk.changeProduct(product, Number(changeSellNum), Number(changePrice), sort);
  }

  public manageProduct = (type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce) => {
    const { product, sort } = this.props;
    productSdk.manage({type, product, sort});
  }

  render () {
    const { product } = this.props;
    return (
      <View className={`${cssPrefix} ${cssPrefix}-border`}>
        <View 
          className={`${cssPrefix}-content`}
        >
          <View 
            className={`${cssPrefix}-content-cover`} 
            onClick={() => this.onProductPress()}
          >
            {product.pictures && product.pictures !== '' ? (
              <Image src={product.pictures[0]} className={`${cssPrefix}-content-cover-image`} />
            ) : (
              <Image src="//net.huanmusic.com/weapp/img_nolist.png" className={`${cssPrefix}-content-cover-image`} />
            )}
          </View>
          <View className={`${cssPrefix}-content-detail`}>
            <View 
              className={`${cssPrefix}-title`}
              onClick={() => this.onProductPress()}
            >
              {product.name}
            </View>
            <Text className={`${cssPrefix}-normal`}>
              <Text className={`${cssPrefix}-price-bge`}>￥</Text>
              <Text className={`${cssPrefix}-price`}>{product.price}</Text>
              {` /${product.unit}`}
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
            <View 
              className={classnames(`${cssPrefix}-stepper-button`, `${cssPrefix}-stepper-button-reduce`)}
              onClick={() => this.manageProduct(productSdk.productCartManageType.REDUCE)}
            />
            <Text className={`${cssPrefix}-stepper-text`}>{productInCart.sellNum}</Text>
            <View 
              className={classnames(`${cssPrefix}-stepper-button`, `${cssPrefix}-stepper-button-add`)}
              onClick={() => this.manageProduct(productSdk.productCartManageType.ADD)}
            />  
          </View>
        ) : (
          <View className={`${cssPrefix}-stepper-container`}>            
            <View 
              className={classnames(`${cssPrefix}-stepper-button`, `${cssPrefix}-stepper-button-add`)}
              onClick={() => this.manageProduct(productSdk.productCartManageType.ADD)}
            />  
          </View>
        )}
        
      </View>
    );
  }
}

const select = (state: AppReducer.AppState, ownProps: Props) => {
  const { product, sort } = ownProps;
  const productList = sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER
    ? getProductCartList(state)
    : getProductRefundList(state);
  const productInCart = product !== undefined && productList.find(p => p.id === product.id);
  return {
    product,
    productInCart,
  };
};

export default connect(select)(ProductComponent as any);