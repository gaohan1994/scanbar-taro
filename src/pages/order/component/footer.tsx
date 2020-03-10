import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import './index.less';
import numeral from 'numeral';
import { CartItem } from '../order.refund';

const prefix = 'component-order-product';

type Props = {
  cartList: CartItem[];
  onClick: any;
};

class OrderFooter extends Taro.Component<Props> {

  render () {
    const { cartList = [], onClick } = this.props;
    let priceNumber = 0;
    cartList.map((item) => {
      priceNumber += numeral(item.sellNum).value() * numeral(item.changePrice || item.unitPrice).value();
    });

    const price = numeral(priceNumber).format('0.00');

    return (
      <View className={`${prefix}-footer`}>
        <View className={`${prefix}-footer-normal`}>
          <Text className={`${prefix}-footer-bge`}>￥</Text>
          <Text className={`${prefix}-footer-price`}>{price.split('.')[0]}</Text>
          <Text className={`${prefix}-price-bge ${prefix}-price-pos`}>{`.${price.split('.')[1]}`}</Text>
        </View>
        <View 
          className={`${prefix}-footer-button`}
          onClick={onClick}
        >
          退货退款
        </View>
      </View>
    );
  }
}

export default OrderFooter;