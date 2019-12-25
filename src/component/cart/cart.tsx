/**
 * @Author: Ghan 
 * @Date: 2019-11-05 15:10:38 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-25 15:35:04
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
  getNonBarcodeProduct,
} from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import Modal from '../modal/modal';
import { ProductInterface, ProductService } from '../../constants';
import numeral from 'numeral';
import merge from 'lodash.merge';
import invariant from 'invariant';
import CartLayout from './cart.layout';
import Badge from '../badge/badge';
import { ResponseCode } from '../../constants/index';
import { ModalInput } from '../modal/modal';

const cssPrefix = 'cart';

interface CartBarProps { 
  productCartList: Array<ProductCartInterface.ProductCartInfo>;
  changeWeightProduct: ProductCartInterface.ProductCartInfo | ProductInterface.ProductInfo;
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

  public onScanProduct = () => {
    try {
      /**
       * @todo [先去自己的库里查询商品看是否存在，如果存在则加入购物车]
       * @todo [如果不存在，则去第三方库里查询商品，如果存在则提示是否建档]
       * @todo [如果第三方库里也不存在则提示没有找到该商品]
       */
      Taro
      .scanCode()
      .then(async (res) => {
        Taro.showLoading();
        const result = await ProductService.productInfoScanGet({barcode: res.result});
        if (result.code === ResponseCode.success) {
          Taro.hideLoading();
          // 找到了商品 显示modal名称
          Taro.showToast({
            title: `${result.data.name}`,
            icon: 'none',
          });
          productSdk.manage({
            type: productSdk.productCartManageType.ADD,
            product: result.data
          });
          return;
        }
        // 说明没找到
        const thirdProductResult = await ProductService.productInfoScan({barcode: res.result});
        Taro.hideLoading();
        if (thirdProductResult.code === ResponseCode.success) {
          Taro.showModal({
            title: '提示',
            content: `商品${thirdProductResult.data.barcode}不存在，是否现在建档？`,
            success: ({confirm}) => {
              if (confirm) {
                const params = {
                  scanProduct: thirdProductResult.data,
                  needCallback: true
                };
                Taro.navigateTo({
                  url: `/pages/product/product.add?params=${JSON.stringify(params)}`
                });
              }
            }
          });
          return;
        }
        throw new Error(thirdProductResult.msg || '没有找到该商品');
      })
      .catch(error => {
        Taro.showToast({title: error.message, icon: 'none'});
      });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { productCartList } = this.props;
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
            {this.renderScan()}
            {
              productCartList.length > 0 
              ? (
                <View 
                  className="cart-icon"
                  onClick={() => this.onChangeCartListVisible()}
                >
                  <Badge 
                    value={productSdk.getProductNumber()}
                    className="component-cart-bge"
                  >
                    <Image src="//net.huanmusic.com/weapp/icon_cart(1).png" className="cart-icon-image" />
                  </Badge>
                </View>
              )
              : (
                <Image 
                  src="//net.huanmusic.com/weapp/icon_cart_unselected.png" 
                  className="cart-icon-image cart-icon" 
                  onClick={() => this.onChangeCartListVisible()}
                />
              )
            }
            <View className="cart-left">
              <View 
                className={classnames(`${cssPrefix}-left-price`, {
                  [`${cssPrefix}-left-price-active`]: productCartList.length > 0,
                  [`${cssPrefix}-left-price-disabled`]: productCartList.length === 0,
                })}
              >
                ￥{numeral(productSdk.getProductPrice()).format('0.00')}
              </View>
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

  private renderScan = () => {
    return (
      <View 
        className={`${cssPrefix}-scan`}
        onClick={() => this.onScanProduct()}
      >
        <Image src="//net.huanmusic.com/weapp/icon_scan.png" className={`${cssPrefix}-scan-image`} />
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
        <View style="height: 50px; width: 100%" />
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
    const nonBarcodeInputs: ModalInput[] = [
      {
        title: '价格',
        main: true,
        value: nonBarcodePrice,
        onInput: ({detail: {value}}) => this.onChangeValue('nonBarcodePrice', value),
        placeholder: '请输入商品价格',
        // focus: true,
      },
      {
        title: '备注',
        value: nonBarcodeRemark,
        onInput: ({detail: {value}}) => this.onChangeValue('nonBarcodeRemark', value),
        placeholder: '请输入备注信息',
      },
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
        inputs={nonBarcodeInputs}
      />
    );
  }

  private onWeightProductClose = () => {
    productSdk.closeWeightModal();
  }

  private renderWeightProductModal = () => {
    const { weightProductSellNum, weightProductChangePrice } = this.state;
    const { changeWeightProduct } = this.props;
    const weightInputs: ModalInput[] = [
      {
        title: '重量',
        type: 'digit',
        // focus: true,
        main: true,
        value: weightProductSellNum,
        onInput: ({detail: {value}}) => this.onChangeValue('weightProductSellNum', value),
        placeholder: '请输入重量',
      },
      {
        title: '价格',
        main: true,
        value: weightProductChangePrice,
        onInput: ({detail: {value}}) => this.onChangeValue('weightProductChangePrice', value),
        placeholder: '请输入商品价格',
      },
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
        inputs={weightInputs}
        buttons={weightButtons}
      />
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  productCartList: getProductCartList(state),
  changeWeightProduct: getChangeWeigthProduct(state),
  nonBarcodeProduct: getNonBarcodeProduct(state),
});

export default connect(select)(CartBar as any);