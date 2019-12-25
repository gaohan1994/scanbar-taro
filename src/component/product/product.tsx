import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './product.less';
import { ProductInterface } from '../../constants';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getProductCartList } from '../../common/sdk/product/product.sdk.reducer';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import classnames from 'classnames';
import Modal from '../modal/modal';
import { FormRowProps } from '../card/form.row';
import FormCard from '../card/form.card';

const cssPrefix = 'component-product';
interface Props { 
  product: ProductInterface.ProductInfo;
  productInCart?: ProductCartInterface.ProductCartInfo;
}

interface State {
  priceModal: boolean;
}

class ProductComponent extends Taro.Component<Props, State> {

  /**
   * @todo [新增商品点击改价]
   *
   * @memberof ProductComponent
   */
  public onProductPress = () => {
    this.changePriceModal(true);
  }

  public changePriceModal = (visible: boolean) => {
    this.setState({priceModal: visible});
  }

  public manageProduct = (type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce) => {
    const { product } = this.props;
    productSdk.manage({type, product});
  }

  render () {
    const { product } = this.props;
    return (
      <View className={`${cssPrefix} ${cssPrefix}-border`}>
        <View 
          className={`${cssPrefix}-content`}
          // onClick={() => this.onProductPress()}
        >
          <View className={`${cssPrefix}-content-cover`}>
            {product.pictures && product.pictures !== '' ? (
              <Image src={product.pictures[0]} className={`${cssPrefix}-content-cover-image`} />
            ) : (
              <Image src="//net.huanmusic.com/weapp/img_nolist.png" className={`${cssPrefix}-content-cover-image`} />
            )}
          </View>
          <View className={`${cssPrefix}-content-detail`}>
            <View className={`${cssPrefix}-title`}>{product.name}</View>
            <Text className={`${cssPrefix}-normal`}>
              <Text className={`${cssPrefix}-price-bge`}>￥</Text>
              <Text className={`${cssPrefix}-price`}>{product.price}</Text>
              {` /${product.unit}`}
            </Text>
          </View>
          {this.renderStepper()}
        </View>
        {this.renderModal()}
      </View>
    );
  }

  private renderModal = () => {
    const { priceModal } = this.state;
    // const { product, productInCart } = this.props;
    const priceForm: FormRowProps[] = [
      {
        title: '数量',
        isInput: true,
        // inputValue: 
      },
    ];
    return (
      <Modal
        isOpened={priceModal}
        onClose={() => this.changePriceModal(false)}
      >
        <FormCard items={priceForm} />
      </Modal>
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
  const { product } = ownProps;
  const productCartList = getProductCartList(state);
  const productInCart = product !== undefined && productCartList.find(p => p.id === product.id);
  return {
    product,
    productInCart,
  };
};

export default connect(select)(ProductComponent as any);