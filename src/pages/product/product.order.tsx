/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-25 15:45:26
 * 
 * @todo 开单页面
 */
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text } from '@tarojs/components';
import "../style/product.less";
import "../style/member.less";
import CartBar from '../../component/cart/cart';
import { ProductAction } from '../../actions';
import { getProductSearchList, getSelectProduct, getProductType, getProductList } from '../../reducers/app.product';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import { ProductInterface, ProductInterfaceMap } from '../../constants';
import classnames from 'classnames';
import ProductComponent from '../../component/product/product';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';
import productSdk from '../../common/sdk/product/product.sdk';
import { store } from '../../app';
import { getProductCartList, getSuspensionCartList, ProductSDKReducer } from '../../common/sdk/product/product.sdk.reducer';
import { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import Badge from '../../component/badge/badge';
import { AtActivityIndicator } from 'taro-ui';

let SectionHeight: number = -1;

const memberPrefix = 'member';
const cssPrefix = 'product';

interface Props { 
  /**
   * @param {productList} 商品数据，商品在分类里
   *
   * @type {ProductInterface.ProductList[]}
   * @memberof Props
   */
  productList: ProductInterface.ProductInfo[];
  productSearchList: ProductInterface.ProductList[];
  pureProductSearchList: ProductInterface.ProductInfo[];
  selectProduct: ProductInterface.ProductInfo;
  productTypeList: ProductInterface.ProductTypeInfo[];
  /**
   * @param {productCartList}  
   * @param {suspensionList} 
   *
   * @type {ProductCartInterface.ProductCartInfo[]}
   * @memberof Props
   */
  productCartList: ProductCartInterface.ProductCartInfo[];
  suspensionList: ProductSDKReducer.SuspensionCartBase[];
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

class ProductOrder extends Taro.Component<Props, State> {
  
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
    this.init();
  }

  public changeCurrentType = (typeInfo: ProductInterface.ProductTypeInfo, fetchProduct: boolean = true) => {
    this.setState({ currentType: typeInfo }, async () => {
      if (fetchProduct) {
        this.fetchData(typeInfo);
      }
    });
  }

  public init = async (): Promise<void> => {
    try {
      const productTypeResult = await ProductAction.productInfoType();
      console.log('productTypeResult: ', productTypeResult);
      invariant(productTypeResult.code === ResponseCode.success, productTypeResult.msg || ' ');
      const { data } = productTypeResult;
      const firstType = data[0] || {};
      this.changeCurrentType(firstType);

      const { selectProduct } = this.props;
      if (selectProduct !== undefined) {
        productSdk.manage({
          type: productSdk.productCartManageType.ADD,
          product: selectProduct
        });
        setTimeout(() => {
          store.dispatch({
            type: ProductInterfaceMap.reducerInterfaces.SET_SELECT_PRODUCT,
            payload: { selectProduct: undefined }
          });
        }, 100);
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public fetchData = async (type: ProductInterface.ProductTypeInfo) => {
    this.setState({ loading: true });
    const result = await ProductAction.productOrderInfoList({type: type.id, status: 0});
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

  public onNonBarcodeProductClick = () => {
    const product: any = {
      id: `${productSdk.nonBarcodeKey}${new Date().getTime()}`
    };
    productSdk.manage({
      type: productSdk.productCartManageType.ADD,
      product
    });
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

  public onSuspensionHandle = () => {
    const { productCartList } = this.props;
    if (productCartList.length > 0) {
      productSdk.suspensionCart();
    } else {
      Taro.navigateTo({
        url: `/pages/product/product.suspension`
      });
    }
  }

  public getSectionHeight = async () => {
    if (SectionHeight === -1) {
      const query = Taro.createSelectorQuery().in(this.$scope);
      query
        .select('.product-component-section-header-height')
        .boundingClientRect((rect: any) => {
          SectionHeight = rect.height;
        })
        .exec();
    }
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
    const { suspensionList } = this.props;
    return (
      <View className={`container ${cssPrefix}`}>
        <View className={`${cssPrefix}-header`}>
          <View className={`${memberPrefix}-main-header-search ${cssPrefix}-header-search`}>
            <Image src="//net.huanmusic.com/weapp/icon_import.png" className={`${memberPrefix}-main-header-search-icon`} />
            <Input 
              className={`${memberPrefix}-main-header-search-input`} 
              placeholder="请输入商品名称或条码"
              value={searchValue}
              onInput={this.onInput}
              placeholderClass={`${memberPrefix}-main-header-search-input-holder`}
            />
            {searchValue !== '' && (
              <View 
                className={`${memberPrefix}-main-header-search-scan ${memberPrefix}-main-header-search-mar`} 
                onClick={() => this.onInput({detail: {value: ''}})}  
              >
                <Image 
                  src="//net.huanmusic.com/weapp/icon_del.png" 
                  className={`${memberPrefix}-main-header-search-del`} 
                />
              </View>
            )}
          </View>
          <View 
            className={`${cssPrefix}-header-button`}
            onClick={() => this.onSuspensionHandle()}
          >
            {suspensionList.length > 0 && (
              <View className={`${cssPrefix}-header-suspension`}>{suspensionList.length}</View>
            )}
            挂单
          </View>
        </View>
        
        <View className={`${cssPrefix}-list-container`}>
          {this.renderLeft()}  
          {this.renderRight()}
        </View>
        <CartBar />
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
        <View 
          className={classnames(`${cssPrefix}-list-left-item`)}
          onClick={() => this.onNonBarcodeProductClick()}
        >
          无码商品
        </View>
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
          <ScrollView 
            scrollY={true}
            className={`${cssPrefix}-list-right ${cssPrefix}-list-right-container`}
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
            <View style="height: 100px" />
          </ScrollView>  
        </View>
      );
    } 
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ScrollView 
          scrollY={true}
          className={`${cssPrefix}-list-right ${cssPrefix}-list-right-container`}
        >
          {
            pureProductSearchList.map((product) => {
              return (
                <View    
                  id={`product${product.id}`}
                  key={product.id}
                >
                  <ProductComponent
                    product={product}
                  />  
                </View>
              );
            })
          }
        </ScrollView>  
      </View>
    );
  }
}

const mapState = (state: AppReducer.AppState) => {
  const productList = getProductList(state) || [];

  const productSearchList = getProductSearchList(state) || [];
  const pureProductSearchList: any[] = [];
  productSearchList.forEach((list) => {
    list.productList.forEach((item) => {
      pureProductSearchList.push(item);
    });
  });
  const selectProduct: any = getSelectProduct(state);

  return {
    productList,
    productSearchList,
    pureProductSearchList,
    selectProduct,
    productTypeList: getProductType(state),
    productCartList: getProductCartList(state),
    suspensionList: getSuspensionCartList(state)
  };
};

export default connect(mapState)(ProductOrder);