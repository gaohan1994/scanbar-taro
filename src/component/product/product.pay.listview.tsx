import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import "../card/form.card.less";
import "../../pages/style/product.less";
import '../../styles/theme.less';
import "../cart/cart.less";
import classnames from 'classnames';
import numeral from 'numeral';
import { SelectMember } from '../../pages/product/product.pay';
import { InventoryInterface } from '../../constants';
import { isInventoryProduct } from '../../constants/inventory/inventory';

const cssPrefix = 'product';

type Props = { 
  productList: Array<ProductCartInterface.ProductCartInfo | InventoryInterface.InventoryProductDetail>;
  selectMember?: SelectMember;
  className?: string;
  padding?: boolean;
  sort?: string;
};

class ProductPayListView extends Taro.Component<Props> {

  static options = {
    addGlobalClass: true
  };

  static defaultProps = {
    padding: true,
    sort: productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER
  };

  render () {
    const { productList, className, padding, sort } = this.props;
    return (
      <View 
        className={classnames(className, {
          [`${cssPrefix}-pay-pos`]: padding
        })}
      >
        <View 
          className={classnames('component-form', {
            'component-form-shadow': true
          })}
        >
          <View className={`${cssPrefix}-row ${cssPrefix}-row-border`}>
            <Text className={`${cssPrefix}-row-normal-title`}>商品详情</Text>
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
                  {isInventoryProduct(item) ? (
                    <View className={`${cssPrefix}-row-stock`}>
                      <Text className={`${cssPrefix}-row-name`}>{item.productName}</Text>
                      <View className={`${cssPrefix}-row-stock-item ${cssPrefix}-row-stock-mar`}>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          系统数量：
                          <Text className={`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base`}>
                            {item.originNumber}
                          </Text>
                        </View>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          盈亏数量：
                          <Text 
                            className={classnames(`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base`, `${cssPrefix}-row-bold`, {
                              [`${cssPrefix}-row-stock-item-red`]: item.cost < 0
                            })}
                          >
                            {item.number}
                          </Text>
                        </View>
                      </View>
                      <View className={`${cssPrefix}-row-stock-item`}>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          盘点数量：
                          <Text className={`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base`}>
                            {item.changedNumber}
                          </Text>
                        </View>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          盈亏金额：
                          <Text 
                            className={classnames(`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base ${cssPrefix}-row-stock-item-bold`, 
                              `${cssPrefix}-row-bold`, {
                              [`${cssPrefix}-row-stock-item-red`]: item.cost < 0
                            })}
                          >
                            {`${item.cost < 0 ? '-' : ''}￥${numeral(Math.abs(item.cost)).format('0.00')}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : sort !== productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK ? (
                    <View>
                      <View className={`${cssPrefix}-row-content-item`}>
                        <Text className={`${cssPrefix}-row-name`}>{item.name}</Text>
                        <Text className={`${cssPrefix}-row-normal`}>{`x ${item.sellNum}`}</Text>
                      </View>
                      {this.renderProductDetail(item)}
                    </View>
                  ) : (
                    <View className={`${cssPrefix}-row-stock`}>
                      <Text className={`${cssPrefix}-row-name`}>{item.name}</Text>
                      <View className={`${cssPrefix}-row-stock-item ${cssPrefix}-row-stock-mar`}>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          系统数量：
                          <Text className={`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base`}>
                            {item.number}
                          </Text>
                        </View>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          盈亏数量：
                          <Text 
                            className={classnames(`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base`, `${cssPrefix}-row-bold`, {
                              [`${cssPrefix}-row-stock-item-red`]: item.sellNum - item.number < 0
                            })}
                          >
                            {item.sellNum - item.number}
                          </Text>
                        </View>
                      </View>
                      <View className={`${cssPrefix}-row-stock-item`}>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          盘点数量：
                          <Text className={`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base`}>
                            {item.sellNum}
                          </Text>
                        </View>
                        <View className={`${cssPrefix}-row-stock-item-detail ${cssPrefix}-row-stock-item-name`}>
                          盈亏金额：
                          <Text 
                            className={classnames(`${cssPrefix}-row-stock-item-value ${cssPrefix}-row-stock-item-base ${cssPrefix}-row-stock-item-bold`, 
                            `${cssPrefix}-row-bold`, {
                              [`${cssPrefix}-row-stock-item-red`]: item.sellNum - item.number < 0
                            })}
                          >
                            {`${item.sellNum - item.number < 0 ? '-' : ''}￥${numeral(Math.abs((item.sellNum - item.number) * item.avgCost)).format('0.00')}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
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
    const { selectMember, sort } = this.props;
    // 如果称重商品有改价 则优先计算改价，如果没有优先计算会员价
    const itemPrice: number = item.changePrice !== undefined
      ? numeral(item.changePrice).value()
      : selectMember !== undefined 
        ? item.memberPrice
        : item.price;

    return (
      <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}>
        {sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE ? (
          <Text className={`${cssPrefix}-row-normal`}>{`￥ ${this.setNumber(itemPrice)}`}</Text>
        )
        : sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND ? (
          numeral(itemPrice).value() !== numeral(item.price).value() ? (
            <View className={`${cssPrefix}-row-content-items`}>
              <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-line`}>{`￥ ${this.setNumber(item.price)}`}</Text>
              <View className={`${cssPrefix}-row-icon ${cssPrefix}-row-icon-refund`}>退货价</View>
              <Text className={`${cssPrefix}-row-normal`}>{`￥ ${numeral(item.changePrice).format('0.00')}`}</Text>
            </View>
          ) : (
            <Text className={`${cssPrefix}-row-normal`}>{`￥ ${this.setNumber(itemPrice)}`}</Text>
          )
        ) : (
          item.changePrice !== undefined && item.changePrice !== item.price ? (
            /**
             * @todo 2.26修改 当改价和员价相同时不显示改价图标
             */
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
          )
        )}
        <Text className={`${cssPrefix}-row-normal ${cssPrefix}-row-bold`}>
          {`小计：￥ ${this.setNumber(itemPrice * item.sellNum)}`}
        </Text>
      </View>
    );
  }
}

export default ProductPayListView;