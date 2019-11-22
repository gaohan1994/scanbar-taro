/**
 * @Author: Ghan 
 * @Date: 2019-11-05 15:10:38 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-22 17:07:15
 * 
 * @todo [购物车组件]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "./cart.less";
import { AtFloatLayout } from 'taro-ui';
import classnames from 'classnames';
import { AppReducer } from '../../reducers';
import { getProductCartList, getChangeWeigthProduct } from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import Modal from '../modal/modal';
import FormCard from '../card/form.card';
import { FormRowProps } from '../card/form.row';
import { ProductInterface } from '../../constants';
import { store } from '../../app';

interface CartBarProps { 
  productCartList: Array<ProductCartInterface.ProductCartInfo>;
  changeWeightProduct: ProductCartInterface.ProductCartInfo | ProductInterface.ProductInfo;
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

  render () {
    const buttonClassNames = classnames(
      'cart-right',
      {
        'cart-right-active': true,
        'cart-right-disabled': false,
      }
    );

    return (
      <View>
        {this.renderContent()}
        {this.renderWeightProductModal()}
        <View className="cart">
          <View className="cart-bg">
            <View className="cart-icon" onClick={() => this.onChangeCartListVisible()} >
              <Image src="//net.huanmusic.com/weapp/icon_cart(1).png" className="cart-icon-image" />
            </View>
            <View className="cart-left">
              left
            </View>
            <View className={buttonClassNames}>
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
          <View>已选择商品（3）</View>
          <View className="cart-list-header-empty">
            <Image src="//net.huanmusic.com/weapp/icon_empty.png" className="cart-list-header-empty-icon" />
            <Text>清空购物车</Text>
          </View>
        </View>
        {
          productCartList.length > 0 && productCartList.map((item) => {
            return (
              <View key={item.id}>
                {item.name}
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
});

export default connect(select)(CartBar as any);