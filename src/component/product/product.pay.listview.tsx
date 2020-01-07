import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import "../card/form.card.less";
import "../../pages/style/product.less";
import '../../styles/theme.less';
import "../cart/cart.less";
import classnames from 'classnames';
import numeral from 'numeral';
import { SelectMember } from '../../pages/product/product.pay';

const cssPrefix = 'product';

type Props = { 
  productList: Array<ProductCartInterface.ProductCartInfo>;
  selectMember?: SelectMember;
};

class ProductPayListView extends Taro.Component<Props> {
  render () {
    const { productList } = this.props;
    return (
      <View className={`${cssPrefix}-pay-pos`}>
        <View 
          className={classnames('component-form', {
            'component-form-shadow': true
          })}
        >
          <View className={`${cssPrefix}-row ${cssPrefix}-row-border`}>
            <Text className={`${cssPrefix}-row-normal`}>商品详情</Text>
          </View>
          {
            productList && productList.length > 0 && productList.map((item, index) => {
              return (
                <View 
                  key={item.id}
                  className={classnames(`${cssPrefix}-row ${cssPrefix}-row-content`, {
                    [`container-border`]: index !== (productList.length - 1)
                  })}
                >
                  <View className={`${cssPrefix}-row-content-item`}>
                    <Text className={`${cssPrefix}-row-name`}>{item.name}</Text>
                    <Text className={`${cssPrefix}-row-normal`}>{`x ${item.sellNum}`}</Text>
                  </View>
                  {this.renderProductDetail(item)}
                </View>
              );
            })
          }
        </View>
        <View style="height: 100px; width: 100%" />
      </View>
    );
  }

  private setNumber = (num: number | string): string => {
    return numeral(num).format('0.00');
  }

  private renderProductDetail = (item: ProductCartInterface.ProductCartInfo) => {
    const { selectMember } = this.props;
    // 如果称重商品有改价 则优先计算改价，如果没有优先计算会员价
    const itemPrice: number = item.changePrice !== undefined
      ? numeral(item.changePrice).value()
      : selectMember !== undefined 
        ? item.memberPrice
        : item.price;
    return (
      <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}>
        {item.changePrice !== undefined ? (
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>{`￥ ${this.setNumber(item.price)}`}</Text>
            <View className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}>改价</View>
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${numeral(item.changePrice).format('0.00')}`}</Text>
          </View>
        ) : selectMember !== undefined ? (
          <View className={`${cssPrefix}-row-content-items`}>
            <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>{`￥ ${this.setNumber(item.price)}`}</Text>
            <View className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-member`}>会员价</View>
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${this.setNumber(item.memberPrice)}`}</Text>
          </View>
        ) : (
          <Text className={`${cssPrefix}-row-normal`}>{`￥ ${this.setNumber(item.price)}`}</Text>
        )}
        <Text className={`${cssPrefix}-row-normal`}>
          {`小计：￥ ${this.setNumber(itemPrice * item.sellNum)}`}
        </Text>
      </View>
    );
  }
}

export default ProductPayListView;