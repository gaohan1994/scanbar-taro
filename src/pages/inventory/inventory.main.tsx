/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-01-13 15:47:18
 * 
 * @todo 进货
 */
import Taro from '@tarojs/taro';
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

class InventoryMain extends Taro.Component<Props> {

  readonly state: State = {
    currentType: {
      name: '',
      id: 0,
      createTime: ''
    },
    searchValue: '',
    loading: false,
  };
  
  componentDidMount () {
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
      const { data } = productTypeResult;
      const firstType = data[0] || {};
      this.changeCurrentType(firstType);
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

  public onNavToList = () => {
    Taro.navigateTo({
      url: `/pages/inventory/inventory.list`
    });
  }

  public onTypeChange = (type: ProductInterface.ProductTypeInfo) => {
    this.onTypeClick(type);
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
              className={`inventory-header-item-purchase`} 
            />
            <Text className="inventory-header-item-text">进货纪录</Text>
          </View>
        </HeaderInput>
        {this.renderTabs()}
        <View className={`${cssPrefix}-list-container ${cssPrefix}-list-container-inventory`}>
          {this.renderList()}
        </View>
        <CartBar sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE} />
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
            sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE}
          />
        </View>
      );
    } 
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ProductListView
          productList={pureProductSearchList}
          className={`${cssPrefix}-list-right-container-search`}
          sort={productSdk.reducerInterface.PAYLOAD_SORT.PAYLOAD_PURCHASE}
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

export default connect(mapState)(InventoryMain);