/**
 * @Author: Ghan
 * @Date: 2019-11-13 09:41:02
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-04-28 15:01:39
 *
 * @todo 开单页面
 */
import Taro, { Config } from "@tarojs/taro";
import { View, ScrollView, Text } from "@tarojs/components";
import "../style/product.less";
import "../style/member.less";
import CartBar from "../../component/cart/cart";
import { ProductAction } from "../../actions";
import {
  getProductSearchList,
  getSelectProduct,
  getProductType,
  getProductList,
  getProductManageList
} from "../../reducers/app.product";
import { AppReducer } from "../../reducers";
import { connect } from "@tarojs/redux";
import { ProductInterface } from "../../constants";
import classnames from "classnames";
import invariant from "invariant";
import { ResponseCode } from "../../constants/index";
import productSdk from "../../common/sdk/product/product.sdk";
import {
  getProductCartList,
  getSuspensionCartList,
  ProductSDKReducer
} from "../../common/sdk/product/product.sdk.reducer";
import { ProductCartInterface } from "../../common/sdk/product/product.sdk";
import HeaderInput from "../../component/header/header.input";
import ButtonCostom from "../../component/button/button";
import ProductListView from "../../component/product/product.listview";
import merge from "lodash.merge";

const cssPrefix = "product";

interface Props {
  /**
   * @param {productList} 商品数据，商品在分类里
   *
   * @type {ProductInterface.ProductList[]}
   * @memberof Props
   */
  productList: ProductInterface.ProductInfo[];
  productListTotal: number;
  // productSearchList: ProductInterface.ProductList[];
  // pureProductSearchList: ProductInterface.ProductInfo[];
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
  shareProduct: ProductInterface.ProductInfo & {
    shareImagePath: string;
    path: string;
    appId: string;
  };
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


let pageNum = 1
const pageSize = 20

class ProductOrder extends Taro.Component<Props, State> {
  config: Config = {
    navigationBarTitleText: "开单"
  };

  readonly state: State = {
    currentType: {
      name: "全部分类",
      id: 999,
      createTime: ""
    },
    searchValue: "",
    loading: false
  };

  componentDidShow() {
    this.init();
  }

  public changeCurrentType = (
    typeInfo: ProductInterface.ProductTypeInfo,
    fetchProduct: boolean = true
  ) => {
    this.setState({ currentType: typeInfo }, async () => {
      if (fetchProduct) {
        this.fetchData(typeInfo, 1);
      }
    });
  };

