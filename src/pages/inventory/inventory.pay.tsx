import Taro from '@tarojs/taro';
import { View, Picker, Input, Text, Image } from '@tarojs/components';
import { getProductPurchaseList } from '../../common/sdk/product/product.sdk.reducer';
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
import { getProductSupplier } from '../../reducers/app.product';
import FormRow from '../../component/card/form.row';
import ButtonFooter from '../../component/button/button.footer';

const cssPrefix = 'product';

type Props = { 
  productPurchaseList: ProductCartInterface.ProductCartInfo[];
  productSupplier: ProductInterface.ProductSupplier[];
  productSupplierSelector: string[];
};

type State = {
  supplierValue: number;
  showRemark: boolean;
  remark: string;
};

class InventoryPay extends Taro.Component<Props, State> {

  readonly state: State = {
    supplierValue: 0,
    showRemark: false,
    remark: '',
  };

  componentDidMount() {
    ProductAction.productInfoSupplier();
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE);
  }

  public changeProductSupplier = (event: any) => {
    const value: number = event.detail.value;
    this.setState({supplierValue: value});
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
      const { supplierValue, remark } = this.state;
      const products = InventoryAction.getProductPayload(productPurchaseList);
      const payload: InventoryInterface.Interfaces.StockAdd = {
        productList: products,
        supplierId: productSupplier[supplierValue].id,
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
          productSdk.empty(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE);
          Taro.redirectTo({
            url: `/pages/inventory/inventory.purchase.detail?id=${result.data.businessNumber}&entry=inventory`
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
    return (
      <ButtonFooter
        buttons={[{
          title: '进货',
          onPress: () => this.onPayHandle()
        }]}
      />
    );
  }

  private renderListProductCard = () => {
    const { productPurchaseList } = this.props;
    return (
      <ProductPayListView
        sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE}
        productList={productPurchaseList}
      />
    );
  }

  private renderListDetail = () => {
    const { productSupplierSelector, productSupplier } = this.props;
    const { supplierValue, showRemark, remark } = this.state;
    const priceForm: FormRowProps[] = [
      {
        title: '应付金额',
        extraText: `￥${this.setNumber(productSdk.getProductTransPrice())}`,
        extraTextColor: '#333333',
        extraTextBold: 'bold',
        extraTextSize: '36',
      },
      {
        title: '进货数量',
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
        <View className='component-form'>
          <Picker
            mode="selector"
            range={productSupplierSelector}
            onChange={this.changeProductSupplier}
            value={supplierValue}
          >
            <FormRow
              title="供应商"
              extraText={productSupplier[supplierValue] && productSupplier[supplierValue].name || ''}
              arrow="right"
            />
          </Picker>
          <View className={`inventory-remark`}>
            <View 
              className={`inventory-remark-row`}
              onClick={() => this.changeShowRemark()}
            >
              <Text className="inventory-remark-title">备注</Text>
               {showRemark !== true ? (
                  <Image
                    src="//net.huanmusic.com/weapp/icon_expand_gray.png" 
                    className={`cart-left-image`}
                  />
                ) : (
                  <Image
                    src="//net.huanmusic.com/weapp/icon_expand_gray.png" 
                    className={`cart-left-image cart-left-image-down`}
                  />
                )}
            </View>
            {showRemark && (
              <View>
                <Input 
                  value={remark} 
                  className="inventory-remark-input"
                  placeholderClass="inventory-remark-input-place"
                  placeholder="请输入备注"
                  onInput={this.changeRemark}
                />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }
}

const select = (state: any) => {
  const productSupplier = getProductSupplier(state);
  const productSupplierSelector = productSupplier.map((supplier) => {
    return supplier.name;
  });
  return {
    productPurchaseList: getProductPurchaseList(state),
    productSupplier,
    productSupplierSelector,
  };
};

export default connect(select)(InventoryPay);