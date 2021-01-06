import Taro, { Config } from '@tarojs/taro';
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
import ProductPayListView from '../../component/product/product.pay.listview';
import ButtonFooter from '../../component/button/button.footer';
import invariant from 'invariant';

const cssPrefix = 'order';

type Props = {
  stockDetail: InventoryInterface.InventoryStockDetail;
};

class InventoryStockDetail extends Taro.Component<Props> {

  config: Config = {
    navigationBarTitleText: '盘点详情'
  };

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

  public onCopy = async () => {
    try { 
      const { stockDetail } = this.props;
      invariant(stockDetail && stockDetail.businessNumber, '请选择要复制的数据');
      await Taro.setClipboardData({data: stockDetail.businessNumber});
      Taro.showToast({title: '已复制订单号'}); 
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
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
    if (entry && entry === 'stock') {
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
      <View/>
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
          <View 
            onClick={() => this.onCopy()}
            className={`${cssPrefix}-detail-status-detail-box`}
          >
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
        title: '盈亏金额',
        extraText: `${stockDetail.amount >= 0 ? '' : '-'}￥ ${numeral(Math.abs(stockDetail.amount)).format('0.00')}`,
        extraTextStyle: 'title',
        extraTextColor: stockDetail.amount >= 0 ? '#333333' : '#FC4E44',
        extraTextBold: 'bold',
      },
      {
        title: `盈亏数量`,
        extraText: `${num || 0}`,
        extraTextStyle: 'title',
        extraTextColor: num >= 0 ? '#333333' : '#FC4E44',
        extraTextBold: 'bold',
        hasBorder: false
      },
    ];

    return (
      <View className={`${cssPrefix}-detail-cards`}>
        <View className={`${cssPrefix}-detail-card`}>
          {Form2 && (
            <FormCard items={Form2} />
          )}
          {this.renderList()}
        </View>
        <View className={`${cssPrefix}-area`} />
      </View>
    );
  }

  private renderList = () => {
    const { stockDetail } = this.props;
    if (stockDetail.detailList) {
      return (
        <ProductPayListView
          padding={false}
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK}
          productList={stockDetail.detailList}
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