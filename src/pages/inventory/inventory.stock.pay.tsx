import Taro from '@tarojs/taro';
import { View, Input, Text, Image } from '@tarojs/components';
import { getProductPurchaseList, getProductStockList } from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import "../../component/card/form.card.less";
import '../style/product.less';
import '../style/inventory.less';
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
import ButtonFooter from '../../component/button/button.footer';

const cssPrefix = 'product';

type Props = { 
  productStockList: ProductCartInterface.ProductCartInfo[];
};

type State = {

};

class InventoryStockPay extends Taro.Component<Props, State> {

  readonly state: State = {

  };

  componentDidMount() {
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE);
  }

  public onStockCheck = async () => {
    try {
      const { productStockList } = this.props;
      const payload: InventoryInterface.Interfaces.StockCheck = {
        remark: '',
        productList: productStockList.map((product) => {
          return {
            amount: product.cost,
            number: product.sellNum,
            productId: product.id,
            subtotal: product.cost * product.sellNum,
          };
        })
      };
      const result = await InventoryAction.inventoryStockCheck(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '盘点成功',
        duration: 1000
      });
      setTimeout(() => {
        Taro.redirectTo({
          url: `/pages/inventory/inventory.stock.detail?id=${result.data.businessNumber}&entry=stock`,
        });
      }, 1000);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
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
    return (
      <ButtonFooter
        buttons={[{
          title: '盘点',
          onPress: () => this.onStockCheck()
        }]}
      />
    );
  }

  private renderListProductCard = () => {
    const { productStockList } = this.props;
    return (
      <ProductPayListView
        productList={productStockList}
        sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK}
      />
    );
  }

  private renderListDetail = () => {
    const stockPrice = productSdk.getStockPrice();
    const priceForm: FormRowProps[] = [
      {
        title: '盘盈金额',
        extraText: stockPrice > 0 ? `￥${this.setNumber(stockPrice)}` : `-￥${Math.abs(stockPrice)}`,
        extraTextColor: '#333333',
        extraTextBold: 'bold',
        extraTextSize: '36',
      },
      {
        title: '盘盈数量',
        extraText: `${productSdk.getProductNumber()}`,
        extraTextColor: '#333333',
        extraTextBold: 'bold',
        extraTextSize: '36',
        hasBorder: false,
      }
    ];

    return (
      <View className={`${cssPrefix}-pay-pos`}>
        <FormCard items={priceForm} />
      </View>
    );
  }
}

const select = (state: any) => {
  return {
    productStockList: getProductStockList(state),
  };
};

export default connect(select)(InventoryStockPay);