import Taro from '@tarojs/taro';
import { View, Input } from '@tarojs/components';
import { getProductPurchaseList, getProductStockList } from '../../common/sdk/product/product.sdk.reducer';
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
import FormRow from '../../component/card/form.row';

const cssPrefix = 'product';

type Props = { 
  productStockList: ProductCartInterface.ProductCartInfo[];
};

type State = {
  showRemark: boolean;
  remark: string;
};

class InventoryStockPay extends Taro.Component<Props, State> {

  readonly state: State = {
    showRemark: false,
    remark: '',
  };

  componentDidMount() {
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE);
  }

  public changeShowRemark = (visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        showRemark: typeof visible === 'boolean' ? visible : !prevState.showRemark
      };
    });
  }

  public changeRemark = (event: any) => {
    const value = event.detail.value;
    this.setState({remark: value});
  }

  public onStockCheck = async () => {
    try {
      const { remark } = this.state;
      const { productStockList } = this.props;
      const payload: InventoryInterface.Interfaces.StockCheck = {
        remark,
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
    const { productStockList } = this.props;
    return (
      <View className={`${cssPrefix}-pay-footer`}>
        <View className={`${cssPrefix}-pay-footer-bg`}>
          <View
            className={classnames(`${cssPrefix}-pay-footer-right`, {
              [`${cssPrefix}-pay-footer-right-active`]: productStockList.length > 0,
              [`${cssPrefix}-pay-footer-right-disabled`]: productStockList.length === 0,
            })}
            onClick={() => this.onStockCheck()}
          >
            盘点￥{this.setNumber(numeral(productSdk.getProductTransPrice()).value())}
          </View>
        </View>
      </View>
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
    const { showRemark, remark } = this.state;
    const priceForm: FormRowProps[] = [
      {
        title: '盘盈金额',
        extraText: `￥${this.setNumber(0)}`,
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
        <View className='component-form'>
          <View>
            <View 
              onClick={() => this.changeShowRemark()}
            >
              备注 {showRemark ? '^' : 'v'}
            </View>
            {showRemark && (
              <View>
                <Input 
                  value={remark} 
                  onInput={this.changeRemark}
                />
              </View>
            )}
          </View>

        </View>
        <FormCard items={formCard} />
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