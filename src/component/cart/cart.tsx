import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import "./cart.less";
import { AtFloatLayout } from 'taro-ui';

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
    return (
      <View>
        <AtFloatLayout 
          isOpened={this.state.cartListVisible}
          onClose={() => this.onChangeCartListVisible(false)}
        >
          content
        </AtFloatLayout>

        <View className="cart">
          <View onClick={() => this.onChangeCartListVisible()}>
            icon
          </View>
        </View>
      </View>
    );
  }
}

export default CartBar;