import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import { getProductPurchaseList } from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import "../../component/card/form.card.less";
import '../style/product.less';
import '../../styles/theme.less';
import "../../component/cart/cart.less";
import classnames from 'classnames';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import invariant from 'invariant';
import numeral from 'numeral';
import ProductPayListView from '../../component/product/product.pay.listview';
import { ResponseCode, InventoryInterface, ProductInterface } from '../../constants';
import { InventoryAction, ProductAction } from '../../actions';
import { getProductSupplier } from '../../reducers/app.product';

const cssPrefix = 'product';

type Props = { 
  productPurchaseList: ProductCartInterface.ProductCartInfo[];
  productSupplier: ProductInterface.ProductSupplier[];
};

class InventoryPay extends Taro.Component<Props> {

  componentDidMount() {
    ProductAction.productInfoSupplier();
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND);
  }

  /**
   * @todo [进货]
   * @todo [进货成功之后toast，1秒之后跳转到这次进货详情页面]
   *
   * @memberof InventoryPay
   */
  public onPayHandle = async () => {
    try {
      Taro.showLoading();
      const { productPurchaseList, productSupplier } = this.props;
      const products = InventoryAction.getProductPayload(productPurchaseList);
      const payload: InventoryInterface.Interfaces.StockAdd = {
        productList: products,
        supplierId: productSupplier[0].id,
      };
      const result = await InventoryAction.stockAdd(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({ 
        title: '进货成功', 
        icon: 'success',
        duration: 10000
      });
      if (result.data.businessNumber) {
        setTimeout(() => {
          Taro.redirectTo({
            url: `/pages/inventory/inventory.purchase.detail?id=${result.data.businessNumber}&entry='inventory'`
          });  
        }, 1000);        
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        icon: 'none',
        title: error.message
      });
    }
  }
  
  render () {
    return (
      <View className='container'>
        <View className={`${cssPrefix}-pay-container ${cssPrefix}-pay`} >
          {this.renderListDetail()}
          {this.renderListProductCard()}
        </View>
        {this.renderFooter()}
      </View>
    );
  }

  private setNumber = (num: number | string): string => {
    return numeral(num).format('0.00');
  }

  private renderFooter = () => {
    const { productPurchaseList } = this.props;
    return (
      <View className={`${cssPrefix}-pay-footer`}>
        <View className={`${cssPrefix}-pay-footer-bg`}>
          <View
            className={classnames(`${cssPrefix}-pay-footer-right`, {
              [`${cssPrefix}-pay-footer-right-active`]: productPurchaseList.length > 0,
              [`${cssPrefix}-pay-footer-right-disabled`]: productPurchaseList.length === 0,
            })}
            onClick={() => this.onPayHandle()}
          >
            结算￥{this.setNumber(numeral(productSdk.getProductTransPrice()).value())}
          </View>
        </View>
      </View>
    );
  }

  private renderListProductCard = () => {
    const { productPurchaseList } = this.props;
    return (
      <ProductPayListView
        productList={productPurchaseList}
      />
    );
  }

  private renderListDetail = () => {

    const priceForm: FormRowProps[] = [
      {
        title: '应退金额',
        extraText: `￥${this.setNumber(0)}`,
        extraTextColor: '#333333',
        extraTextBold: 'bold',
        extraTextSize: '36',
        hasBorder: false,
      }
    ];

    const formCard: FormRowProps[] = [
      {
        title: '商品数量',
        extraText: `${0}`
      },
      {
        title: '原价金额',
        extraText: `￥${this.setNumber(0)}`
      },
    ];
    return (
      <View className={`${cssPrefix}-pay-pos`}>
        <FormCard items={priceForm} />
        <FormCard items={formCard} />
      </View>
    );
  }
}

const select = (state: any) => ({
  productPurchaseList: getProductPurchaseList(state),
  productSupplier: getProductSupplier(state),
});

export default connect(select)(InventoryPay);