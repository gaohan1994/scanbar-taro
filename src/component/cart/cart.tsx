/**
 * @Author: Ghan 
 * @Date: 2019-11-05 15:10:38 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-06 15:22:12
 * 
 * @todo [购物车组件]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "./cart.less";
import "../product/product.less";
import classnames from 'classnames';
import { AppReducer } from '../../reducers';
import { 
  getProductCartList, 
  getChangeWeigthProduct, 
  getSuspensionCartList, 
  ProductSDKReducer, 
  getNonBarcodeProduct,
} from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import Modal from '../modal/modal';
import FormCard from '../card/form.card';
import { FormRowProps } from '../card/form.row';
import { ProductInterface } from '../../constants';
import numeral from 'numeral';
import merge from 'lodash.merge';
import invariant from 'invariant';
import CartLayout from './cart.layout';
import Badge from '../badge/badge';

const cssPrefix = 'cart';

interface CartBarProps { 
  productCartList: Array<ProductCartInterface.ProductCartInfo>;
  changeWeightProduct: ProductCartInterface.ProductCartInfo | ProductInterface.ProductInfo;
  suspensionCartList: Array<ProductSDKReducer.SuspensionCartBase>;
  nonBarcodeProduct: Partial<ProductCartInterface.ProductCartInfo | ProductInterface.ProductInfo>;
}

interface CartBarState { 
  cartListVisible: boolean;         // 是否显示购物车列表
  weightProductSellNum: string;     // 称重商品的重量
  weightProductChangePrice: string; // 称重商品改价
  nonBarcodePrice: string;          // 无码商品价格
  nonBarcodeRemark: string;         // 无码商品备注
}

class CartBar extends Taro.Component<CartBarProps, CartBarState> {

  readonly state: CartBarState = {
    cartListVisible: false,
    weightProductSellNum: '',
    weightProductChangePrice: '',
    nonBarcodePrice: '',
    nonBarcodeRemark: '',
  };

  componentWillReceiveProps (nextProps: CartBarProps) {
    /**
     * @todo 如果是称重商品则把价格提前赋值
     */
    if (nextProps.changeWeightProduct && nextProps.changeWeightProduct.id) {
      this.setState({ 
        weightProductChangePrice: `${nextProps.changeWeightProduct.price}`,
      });
    }
  }

  /**
   * @todo [修改购物车列表显示]
   *
   * @memberof CartBar
   */
  public onChangeCartListVisible = (visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        cartListVisible: typeof visible === 'boolean' ? visible : !prevState.cartListVisible
      };
    });
  }

  public onChangeValue = (key: string, value: string) => {
    this.setState(prevState => {
      return {
        ...prevState,
        [key]: value
      };
    });
  }

  public manageProduct = (
    type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce, 
    product: ProductCartInterface.ProductCartInfo
  ) => {
    if (type === productSdk.productCartManageType.ADD && productSdk.isNonBarcodeProduct(product)) {
      productSdk.add(product);
      return;
    }
    productSdk.manage({type, product});
  }

  public onSuspensionCart = () => {
    const { productCartList } = this.props;
    if (productCartList.length > 0) {
      productSdk.suspensionCart();
    } else {
      Taro.navigateTo({
        url: `/pages/product/product.suspension`
      });
    }
  }

  public onPayHandle = () => {
    const { productCartList } = this.props;
    if (productCartList.length > 0) {
      Taro.navigateTo({
        url: `/pages/product/product.pay`
      });
    } else {
      Taro.showToast({
        title: '请选择要结算的商品',
        icon: 'none'
      });
    }
    this.onChangeCartListVisible(false);
  }

  public emptyCart = () => {
    const { productCartList } = this.props;
    if (productCartList.length > 0) {
      Taro.showModal({
        title: '提示',
        content: '确定清空购物车吗?',
        success: (res) => {
          if (res.confirm) {
            productSdk.manage({type: productSdk.productCartManageType.EMPTY, product: {} as any});
            this.onChangeCartListVisible(false);
          }
        }
      });
    }
  }

  render () {
    const { productCartList, suspensionCartList } = this.props;
    const buttonClassNames = classnames(
      'cart-right',
      {
        'cart-right-active': productCartList.length > 0,
        'cart-right-disabled': productCartList.length === 0,
      }
    );

    return (
      <View>
        {this.renderContent()}
        {this.renderWeightProductModal()}
        {this.renderNonBarcodeProductModal()}
        <View className="cart">
          <View className="cart-bg">
            <View className="cart-icon" onClick={() => this.onChangeCartListVisible()} >
              {
                productCartList.length > 0 ? (
                  <Badge 
                    value={productSdk.getProductNumber()}
                    className="component-cart-bge"
                  >
                    <Image src="//net.huanmusic.com/weapp/icon_cart(1).png" className="cart-icon-image" />
                  </Badge>
                ) : (
                  <Image src="//net.huanmusic.com/weapp/icon_cart_unselected.png" className="cart-icon-image" />
                )
              }
            </View>
            <View className="cart-left">
              <View 
                className={classnames(`${cssPrefix}-left-price`, {
                  [`${cssPrefix}-left-price-active`]: productCartList.length > 0,
                  [`${cssPrefix}-left-price-disabled`]: productCartList.length === 0,
                })}
              >
                ￥{numeral(productSdk.getProductPrice()).format('0.00')}
              </View>
                
              {
                suspensionCartList.length > 0 ? (
                  <Badge value={suspensionCartList.length}>
                    <View 
                      className={classnames(`${cssPrefix}-left-suspension`, {
                        [`${cssPrefix}-left-suspension-active`]: productCartList.length > 0,
                        [`${cssPrefix}-left-suspension-disabled`]: productCartList.length === 0,
                      })}
                      onClick={() => this.onSuspensionCart()}
                    >
                      挂单
                    </View>
                  </Badge>
                ) : (
                  <View 
                    className={classnames(`${cssPrefix}-left-suspension`, {
                      [`${cssPrefix}-left-suspension-active`]: productCartList.length > 0,
                      [`${cssPrefix}-left-suspension-disabled`]: productCartList.length === 0,
                    })}
                    // onClick={() => this.onSuspensionCart()}
                  >
                    挂单
                  </View>
                )
              }
            </View>
            <View 
              className={buttonClassNames}
              onClick={() => this.onPayHandle()}
            >
              结算
            </View>
          </View>
        </View>
      </View>
    );
  }

  private renderContent = () => {
    const { cartListVisible } = this.state;
    const { productCartList } = this.props;
    return (
      <CartLayout
        isOpened={cartListVisible}
        title={`已选择商品（${productSdk.getProductNumber() || 0}）`}
        titleRight={'清空购物车'}
        titleRightIcon="//net.huanmusic.com/weapp/icon_empty.png"
        titleRightClick={() => this.emptyCart()}
        onClose={() => this.onChangeCartListVisible(false)}
      >
        {
          productCartList.length > 0 && productCartList.map((product) => {
            return (
              <View key={product.id} >
                <View className={`${cssPrefix}-product ${cssPrefix}-product-border`}>
                  <View className={`${cssPrefix}-product-container `}>
                    <Text className={`${cssPrefix}-product-container-name`}>
                      {product.name}{product.remark && `（${product.remark}）`}
                    </Text>
                    <Text className={`${cssPrefix}-product-container-normal`}>
                      <Text className={`${cssPrefix}-product-container-price`}>{`￥ ${product.price}`}</Text>
                      / {product.unit}
                    </Text>
                    <View className={`${cssPrefix}-product-stepper`}>      
                      <View 
                        className={classnames(`component-product-stepper-button`, `component-product-stepper-button-reduce`)}
                        onClick={() => this.manageProduct(productSdk.productCartManageType.REDUCE, product)}
                      />
                      <Text className={`component-product-stepper-text`}>{product.sellNum}</Text>
                      <View 
                        className={classnames(`component-product-stepper-button`, `component-product-stepper-button-add`)}
                        onClick={() => this.manageProduct(productSdk.productCartManageType.ADD, product)}
                      />  
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        }
      </CartLayout>
    );
  }

  private onWeightProductConfirm = () => {
    try {
      const { weightProductSellNum, weightProductChangePrice } = this.state;
      const { changeWeightProduct } = this.props;
      const weightSellNum = numeral(weightProductSellNum).value();
      if (weightProductSellNum === '') {
        throw new Error('请输入商品重量');
      }
      if (weightSellNum > 0) {
        let weightCartProduct: ProductCartInterface.ProductCartInfo = merge({}, changeWeightProduct) as any;

        /**
         * @todo 如果商品改价格了 则把改的价格存到redux
         */
        if (weightProductChangePrice !== '' && numeral(weightProductChangePrice).value() !== weightCartProduct.price) {
          weightCartProduct.changePrice = numeral(weightProductChangePrice).value();
        }
        productSdk.add(weightCartProduct, weightSellNum);
        this.setState({
          weightProductSellNum: '',
          weightProductChangePrice: ''
        });
        this.onWeightProductClose();
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none',
      });
    }
  }

  private onNonBarcodeConfirm = () => {
    try {
      const { nonBarcodePrice, nonBarcodeRemark } = this.state;
      const { nonBarcodeProduct } = this.props;
      invariant(nonBarcodePrice !== '', '请输入商品价格');
      invariant(numeral(nonBarcodePrice).value() > 0, '商品价格必须大于0');
      let nonBarcodeCartProduct: Partial<ProductCartInterface.ProductCartInfo> = {
        ...nonBarcodeProduct,
        name: '无码商品',
        price: numeral(nonBarcodePrice).value(),
        memberPrice: numeral(nonBarcodePrice).value(),
        unitPrice: numeral(nonBarcodePrice).value(),
        sellNum: 1,
      };
      if (nonBarcodeRemark !== '') {
        nonBarcodeCartProduct.remark = nonBarcodeRemark;
      }
      productSdk.add(nonBarcodeCartProduct as any);

      this.setState({
        nonBarcodePrice: '',
        nonBarcodeRemark: '',
      });
      productSdk.closeNonBarcodeModal();
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  private onNonBarcodeClose = () => {
    productSdk.closeNonBarcodeModal();
  }

  private renderNonBarcodeProductModal = () => {
    const { nonBarcodePrice, nonBarcodeRemark } = this.state;
    const { nonBarcodeProduct } = this.props;
    const nonBarcodeForm: FormRowProps[] = [
      {
        title: '价格（￥）',
        main: true,
        isInput: true,
        inputType: 'digit',
        inputValue: nonBarcodePrice,
        inputOnChange: (value) => this.onChangeValue('nonBarcodePrice', value),
        inputPlaceHolder: '请输入商品价格'
      },
      {
        title: `备注`,
        isInput: true,
        hasBorder: false,
        inputValue: nonBarcodeRemark,
        inputOnChange: (value) => this.onChangeValue('nonBarcodeRemark', value),
        inputPlaceHolder: '请输入备注信息'
      }
    ];
    const buttons = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => this.onNonBarcodeClose()
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.onNonBarcodeConfirm(),
      },
    ];
    const isOpen = nonBarcodeProduct !== undefined && typeof nonBarcodeProduct.id === 'string';
    return (
      <Modal 
        isOpened={isOpen}
        header={'无码商品'}
        onClose={() => this.onNonBarcodeClose()}
        buttons={buttons}
      >
        <View className="test-modal-form">
          <FormCard items={nonBarcodeForm} />
        </View>
      </Modal>
    );
  }

  private onWeightProductClose = () => {
    productSdk.closeWeightModal();
  }

  private renderWeightProductModal = () => {
    const { weightProductSellNum, weightProductChangePrice } = this.state;
    const { changeWeightProduct } = this.props;
    const weightForm: FormRowProps[] = [
      {
        title: '重量',
        isInput: true,
        inputType: 'digit',
        inputValue: weightProductSellNum,
        inputOnChange: (value) => this.onChangeValue('weightProductSellNum', value),
        inputPlaceHolder: '请输入重量'
      },
      {
        title: '价格（￥）',
        isInput: true,
        inputValue: weightProductChangePrice,
        inputType: 'digit',
        inputOnChange: (value) => this.onChangeValue('weightProductChangePrice', value),
        hasBorder: false
      }
    ];
    const weightButtons = [
      {
        title: '取消',
        type: 'cancel',
        onPress: () => this.onWeightProductClose()
      },
      {
        title: '确定',
        type: 'confirm',
        onPress: () => this.onWeightProductConfirm()
      },
    ];
    const isOpen = changeWeightProduct && typeof changeWeightProduct.id === 'number' && changeWeightProduct.id !== -1;
    return (
      <Modal 
        isOpened={isOpen}
        header={changeWeightProduct.name}
        onClose={() => this.onWeightProductClose()}
        buttons={weightButtons}
      >
        <View className="test-modal-form">
          <FormCard items={weightForm} />
        </View>
      </Modal>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  productCartList: getProductCartList(state),
  changeWeightProduct: getChangeWeigthProduct(state),
  suspensionCartList: getSuspensionCartList(state),
  nonBarcodeProduct: getNonBarcodeProduct(state),
});

const selectDispatch = dispatch => ({
  dispatch,
});

export default connect(select, selectDispatch)(CartBar as any);