  public init = async (): Promise<void> => {
    try {
      const productTypeResult = await ProductAction.productInfoType();
      invariant(
        productTypeResult.code === ResponseCode.success,
        productTypeResult.msg || " "
      );
      // const { data } = productTypeResult;
      // const firstType = data[0] || {};
      // Object.keys(firstType).length !== 0 && this.changeCurrentType(firstType);

      Object.keys(this.props.productTypeList).length !== 0 && this.changeCurrentType(this.props.productTypeList[0]);
      
      // this.fetchData(undefined as any, 1)

      // const { selectProduct } = this.props;
      // if (selectProduct !== undefined) {
      //   productSdk.manage({
      //     type: productSdk.productCartManageType.ADD,
      //     product: selectProduct
      //   });
      //   setTimeout(() => {
      //     store.dispatch({
      //       type: ProductInterfaceMap.reducerInterfaces.SET_SELECT_PRODUCT,
      //       payload: { selectProduct: undefined }
      //     });
      //   }, 100);
      // }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public fetchData = async (type: ProductInterface.ProductTypeInfo, page?: number) => {
    try{
      const { productList, productListTotal} =  this.props
      const currentPage = page  || pageNum
      
      if(currentPage !== 1){
        if(this.state.loading) {
          return
        }
        if ( productList.length >= productListTotal) {
          return
        }
        this.setState({ loading: true });
      }
      
      Taro.showLoading()
      
      
      let payload: ProductInterface.ProductInfoListFetchFidle = {
        pageNum: currentPage,
        pageSize,
        status: 0
      };

      if (type && type.id !== 999) {
        payload.type = `${type.id}`;
      }

      const result = await ProductAction.productOrderInfoList(payload);
      Taro.hideLoading()
      this.setState({ loading: false });
      invariant(result.code === ResponseCode.success, result.msg || " ")
      if (typeof page === "number") {
        pageNum = page + 1;
      } else {
        pageNum += 1;
      }
      return result;

    } catch (error) {
      Taro.hideLoading()
      this.setState({ loading: false });
      Taro.showToast({
        title: error.message,
        icon: "none"
      })
    }
  };

  public searchData = async (page?: number) => {

    const { searchValue, currentType } = this.state
    try {
      if (!searchValue) {
        /**
         * @todo 如果输入的是空则清空搜索
         */
        // ProductAction.productInfoEmptySearchList();
        this.fetchData(currentType, 1)
        return
      }
      const { productList, productListTotal} =  this.props
      const currentPage = page || pageNum
      if(currentPage !== 1) {
        if(this.state.loading) {
          return
        }
        if (productList.length >= productListTotal) {
          return
        }
      }

     

      Taro.showLoading();
      this.setState({ loading: true });
      const payload: ProductInterface.ProductInfoGetListFetchFidle = {
        pageNum: currentPage,
        pageSize,
        words: searchValue,
      }
      // if(currentType && currentType.id !== 999) {
      //   payload.type = currentType.id
      // }
      const { success, result } = await ProductAction.productInfoSearchList(payload);
      Taro.hideLoading();
      this.setState({ loading: false });
      invariant(success, result || ResponseCode.error);
      if (typeof page === "number") {
        pageNum = page + 1;
      } else {
        pageNum += 1;
      }
    } catch (error) {
      this.setState({ loading: false });
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public loadMore = () => {
    const { searchValue, currentType } = this.state
    if(!searchValue) {      
      this.fetchData(currentType)
      return
    }
    this.searchData()
  }

  public onNonBarcodeProductClick = () => {
    const product: any = {
      id: `${productSdk.nonBarcodeKey}${new Date().getTime()}`
    };
    productSdk.manage({
      type: productSdk.productCartManageType.ADD,
      product
    });
  };

  /**
   * @todo [点击菜单的时候修改当前菜单并跳转至对应商品]
   *
   * @memberof ProductOrder
   */
  public onTypeClick = (params: ProductInterface.ProductTypeInfo) => {
    this.onInput({ detail: { value: "" } });
    this.changeCurrentType(params);
  };

  public onSuspensionHandle = () => {
    const { productCartList } = this.props;
    if (productCartList.length > 0) {
      productSdk.suspensionCart();
    } else {
      Taro.navigateTo({
        url: `/pages/product/product.suspension`
      });
    }
  };

  /**
   * @todo 绑定输入事件
   *
   * @memberof ProductOrder
   */
  public onInput = ({ detail }: any) => {
    this.setState({ searchValue: detail.value }, () => {
      this.searchData(1);
    });
  };

  render() {
    const { searchValue } = this.state;
    const { suspensionList } = this.props;
    return (
      <View className={`container ${cssPrefix}`}>
        <HeaderInput
          placeholder="请输入商品名称或条码"
          value={searchValue}
          onInput={this.onInput}
          isRenderInputRight={true}
          inputRightClick={() => this.onInput({ detail: { value: "" } })}
        >
          <ButtonCostom
            title="挂单"
            onClick={() => this.onSuspensionHandle()}
            badge={suspensionList.length}
          />
        </HeaderInput>

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
    const { productTypeList } = this.props;
    return (
      <ScrollView scrollY={true} className={`${cssPrefix}-list-left`}>
        <View
          className={classnames(`${cssPrefix}-list-left-item`)}
          onClick={() => this.onNonBarcodeProductClick()}
        >
          无码商品
        </View>
        {productTypeList && productTypeList.length > 0 ? (
          productTypeList.map(type => {
            return (
              <View
                key={type.id}
                className={classnames(`${cssPrefix}-list-left-item`, {
                  [`${cssPrefix}-list-left-item-active`]:
                    !searchValue &&
                    type.id === currentType.id
                })}
                onClick={() => this.onTypeClick(type)}
              >
                {!searchValue &&
                  type.id === currentType.id && (
                    <View
                      className={`${cssPrefix}-list-left-item-active-bge`}
                    />
                  )}
                {type.name}
              </View>
            );
          })
        ) : (
          <View />
        )}
      </ScrollView>
    );
  };

  private renderRight = () => {

    const { productList, productListTotal } = this.props;
    const { currentType, searchValue, loading } = this.state;
    // if (pureProductSearchList.length === 0 && searchValue === "") {
      return (
        <View className={`${cssPrefix}-list-right`}>
          <View
            className={`${cssPrefix}-list-right-header product-component-section-header-height`}
          >
            <View className={`${cssPrefix}-list-right-header-bge`} />
            <Text className={`${cssPrefix}-list-right-header-text`}>
              {currentType.name}
            </Text>
          </View>
          <ProductListView
            loading={loading}
            page={pageNum}
            productList={productList}
            productListTotal={productListTotal}
            className={`${cssPrefix}-list-right-container${searchValue ? '-search' : ''}`}
            onScrollToLower={this.loadMore}
          >
            {productList.length === 0 && pageNum !== 1? (
            <View className={`${cssPrefix}-search-empty`}>
              <View className={`${cssPrefix}-search-empty-img`} />
              <View className={`${cssPrefix}-search-empty-text`}>
                还没有商品，快去新增
              </View>
              <View
                onClick={() => {
                  Taro.navigateTo({
                    url: `/pages/product/product.add`
                  });
                }}
                className={`${cssPrefix}-search-empty-button`}
              >
                去建档
              </View>
            </View>
          ) : (
            <View />
          )}
            </ProductListView>
        </View>
    );
  };
}

const mapState = (state: AppReducer.AppState) => {
  // const productList = getProductList(state) || [];

  // const productSearchList = getProductSearchList(state) || [];
  // const pureProductSearchList: any[] = productSearchList;
  const selectProduct: any = getSelectProduct(state);
  const productTypeList: any[] =  merge([], getProductType(state));
  const shareProduct: any = state.product.shareProduct
  productTypeList.unshift({
    id: 999,
    name: "全部品类",
    title: "全部品类",
    createTime: ""
  } as any);

  return {
    productList: getProductManageList(state).data || [],
    productListTotal: getProductManageList(state).total || 0,
    selectProduct,
    productTypeList,
    productCartList: getProductCartList(state),
    suspensionList: getSuspensionCartList(state),
    shareProduct
  };
};

export default connect(mapState)(ProductOrder);
