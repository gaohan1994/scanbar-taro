import Taro from "@tarojs/taro";
import { ScrollView, View } from "@tarojs/components";
import ProductComponent from "./product";
import "../../pages/style/product.less";
import { ProductInterface } from "../../constants";
import productSdk, {
  ProductCartInterface
} from "../../common/sdk/product/product.sdk";
import { AtActivityIndicator } from "taro-ui";
import classnames from "classnames";

const cssPrefix = "product";

type Props = {
  className?: string;
  loading?: boolean;
  productList: Array<
    ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo
  >;
  productListTotal: number;
  page: number;
  isRenderFooter?: boolean;
  bottomSpector?: boolean;
  sort?:
    | ProductCartInterface.PAYLOAD_ORDER
    | ProductCartInterface.PAYLOAD_REFUND;
  onScrollToLower?: any
};

class ProductListView extends Taro.Component<Props> {
  static options = {
    addGlobalClass: true
  };

  static defaultProps = {
    loading: false,
    productList: [],
    page: 1,
    productListTotal: 0,
    isRenderFooter: true,
    bottomSpector: true,
    sort: productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER,
    onScrollToLower: ()=>{}
  };

  render() {
    const {
      className,
      loading,
      page,
      productList,
      productListTotal,
      isRenderFooter,
      bottomSpector,
      sort,
      onScrollToLower
    } = this.props;
    
    return (
      <ScrollView
        scrollY={true}
        className={classnames(`${cssPrefix}-list-right`, className)}
        onScrollToLower={onScrollToLower}
      >
        {/* {!loading ? (
          productList && productList.length > 0 ? (
            productList.map(product => {
              return (
                <View id={`product${product.id}`} key={product.id}>
                  <ProductComponent product={product} sort={sort} />
                </View>
              );
            })
          ) : (
            <View />
          )
        ) : (
          <View className="container">
            <AtActivityIndicator mode="center" />
          </View>
        )} */}
        {productList.map(product => {
          return (
            <View id={`product${product.id}`} key={product.id}>
              <ProductComponent key={product.id} product={product} sort={sort} />
            </View>
          );
        })}
        {isRenderFooter && page !== 1 && productList && productList.length >= productListTotal && (
          <View className={`${cssPrefix}-list-bottom`}>
            已经到底啦
          </View>
         
        )}
        {bottomSpector && <View style="height: 60px" />}
        {this.props.children}
      </ScrollView>
    );
  }
}
export default ProductListView;
