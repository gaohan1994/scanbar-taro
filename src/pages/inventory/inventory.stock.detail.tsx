import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getMerchantStockDetail } from '../../reducers/app.inventory';
import { connect } from '@tarojs/redux';
import { InventoryInterface } from '../../constants';
import { InventoryAction } from '../../actions';
import productSdk from '../../common/sdk/product/product.sdk';
import "../style/order.less";
import "../style/product.less";
import { FormRowProps } from '../../component/card/form.row';
import FormCard from '../../component/card/form.card';
import numeral from 'numeral';
import { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import ProductPayListView from '../../component/product/product.pay.listview';
import ButtonFooter from '../../component/button/button.footer';

const cssPrefix = 'order';

type Props = {
  stockDetail: InventoryInterface.InventoryStockDetail;
};

class InventoryStockDetail extends Taro.Component<Props> {

  componentWillMount() {
    const { id } = this.$router.params;
    InventoryAction.merchantStockDetail(id);
  }

  /**
   * @todo [继续盘点，这里直接返回上一级路由]
   */
  public onStock = () => {
    const { entry } = this.$router.params;
    if (entry && entry === 'stock') {
      Taro.navigateBack({});
      return;
    }
    Taro.navigateTo({
      url: '/pages/inventory/inventory.stock'
    });
  }

  public onCopyPurchase = () => {
    try {
      const { stockDetail } = this.props; 
      const productList = InventoryAction.inventoryCopyPurchase(stockDetail);
      productSdk.manageCart(productList, productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE);
      Taro.navigateTo({
        url: `/pages/inventory/inventory.main`
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    return (
      <View className={`container ${cssPrefix}`}>
        <View className={`${cssPrefix}-detail-bg`} />
        <View className={`${cssPrefix}-detail-container`}>
          {this.renderStatus()}
          {this.renderCards()}
        </View>
        {this.renderButtons()}
      </View>
    );
  }

  private renderButtons = () => {
    const { entry } = this.$router.params;
    if (entry && entry === 'inventory') {
      return (
        <ButtonFooter
          buttons={[{
            title: "继续盘点",
            onPress: () => this.onStock(),
          }]}
        />
      );
    }
    return (
      <ButtonFooter
        buttons={[{
          title: "复制",
          onPress: () => this.onCopyPurchase(),
        }]}
      />
    );
  }

  private renderStatus = () => {
    const { stockDetail } = this.props;
    return (
      <View className={`${cssPrefix}-detail-status`}>
        <Image 
          src="//net.huanmusic.com/weapp/icon_inventory.png" 
          className={`${cssPrefix}-detail-status-purchase`} 
        />
        <View className={`${cssPrefix}-detail-status-detail`}>
          <View className={`${cssPrefix}-detail-status-detail-box`}>
            <Text className={`${cssPrefix}-detail-status-result`}>{stockDetail.businessNumber}</Text>
            <Image 
              src="//net.huanmusic.com/weapp/icon_copy.png"  
              className={`${cssPrefix}-detail-status-copy`}
            />
          </View>
          <Text className={`${cssPrefix}-detail-status-time`}>{stockDetail.makeTime}</Text>
        </View>
      </View>
    );
  }

  private renderCards = () => {
    const { stockDetail } = this.props;

    const num = stockDetail.detailList && stockDetail.detailList.reduce((prevNumber, nextItem) => {
      return prevNumber += nextItem.number;
    }, 0);
    const Form2: FormRowProps[] = [
      {
        title: '盘亏金额',
        extraText: `￥ ${numeral(stockDetail.amount).format('0.00')}`,
        extraTextStyle: 'title',
        extraTextColor: 'red',
        extraTextBold: 'bold',
      },
      {
        title: `盘亏数量`,
        extraText: `${num || 0}`,
        extraTextStyle: 'title',
        extraTextBold: 'bold',
        hasBorder: false
      },
    ];

    return (
      <View className={`${cssPrefix}-detail-cards`}>
        {Form2 && (
          <FormCard items={Form2} />
        )}
        {this.renderList()}
        <View className={`${cssPrefix}-area`} />
      </View>
    );
  }

  private renderList = () => {
    const { stockDetail } = this.props;
    if (stockDetail.detailList) {
      const productList: ProductCartInterface.ProductCartInfo[] = stockDetail.detailList.map((item) => {
        return {
          id: item.productId,
          name: item.productName,
          price: item.perCost,
          sellNum: item.number
        } as any;
      });
      return (
        <ProductPayListView
          padding={false}
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK}
          productList={productList}
        />
      );
    }
    return <View />;
  }
}

const select = (state: AppReducer.AppState) => ({
  stockDetail: getMerchantStockDetail(state),
});

export default connect(select)(InventoryStockDetail);