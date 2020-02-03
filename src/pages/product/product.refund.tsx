/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-15 20:21:24
 * 
 * @todo 开单页面
 */
import Taro from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
import "../style/product.less";
import "../style/member.less";
import CartBar from '../../component/cart/cart';
import { ProductAction } from '../../actions';
import { getProductSearchList, getSelectProduct, getProductType, getProductList } from '../../reducers/app.product';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import { ProductInterface, ProductInterfaceMap } from '../../constants';
import classnames from 'classnames';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';
import productSdk from '../../common/sdk/product/product.sdk';
import { store } from '../../app';
import HeaderInput from '../../component/header/header.input';
import ProductListView from '../../component/product/product.listview';

const cssPrefix = 'product';

interface Props { 
  /**
   * @param {productList} 商品数据，商品在分类里
   * @type {ProductInterface.ProductList[]}
   * @memberof Props
   */
  productList: ProductInterface.ProductInfo[];
  productSearchList: ProductInterface.ProductList[];
  pureProductSearchList: ProductInterface.ProductInfo[];
  selectProduct: ProductInterface.ProductInfo;
  productTypeList: ProductInterface.ProductTypeInfo[];
}

interface State {
  /**
   * @param {currentType} 左边当前分类
   *
   * @type {ProductInterface.ProductTypeInfo}
   * @memberof State
   */
  currentType: ProductInterface.ProductTypeInfo;
  searchValue: string;              
  loading: boolean;              
}

class ProductRefund extends Taro.Component<Props, State> {
  
  readonly state: State = {
    currentType: {
      name: '',
      id: 0,
      createTime: ''
    },
    searchValue: '',
    loading: false,
  };
  
  componentDidShow () {
    this.setState({
      searchValue: ''
    });
    ProductAction.productInfoEmptySearchList();
    this.init();
  }

  public changeCurrentType = (typeInfo: ProductInterface.ProductTypeInfo, fetchProduct: boolean = true) => {
    this.setState({ currentType: typeInfo }, async () => {
      if (fetchProduct) {
        console.log('this.state', this.state);
        this.fetchData(typeInfo);
      }
    });
  }

  public init = async (): Promise<void> => {
    try {
      const productTypeResult = await ProductAction.productInfoType();
      invariant(productTypeResult.code === ResponseCode.success, productTypeResult.msg || ' ');
      const { data } = productTypeResult;
      const firstType = data[0] || {};
      this.changeCurrentType(firstType);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public fetchData = async (type: ProductInterface.ProductTypeInfo) => {
    this.setState({ loading: true });
    const result = await ProductAction.productOrderInfoList({type: `${type.id}`, status: 0});
    this.setState({ loading: false });
    return result;
  }

  public searchData = async () => {
    const { searchValue } = this.state;
    try {
      if (searchValue === '') {
        /**
         * @todo 如果输入的是空则清空搜索
         */
        ProductAction.productInfoEmptySearchList();
      } else {
        Taro.showLoading();
        const { success, result } = await ProductAction.productInfoSearchList({words: searchValue});
        Taro.hideLoading();
        invariant(success, result || ResponseCode.error);
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  /**
   * @todo [点击菜单的时候修改当前菜单并跳转至对应商品]
   *
   * @memberof ProductOrder
   */
  public onTypeClick = (params: ProductInterface.ProductTypeInfo) => {
    this.onInput({detail: {value: ''}});
    this.changeCurrentType(params);
  }

  /**
   * @todo 绑定输入事件
   *
   * @memberof ProductOrder
   */
  public onInput = ({detail}: any) => {
    this.setState({searchValue: detail.value}, () => {
      this.searchData();
    });
  }

  render () {
    const { searchValue } = this.state;
    return (
      <View className={`container ${cssPrefix}`}>
        <HeaderInput
          className="product-refund-input"
          placeholder="请输入商品名称或条码"
          value={searchValue}
          onInput={this.onInput}
          isRenderInputRight={true}
          inputRightClick={() => this.onInput({detail: {value: ''}})}
        />
        
        <View className={`${cssPrefix}-list-container`}>
          {this.renderLeft()}  
          {this.renderRight()}
        </View>
        <CartBar sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND} />
      </View>
    );
  }

  /**
   * @todo [当有搜索商品数据的时候左边不显示active菜单但是点击事件依然可以触发，点击菜单的时候清空搜索并跳转至正常位置]
   *
   * @private
   * @memberof ProductOrder
   */
  private renderLeft = () => {
    const { currentType, searchValue } = this.state; 
    const { productTypeList, pureProductSearchList } = this.props;
    return (
      <ScrollView 
        scrollY={true}
        className={`${cssPrefix}-list-left`}
      >
        {
          productTypeList && productTypeList.length > 0
            ? productTypeList.map((type) => {
              
              return (
                <View 
                  key={type.id}
                  className={classnames(`${cssPrefix}-list-left-item`, {
                    [`${cssPrefix}-list-left-item-active`]: searchValue === '' && pureProductSearchList.length === 0 && type.id === currentType.id
                  })}
                  onClick={() => this.onTypeClick(type)}
                >
                  {searchValue === '' && pureProductSearchList.length === 0 && type.id === currentType.id && (
                    <View className={`${cssPrefix}-list-left-item-active-bge`} />
                  )}
                  {type.name}
                </View>
              );
            })
            : <View />
        }
      </ScrollView>
    );
  }

  private renderRight = () => {
    const { productList, pureProductSearchList } = this.props;
    const { currentType, searchValue, loading } = this.state;
    if (pureProductSearchList.length === 0 && searchValue === '') {
      return (
        <View className={`${cssPrefix}-list-right`}>
          <View className={`${cssPrefix}-list-right-header product-component-section-header-height`}>
            <View className={`${cssPrefix}-list-right-header-bge`}/>
            <Text className={`${cssPrefix}-list-right-header-text`}>{currentType.name}</Text>
          </View>
          <ProductListView
            loading={loading}
            productList={productList}
            className={`${cssPrefix}-list-right-container`}
            sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND}
          />
        </View>
      );
    } 
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ProductListView
          productList={pureProductSearchList}
          className={`${cssPrefix}-list-right-container-search`}
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_REFUND}
        />
      </View>
    );
  }
}

const mapState = (state: AppReducer.AppState) => {
  const productList = getProductList(state) || [];

  const productSearchList = getProductSearchList(state) || [];
  const pureProductSearchList: any[] = productSearchList;
  const selectProduct: any = getSelectProduct(state);

  return {
    productList,
    productSearchList,
    pureProductSearchList,
    selectProduct,
    productTypeList: getProductType(state),
  };
};

export default connect(mapState)(ProductRefund);