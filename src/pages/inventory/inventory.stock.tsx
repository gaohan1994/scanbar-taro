/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-17 17:59:49
 * 
 * @todo 盘点
 */
import Taro, { Config } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/product.less";
import "../style/member.less";
import "../style/inventory.less";
import CartBar from '../../component/cart/cart';
import { ProductAction } from '../../actions';
import { getProductSearchList, getSelectProduct, getProductType, getProductList } from '../../reducers/app.product';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import { ProductInterface } from '../../constants';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';
import productSdk from '../../common/sdk/product/product.sdk';
import HeaderInput from '../../component/header/header.input';
import ProductListView from '../../component/product/product.listview';
import TabsHeader from '../../component/layout/tabs.header';
import merge from 'lodash.merge';

const cssPrefix = 'product';

type Props = { 
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

class InventoryStock extends Taro.Component<Props, State> {
  config: Config = {
    navigationBarTitleText: '盘点'
  };
  
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
    productSdk.setSort(productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK);
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
      invariant(productTypeResult.code === ResponseCode.success, productTypeResult.msg || ' ');
      /**
       * @todo [刚进入界面显示全部商品]
       */
      this.fetchData(undefined as any);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public fetchData = async (type: ProductInterface.ProductTypeInfo) => {
    this.setState({ loading: true });
    let payload: ProductInterface.ProductInfoListFetchFidle = {
      status: 0,
    };
    if (type && type.id !== 999) {
      payload.type = `${type.id}`;
    }
    const result = await ProductAction.productOrderInfoList(payload);
    this.setState({ loading: false });
    return result;
  }

  public onNavToList = () => {
    Taro.navigateTo({
      url: `/pages/inventory/inventory.stock.list`
    });
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
  
  public onTypeChange = (type: ProductInterface.ProductTypeInfo) => {
    this.onTypeClick(type);
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
          className="inventory-input"
          placeholder="请输入商品名称或条码"
          value={searchValue}
          onInput={this.onInput}
          isRenderInputRight={true}
          inputRightClick={() => this.onInput({detail: {value: ''}})}
        >
          <View 
            className={'inventory-header-item'}
            onClick={() => this.onNavToList()}
          >
            <Image 
              src="//net.huanmusic.com/weapp/icon_record_inventory.png" 
              className={`inventory-header-item-stock`} 
            />
            <Text className="inventory-header-item-text">盘点记录</Text>
          </View>
        </HeaderInput>
        
        {this.renderTabs()}
        <View className={`${cssPrefix}-list-container ${cssPrefix}-list-container-inventory`}>
          {this.renderList()}
        </View>
        <CartBar sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK} />
      </View>
    );
  }

  private renderTabs = () => {
    const { productTypeList } = this.props;
    return (
      <TabsHeader
        tabs={productTypeList}
        onChange={(type) => this.onTypeChange(type)}
      />
    );
  }

  private renderList = () => {
    const { productList, pureProductSearchList } = this.props;
    const { searchValue, loading } = this.state;
    if (pureProductSearchList.length === 0 && searchValue === '') {
      return (
        <View className={`${cssPrefix}-list-right`}>
          <ProductListView
            loading={loading}
            productList={productList}
            className={`${cssPrefix}-list-right-container ${cssPrefix}-list-right-container-inventory`}
            sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK}
          />
        </View>
      );
    } 
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ProductListView
          productList={pureProductSearchList}
          className={`${cssPrefix}-list-right-container-search`}
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_STOCK}
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
  const productTypeList: any[] = merge([], getProductType(state));
  productTypeList.unshift({
    id: 999,
    name: '全部品类',
    title: '全部品类',
    createTime: '',
  } as any);
  return {
    productList,
    productSearchList,
    pureProductSearchList,
    selectProduct,
    productTypeList,
  };
};

export default connect(mapState)(InventoryStock);