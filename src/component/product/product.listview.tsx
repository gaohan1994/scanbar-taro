import Taro from '@tarojs/taro';
import { ScrollView, View } from '@tarojs/components';
import ProductComponent from './product';
import "../../pages/style/product.less";
import { ProductInterface } from '../../constants';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import { AtActivityIndicator } from 'taro-ui';
import classnames from 'classnames';

const cssPrefix = 'product';

type Props = { 
  className?: string;
  loading?: boolean;
  productList: Array<ProductInterface.ProductInfo | ProductCartInterface.ProductCartInfo>;
  isRenderFooter?: boolean;
  bottomSpector?: boolean;
  sort?: ProductCartInterface.PAYLOAD_ORDER | ProductCartInterface.PAYLOAD_REFUND;
};

class ProductListView extends Taro.Component<Props> {
  static options = {
    addGlobalClass: true
  };

  static defaultProps = {
    loading: false,
    productList: [],
    isRenderFooter: true,
    bottomSpector: true,
    sort: productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_ORDER,
  };

  render () {
    const { className, loading, productList, isRenderFooter, bottomSpector, sort } = this.props;
    return (
      <ScrollView 
        scrollY={true}
        className={classnames(`${cssPrefix}-list-right`, className)}
      >
        {
          !loading 
          ? productList && productList.length > 0
            ? productList.map((product) => {
              return (
                <View    
                  id={`product${product.id}`}
                  key={product.id}
                >
                  <ProductComponent
                    product={product}
                    sort={sort}
                  />  
                </View>
              );
            })
            : <View />
          : (
            <View className="container">
              <AtActivityIndicator mode='center' />
            </View>
          )
        }
        {isRenderFooter && productList && productList.length > 0 && (
          <View className={`${cssPrefix}-list-bottom`}>已经到底啦</View>
        )}
        {bottomSpector && (
          <View style="height: 100px" />
        )}
      </ScrollView>  
    );
  }
}
export default ProductListView;