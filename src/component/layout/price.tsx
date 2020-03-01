import Taro from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import '../product/product.less'
import numeral from 'numeral'

const cssPrefix = 'component-product';

type Props = {
  price: any;
}

class PriceComponent extends Taro.Component<Props> {
  render () {
    const price = this.props.price ? numeral(this.props.price).format('0.00') : '0.00';
    return (
      <View className={`${cssPrefix}-normal`}>
        <Text className={`${cssPrefix}-price-bge`}>￥</Text>
        <Text className={`${cssPrefix}-price`}>{price.split('.')[0]}</Text>
        <Text className={`${cssPrefix}-price-bge ${cssPrefix}-price-pos`}>{`.${price.split('.')[1]}`}</Text>
        <Text className={`${cssPrefix}-price-origin`}>{price}</Text>
      </View>
    );
  }
}

export default PriceComponent;