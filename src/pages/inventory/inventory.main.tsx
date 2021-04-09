/**
 * @Author: Ghan
 * @Date: 2019-11-13 09:41:02
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-07-10 11:18:17
 *
 * @todo 收货
 */
import Taro, { Config } from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "../style/product.less";
import "../style/member.less";
import "../style/inventory.less";
import CartBar from "../../component/cart/cart";
import { ProductAction } from "../../actions";
import {
  getProductSearchList,
  getSelectProduct,
  getProductType,
  getProductList,
  getProductManageList, 
} from "../../reducers/app.product";

import { AppReducer } from "../../reducers";
import { connect } from "@tarojs/redux";
import { ProductInterface } from "../../constants";
import invariant from "invariant";
import { ResponseCode } from "../../constants/index";
import productSdk from "../../common/sdk/product/product.sdk";
import HeaderInput from "../../component/header/header.input";
import ProductListView from "../../component/product/product.listview";
// import ProductListView from "../../component/product/product.listview.paging";
import TabsHeader from "../../component/layout/tabs.header";
import merge from "lodash.merge";

const cssPrefix = "product";

type Props = {
  /**
   * @param {productList} 商品数据，商品在分类里
   * @type {ProductInterface.ProductList[]}
   * @memberof Props
   */
  productList: ProductInterface.ProductInfo[];
  productListTotal: number;
  // productSearchList: ProductInterface.ProductList[];
  // pureProductSearchList: ProductInterface.ProductInfo[];
  selectProduct: ProductInterface.ProductInfo;
  productTypeList: ProductInterface.ProductTypeInfo[];
};

type State = {
  /**
   * @param {currentType} 左边当前分类
   *
   * @type {ProductInterface.ProductTypeInfo}
   * @memberof State
   */
  currentType: ProductInterface.ProductTypeInfo;
  searchValue: string;
  loading: boolean;
};

let pageNum = 1
const pageSize = 20

class InventoryMain extends Taro.Component<Props> {
  config: Config = {
    navigationBarTitleText: "采购收货"
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
    this.setState({
      searchValue: ""
    });
    // ProductAction.productInfoEmptySearchList();
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
      // this.fetchData(undefined as any, 1);
      
      Object.keys(this.props.productTypeList).length !== 0 && this.changeCurrentType(this.props.productTypeList[0]);
      
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

  /**
   * @todo [点击菜单的时候修改当前菜单并跳转至对应商品]
   *
   * @memberof ProductOrder
   */
  public onTypeClick = (params: ProductInterface.ProductTypeInfo) => {
    this.onInput({ detail: { value: "" } });
    this.changeCurrentType(params);
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

  public onNavToList = () => {
    Taro.navigateTo({
      url: `/pages/inventory/inventory.list`
    });
  };

  public onTypeChange = (type: ProductInterface.ProductTypeInfo) => {
    this.onTypeClick(type);
  };

  render() {
    const { searchValue } = this.state;
    return (
      <View className={`container ${cssPrefix}`}>
        <HeaderInput
          className="inventory-input"
          placeholder="请输入商品名称或条码"
          value={searchValue}
          onInput={this.onInput}
          isRenderInputRight={true}
          inputRightClick={() => this.onInput({ detail: { value: "" } })}
        >
          <View
            className={"inventory-header-item"}
            onClick={() => this.onNavToList()}
          >
            <Image
              src="//net.huanmusic.com/weapp/icon_record.png"
              className={`inventory-header-item-purchase`}
            />
            <Text className="inventory-header-item-text">收货记录</Text>
          </View>
        </HeaderInput>
        {this.renderTabs()}
        <View
          className={`${cssPrefix}-list-container ${cssPrefix}-list-container-inventory`}
        >
          {this.renderList()}
        </View>
        <CartBar
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE}
        />
      </View>
    );
  }

  private renderTabs = () => {
    const { productTypeList } = this.props;
    return (
      <TabsHeader
        tabs={productTypeList}
        onChange={type => this.onTypeChange(type)}
      />
    );
  };

  private renderList = () => {
    // const { productList, pureProductSearchList, productListTotal} = this.props;
    const { productList, productListTotal} = this.props;
    const { searchValue, loading } = this.state;
    // if (searchValue === "") {
    // if (pureProductSearchList.length === 0 && searchValue === "") {
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ProductListView
          page={pageNum}
          loading={loading}
          productList={productList}
          productListTotal={productListTotal}
          className={`${cssPrefix}-list-right-container ${cssPrefix}-list-right-container-inventory`}
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE}
          onScrollToLower={this.loadMore}
        />
      </View>
    );
    // }
    // return (
    //   <View className={`${cssPrefix}-list-right`}>
    //     <ProductListView
    //       // productList={pureProductSearchList}
    //       // productListTotal={pureProductSearchListTotal}
    //       productList={productList}
    //       productListTotal={productListTotal}
    //       className={`${cssPrefix}-list-right-container-search`}
    //       sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE}
    //       onScrollToLower={this.loadMore}
    //     />
    //   </View>
    // );
  };
}

const mapState = (state: AppReducer.AppState) => {
  const productList = getProductList(state) || [];

  const productSearchList = getProductSearchList(state) || [];
  const pureProductSearchList: any[] = productSearchList;
  const selectProduct: any = getSelectProduct(state);
  const productTypeList: any[] = merge([], getProductType(state));
  productTypeList.unshift({
    id: 999,
    name: "全部品类",
    title: "全部品类",
    createTime: ""
  } as any);
  return {
    // productList,
    // productSearchList,
    // pureProductSearchList,
    productList: getProductManageList(state).data || [],
    productListTotal: getProductManageList(state).total || 0,
    selectProduct,
    productTypeList
  };
};

export default connect(mapState)(InventoryMain);
