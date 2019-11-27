/**
 * @Author: Ghan 
 * @Date: 2019-11-05 15:10:38 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-26 14:30:05
 * 
 * @todo [购物车组件]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "./cart.less";
import "../product/product.less";
import { AtFloatLayout, AtBadge } from 'taro-ui';
import classnames from 'classnames';
import { AppReducer } from '../../reducers';
import { getProductCartList, getChangeWeigthProduct, getSuspensionCartList, ProductSDKReducer } from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import Modal from '../modal/modal';
import FormCard from '../card/form.card';
import { FormRowProps } from '../card/form.row';
import { ProductInterface } from '../../constants';
import numeral from 'numeral';

const cssPrefix = 'cart';

interface CartBarProps { 
  productCartList: Array<ProductCartInterface.ProductCartInfo>;
  changeWeightProduct: ProductCartInterface.ProductCartInfo | ProductInterface.ProductInfo;
  suspensionCartList: Array<ProductSDKReducer.SuspensionCartBase>;
}

interface CartBarState { 
  cartListVisible: boolean; // 是否显示购物车列表
}

class CartBar extends Taro.Component<CartBarProps, CartBarState> {

  readonly state: CartBarState = {
    cartListVisible: false
  };

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

  public manageProduct = (
    type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce, 
    product: ProductCartInterface.ProductCartInfo
  ) => {
    console.log('product: ', product);
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
  }

  public emptyCart = () => {
    const { productCartList } = this.props;
    if (productCartList.length > 0) {
      Taro.showModal({
        title: '提示',
        content: '确定清空购物车嘛?',
        success: () => productSdk.manage({type: productSdk.productCartManageType.EMPTY, product: {} as any})
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
        <View className="cart">
          <View className="cart-bg">
            <View className="cart-icon" onClick={() => this.onChangeCartListVisible()} >
              {
                productCartList.length > 0 ? (
                  <AtBadge 
                    value={productSdk.getProductNumber()}
                    className="component-cart-bge"
                  >
                    <Image src="//net.huanmusic.com/weapp/icon_cart(1).png" className="cart-icon-image" />
                  </AtBadge>
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
                  <AtBadge value={suspensionCartList.length}>
                    <View 
                      className={classnames(`${cssPrefix}-left-suspension`, {
                        [`${cssPrefix}-left-suspension-active`]: productCartList.length > 0,
                        [`${cssPrefix}-left-suspension-disabled`]: productCartList.length === 0,
                      })}
                      onClick={() => this.onSuspensionCart()}
                    >
                      挂单
                    </View>
                  </AtBadge>
                ) : (
                  <View 
                    className={classnames(`${cssPrefix}-left-suspension`, {
                      [`${cssPrefix}-left-suspension-active`]: productCartList.length > 0,
                      [`${cssPrefix}-left-suspension-disabled`]: productCartList.length === 0,
                    })}
                    onClick={() => this.onSuspensionCart()}
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
      <AtFloatLayout
        isOpened={cartListVisible}
        onClose={() => this.onChangeCartListVisible(false)}
      >
        <View className="cart-list-header">
          <View>已选择商品（{productSdk.getProductNumber() || 0}）</View>
          <View 
            className="cart-list-header-empty"
            onClick={() => this.emptyCart()}
          >
            <Image src="//net.huanmusic.com/weapp/icon_empty.png" className="cart-list-header-empty-icon" />
            <Text>清空购物车</Text>
          </View>
        </View>
        {
          productCartList.length > 0 && productCartList.map((product) => {
            return (
              <View key={product.id} >
                <View className={`${cssPrefix}-product`}>
                  <View className={`${cssPrefix}-product-container`}>
                    <Text className={`${cssPrefix}-product-container-name`}>{product.name}</Text>
                    <Text className={`${cssPrefix}-product-container-normal`}>
                      <Text className={`${cssPrefix}-product-container-price`}>{product.price}</Text>
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
      </AtFloatLayout>
    );
  }

  private onWeightProductClose = () => {
    productSdk.closeWeightModal();
  }

  private renderWeightProductModal = () => {
    const { changeWeightProduct } = this.props;
    const weightForm: FormRowProps[] = [
      {
        title: '重量',
        isInput: true,
        inputPlaceHolder: '请输入重量'
      },
      {
        title: `原价￥${changeWeightProduct.price}`,
        isInput: true,
        inputPlaceHolder: '修改价格'
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
        onPress: () => this.onWeightProductClose()
      },
    ];
    const isOpen = typeof changeWeightProduct.id === 'number' && changeWeightProduct.id !== -1;
    return (
      <Modal 
        isOpened={isOpen}
        header="库存调整"
        onClose={() => this.onWeightProductClose()}
        buttons={weightButtons}
      >
        <View className="test-modal-form">
          <View>上好佳芒果味硬糖</View>
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
});

export default connect(select)(CartBar as any);