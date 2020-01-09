import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './product.less';
import { ProductInterface } from '../../constants';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
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

  public changeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  }

  /**
   * @todo [新增商品点击改价]
   *
   * @memberof ProductComponent
   */
  public changePriceModal = () => {
    const { productInCart, product, sort } = this.props;
    const payloadProduct = productInCart !== undefined ? productInCart : product;
    productSdk.changeProductVisible(true, payloadProduct, sort);
  }

  public manageProduct = (type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce, e: any) => {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    const { product, sort } = this.props;
    productSdk.manage({type, product, sort});
  }

  public onContentClick = () => {
    this.changePriceModal();
  }

  render () {
    const { product, sort } = this.props;
    const showManageDetailToken = 
      sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE ||
      sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_MANAGE;
    return (
      <View 
        className={classnames(`${cssPrefix}-border`, {
          [`${cssPrefix} `]: !showManageDetailToken,
          [`${cssPrefix}-manage`]: showManageDetailToken
        })}
      >
        <View 
          className={`${cssPrefix}-content`}
          onClick={this.onContentClick.bind(this)}
        >
          <View className={`${cssPrefix}-content-cover`} >
            {product.pictures && product.pictures !== '' ? (
              <Image src={product.pictures[0]} className={`${cssPrefix}-content-cover-image`} />
            ) : (
              <Image src="//net.huanmusic.com/weapp/img_nolist.png" className={`${cssPrefix}-content-cover-image`} />
            )}
          </View>
          {this.renderDetail()}
          {this.renderStepper()}
        </View>
      </View>
    );
  }

  private renderDetail = () => {
    const { product, sort } = this.props;

    const showManageDetailToken = 
      sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE ||
      sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_MANAGE;
    return (
      <View className={classnames(`${cssPrefix}-content-detail`)}>
        <View className={`${cssPrefix}-title`} >
          {product.name}
        </View>
        {showManageDetailToken
        ? (
          <View className={classnames(`${cssPrefix}-content-detail-box`)}>
            <Text className={`${cssPrefix}-manage-font`}>进价: ￥{product.cost}</Text>
            {sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE
            ? (
              <Text className={`${cssPrefix}-manage-font ${cssPrefix}-manage-font-theme`}>
                库存: {product.number}
              </Text>
            )
            : (
              <Text className={`${cssPrefix}-manage-font ${cssPrefix}-manage-font-theme`}>
                售价: ￥{product.price}
              </Text>
            )}
          </View>
        )
        : sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK
          ? (
            <Text className={`${cssPrefix}-normal`}>
              <Text className={`${cssPrefix}-manage-font ${cssPrefix}-manage-font-theme`}>{`库存：${product.number}${product.unit || '个'}`}</Text>
            </Text>
          )
          : (
            <Text className={`${cssPrefix}-normal`}>
              <Text className={`${cssPrefix}-price-bge`}>￥</Text>
              <Text className={`${cssPrefix}-price`}>{product.price}</Text>
              {` /${product.unit || '个'}`}
            </Text>
          )}
      </View>
    );
  }

  private renderStepper = () => {
    const { product, productInCart, sort } = this.props;

    if (sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_MANAGE) {
      return (
        <View className={`${cssPrefix}-manage-corner`}>
          <Text className={`${cssPrefix}-manage-font`}>库存: {product.number}{product.unit}</Text>
        </View>
      );
    }

    if (
      sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE ||
      sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK
    ) {
      return (
        <View className={`${cssPrefix}-stepper ${cssPrefix}-stepper-purchase`}>
          {productInCart !== undefined && (
            <Text>
            +{productInCart.sellNum}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View className={`${cssPrefix}-stepper`}>
        {productInCart !== undefined ? (
          <View className={`${cssPrefix}-stepper-container`}>    
            <View 
              className={classnames(`${cssPrefix}-stepper-button`, `${cssPrefix}-stepper-button-reduce`)}
              onClick={this.manageProduct.bind(this, productSdk.productCartManageType.REDUCE)}
            />
            <Text className={`${cssPrefix}-stepper-text`}>{productInCart.sellNum}</Text>
            <View 
              className={classnames(`${cssPrefix}-stepper-button`, `${cssPrefix}-stepper-button-add`)}
              onClick={this.manageProduct.bind(this, productSdk.productCartManageType.ADD)}
            />  
          </View>
        ) : (
          <View className={`${cssPrefix}-stepper-container`}>            
            <View 
              className={classnames(`${cssPrefix}-stepper-button`, `${cssPrefix}-stepper-button-add`)}
              onClick={this.manageProduct.bind(this, productSdk.productCartManageType.ADD)}
            />  
          </View>
        )}
      </View>
    );
  }
}

const select = (state: AppReducer.AppState, ownProps: Props) => {
  const { product, sort } = ownProps;
  const productKey = productSdk.getSortDataKey(sort);
  const productList = state.productSDK[productKey];
  const productInCart = product !== undefined && productList.find(p => p.id === product.id);
  return {
    product,
    productInCart,
  };
};

export default connect(select)(ProductComponent as any);