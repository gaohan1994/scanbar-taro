import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import './index.less';
import { InventoryInterface } from '../../constants';
import numeral from 'numeral';
import dayjs from 'dayjs';
import classnames from 'classnames';
import productSdk from '../../common/sdk/product/product.sdk';

const cssPrefix = 'component-inventory-item';

type Props = {
  sort?: string;
  inventory: InventoryInterface.InventoryStockDetail
};

class InventoryItem extends Taro.Component<Props> {
  static defaultProps = {
    sort: productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE
  };

  public onNavToDetail = () => {
    const { inventory, sort } = this.props;
    if (sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK) {
      Taro.navigateTo({
        url: `/pages/inventory/inventory.stock.detail?id=${inventory.businessNumber}`
      }); 
      return;
    }
    Taro.navigateTo({
      url: `/pages/inventory/inventory.purchase.detail?id=${inventory.businessNumber}`
    });
  }

  render () {
    const { inventory, sort } = this.props;
    // 是否大于0
    const absToken: boolean = numeral(inventory.amount).value() > 0;
    return (
      <View 
        className={`${cssPrefix}`}
        onClick={() => this.onNavToDetail()}
      >
        <View className={`${cssPrefix}-header`}>
          <View className={`${cssPrefix}-header-box`}>
            {absToken ? (
              <Image
                src="//net.huanmusic.com/weapp/v2/icon_order_green.png"
                className={`${cssPrefix}-header-img`}
              />
            ) : (
              <Image
                src="//net.huanmusic.com/weapp/icon_order_red.png"
                className={`${cssPrefix}-header-img`}
              />
            )}
            
            <Text className={`${cssPrefix}-header-title`}>{inventory.businessNumber}</Text>
          </View>
          <Text className={`${cssPrefix}-header-time`}>{dayjs(inventory.makeTime).format('HH:mm:ss')}</Text>
        </View>
        <View className={`${cssPrefix}-content`}>
          <View className={`${cssPrefix}-content-item ${cssPrefix}-content-item-bot`}>
            <Text className={`${cssPrefix}-content-item-name`}>种类</Text>
            <Text className={`${cssPrefix}-content-item-value`}>{inventory.productNum}</Text>
          </View>
          <View className={`${cssPrefix}-content-item`}>
            <Text className={`${cssPrefix}-content-item-name`}>数量</Text>
            <Text 
              className={classnames(`${cssPrefix}-content-item-value`, {
                [`${cssPrefix}-content-item-red`]: inventory.number < 0
              })}
            >
              {inventory.number}
            </Text>
          </View>

          <View 
            className={classnames(`${cssPrefix}-content-item-price`, {
              [`${cssPrefix}-content-item-red`]: sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK && !absToken
            })}
          >
            
            {sort === productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK && (
              <Text>{absToken ? '' : '-'}</Text>  
            )}
            {`￥${numeral(Math.abs(inventory.amount)).format('0.00')}`}
          </View>
        </View>

        {!!inventory.remark && (
          <View className={`${cssPrefix}-remark`}>
            <View className={`${cssPrefix}-remark-text`}>备注：{inventory.remark}</View>
          </View>
        )}
      </View>
    );
  }
}

export default InventoryItem;