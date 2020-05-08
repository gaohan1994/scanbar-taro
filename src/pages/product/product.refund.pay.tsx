import Taro, { Config } from "@tarojs/taro";
import { View } from "@tarojs/components";
import { getProductRefundList } from "../../common/sdk/product/product.sdk.reducer";
import { connect } from "@tarojs/redux";
import productSdk, {
  ProductCartInterface
} from "../../common/sdk/product/product.sdk";
import "../../component/card/form.card.less";
import "../style/product.less";
import "../../styles/theme.less";
import "../../component/cart/cart.less";
import FormCard from "../../component/card/form.card";
import { FormRowProps } from "../../component/card/form.row";
import invariant from "invariant";
import numeral from "numeral";
import ProductPayListView from "../../component/product/product.pay.listview";
import {
  ProductService,
  ProductInterface,
  ResponseCode
} from "../../constants";
import { InventoryAction } from "../../actions";
import ButtonFooter from "../../component/button/button.footer";

const cssPrefix = "product";

type Props = {
  productRefundList: ProductCartInterface.ProductCartInfo[];
};

class ProductRefundPay extends Taro.Component<Props> {
  config: Config = {
    navigationBarTitleText: "退款"
  };

  componentDidMount() {
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND);
  }

  public onRefundHandle = async () => {
    try {
      const { productRefundList } = this.props;
      Taro.showLoading();
      const payload: ProductInterface.CashierRefund = {
        order: {
          memberId: null as any,
          orderNo: null as any,
          orderSource: 1,
          payType: 0,
          terminalCd: "-1",
          terminalSn: "-1",
          totalAmount: productSdk.getProductMemberPrice(),
          transAmount: productSdk.getProductTransPrice() as any
        },
        productInfoList: productRefundList.map(product => {
          const token = productSdk.isNonBarcodeProduct(product);
          return {
            ...(!token ? { productId: product.id } : {}),
            changeNumber: product.sellNum,
            unitPrice: productSdk.getProductItemPrice(product),
            remark: product.remark || ""
          } as any;
        })
      };
      const result = await ProductService.cashierRefund(payload);
      Taro.hideLoading();
      invariant(result.code === ResponseCode.success, result.msg || " ");
      Taro.showToast({
        title: "退款成功！",
        duration: 1000,
        success: () => {
          setTimeout(() => {
            InventoryAction.stockSuccessCallback(
              productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND
            );
            Taro.navigateBack({ delta: 10 });
          }, 1000);
        }
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  render() {
    return (
      <View className="container">
        <View className={`${cssPrefix}-pay-container ${cssPrefix}-pay`}>
          {this.renderListDetail()}
          {this.renderListProductCard()}
        </View>
        {this.renderFooter()}
      </View>
    );
  }

  private setNumber = (num: number | string): string => {
    return numeral(num).format("0.00");
  };

  private renderFooter = () => {
    return (
      <ButtonFooter
        buttons={[
          {
            title: "现金退款",
            onPress: () => this.onRefundHandle()
          }
        ]}
      />
    );
  };

  private renderListProductCard = () => {
    const { productRefundList } = this.props;
    return (
      <ProductPayListView
        sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND}
        productList={productRefundList}
      />
    );
  };

  private renderListDetail = () => {
    const priceForm: FormRowProps[] = [
      {
        title: "应退金额",
        extraText: `￥${this.setNumber(productSdk.getProductTransPrice())}`,
        extraTextColor: "#333333",
        extraTextBold: "bold",
        extraTextSize: "36",
        hasBorder: false
      }
    ];

    const formCard: FormRowProps[] = [
      {
        title: "商品数量",
        extraText: `${productSdk.getProductNumber()}`
      },
      {
        title: "原价金额",
        extraText: `￥${this.setNumber(productSdk.getProductsOriginPrice())}`
      }
    ];
    return (
      <View className={`${cssPrefix}-pay-pos`}>
        <FormCard items={priceForm} />
        <FormCard items={formCard} />
      </View>
    );
  };
}

const select = (state: any) => ({
  productRefundList: getProductRefundList(state)
});

export default connect(select)(ProductRefundPay);
