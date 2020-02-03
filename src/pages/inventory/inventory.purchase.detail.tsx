import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getInventoryStockDetail } from '../../reducers/app.inventory';
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
import invariant from 'invariant';

const cssPrefix = 'order';

type Props = {
  stockDetail: InventoryInterface.InventoryStockDetail;
};

class InventoryPurchaseDetail extends Taro.Component<Props> {

  componentWillMount() {
    const { id } = this.$router.params;
    InventoryAction.stockDetail(id);
  }

  /**
   * @todo [继续进货，这里直接返回上一级路由]
   */
  public onPurchase = () => {
    const { entry } = this.$router.params;
    if (entry && entry === 'inventory') {
      Taro.navigateBack({});
      return;
    }
    Taro.navigateTo({
      url: '/pages/inventory/inventory.main'
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
      this.onPurchase();
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
            title: "继续进货",
            onPress: () => this.onPurchase(),
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
          src="//net.huanmusic.com/weapp/icon_purchase.png" 
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
        title: '应付金额',
        extraText: `-￥ ${numeral(stockDetail.amount).format('0.00')}`,
        extraTextStyle: 'title',
        extraTextColor: 'red',
        extraTextBold: 'bold',
      },
      {
        title: `进货数量`,
        extraText: `${num || 0}`,
        extraTextStyle: 'title',
        extraTextBold: 'bold',
        hasBorder: false
      },
    ];

    const Form3: FormRowProps[] = [
      {
        title: '供应商',
        extraText: `${stockDetail.supplierName || '暂无供应商信息'}`,
        extraTextColor: '#4d4d4d',
      }
    ];

    return (
      <View className={`${cssPrefix}-detail-cards`}>
        {Form2 && (
          <FormCard items={Form2} />
        )}
        {Form3 && (
          <FormCard items={Form3} >
            
          </FormCard>
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
          productList={productList}
        />
      );
    }
    return <View />;
  }
}

const select = (state: AppReducer.AppState) => ({
  stockDetail: getInventoryStockDetail(state),
});

export default connect(select)(InventoryPurchaseDetail);