/**
 * @Author: Ghan 
 * @Date: 2019-11-05 15:10:38 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-05 15:59:06
 * 
 * @todo [购物车组件]
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "./cart.less";
import { AtFloatLayout } from 'taro-ui';
import classnames from 'classnames';

interface CartBarProps { }

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
        <AtFloatLayout
          isOpened={this.state.cartListVisible}
          onClose={() => this.onChangeCartListVisible(false)}
        >
          <View className="cart-list-header">
            <View>已选择商品（3）</View>
            <View className="cart-list-header-empty">
              <Image src="//net.huanmusic.com/weapp/icon_empty.png" className="cart-list-header-empty-icon" />
              <Text>清空购物车</Text>
            </View>
          </View>
          content
        </AtFloatLayout>

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
}

export default CartBar;