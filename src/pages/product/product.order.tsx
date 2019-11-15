/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-14 11:06:11
 * 
 * @todo 开单页面
 */
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text } from '@tarojs/components';
import "./style/product.less";
import "../member/style/member.less";
import CartBar from '../../component/cart/cart';
import { ProductAction } from '../../actions';
import { getProductList, getProductSearchList } from '../../reducers/app.product';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import { ProductInterface } from '../../constants';
import classnames from 'classnames';
import ProductComponent from '../../component/product/product';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';

let ItemHeight: number = -1;

const memberPrefix = 'member';
const cssPrefix = 'product';

interface Props { 
  /**
   * @param {productList} 商品数据，商品在分类里
   *
   * @type {ProductInterface.ProductList[]}
   * @memberof Props
   */
  productList: ProductInterface.ProductList[];
  /**
   * @param {pureProductList} 所有商品去掉分类之后合成的数组
   *
   * @type {ProductInterface.ProductInfo[]}
   * @memberof Props
   */
  pureProductList: ProductInterface.ProductInfo[];
  productSearchList: ProductInterface.ProductList[];
  pureProductSearchList: ProductInterface.ProductInfo[];
}

interface State {
  /**
   * @param {currentType} 左边当前分类
   *
   * @type {ProductInterface.ProductTypeInfo}
   * @memberof State
   */
  currentType: ProductInterface.ProductTypeInfo;
  /**
   * @param {scrollProductId} 右边滑动的id
   *
   * @type {number}
   * @memberof State
   */
  scrollProductId: number;
  searchValue: string;                            
}

class ProductOrder extends Taro.Component<Props, State> {

  readonly state: State = {
    currentType: {
      name: '',
      id: 0,
      createTime: ''
    },
    scrollProductId: -1,
    searchValue: ''
  };

  componentDidShow () {
    this.init();
  }

  public changeCurrentType = (typeInfo: ProductInterface.ProductTypeInfo) => {
    this.setState({ currentType: typeInfo });
  }

  public changeScrollProductId = (id: number) => {
    this.setState({ scrollProductId: id });
  }

  public init = async (): Promise<void> => {
    try {
      const { success, result } = await ProductAction.productInfoGetList();
      invariant(success, result || ResponseCode.error);
      const { rows }: { rows: ProductInterface.ProductList[] } = result;
      if (rows.length > 0) {
        const firstType = rows[0];
        this.changeCurrentType(firstType.typeInfo);
      }
      setTimeout(() => {
        this.initItemHeight();
      }, 100);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public fetchData = () => {
    ProductAction.productInfoGetList();
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
        const { success, result } = await ProductAction.productInfoSearchList({words: searchValue});
        invariant(success, result || ResponseCode.error);
        console.log('result: ', result);
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public getScrollProductId = (productList: ProductInterface.ProductInfo[]) => {
    return productList.length > 0 
      ? productList[0]
        ? productList[0].id
        : -1
      : -1;
  }

  /**
   * @todo [点击菜单的时候修改当前菜单并跳转至对应商品]
   *
   * @memberof ProductOrder
   */
  public onTypeClick = (params: ProductInterface.ProductList) => {
    const { typeInfo, productList } = params;
    this.onInput({detail: {value: ''}});
    this.changeCurrentType(typeInfo);
    this.changeScrollProductId(this.getScrollProductId(productList));
  }

  public initItemHeight = () => {
    if (ItemHeight === -1) {
      const query = Taro.createSelectorQuery().in(this.$scope);
      query
        .select('.product-component-base1')
        .boundingClientRect((rect: any) => {
          ItemHeight = rect.height;
        })
        .exec();
    }
  }
  
  public getItemHeight = async (): Promise<number> => {
    if (ItemHeight !== -1) {
      return new Promise((resolve) => {
        resolve(ItemHeight);
      });
    } else {
      return new Promise((resolve) => {
        const query = Taro.createSelectorQuery().in(this.$scope);
        query
          .select('.product-component-base1')
          .boundingClientRect((rect: any) => {
            ItemHeight = rect.height;
            resolve(rect.height);
          })
          .exec();
      });
    }
  }

  /**
   * @todo [监听滚动并设置跳转事件]
   *
   * @memberof ProductOrder
   */
  public onScroll = async (event: any) => {
    const { target: { scrollTop } } = event;
    const { currentType } = this.state;
    const { pureProductList, productList } = this.props;

    const ProductItemHeight = await this.getItemHeight();
    /**
     * @todo [index] 根据高度判断滑动到第几个item
     */
    const index: number = Math.ceil(scrollTop / ProductItemHeight);
    const currentItem = pureProductList[index] || {};
    if (currentItem && currentItem.id && currentItem.type && currentType.id !== currentItem.type) {
      const currentList = productList.find((l) => l.typeInfo.id === currentItem.type);
      if (currentList !== undefined) {
        this.changeCurrentType(currentList.typeInfo);
      }
    }
  }

  /**
   * @todo 绑定输入事件
   *
   * @memberof ProductOrder
   */
  public onInput = ({detail}: any) => {
    console.log('detail: ', detail);
    this.setState({searchValue: detail.value}, () => {
      this.searchData();
    });
  }

  render () {
    const { searchValue } = this.state;
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
          </View>
          <View className={`${cssPrefix}-header-button`}>无码商品</View>
        </View>
        
        <View className={`${cssPrefix}-list-container container`}>
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
    const { productList, pureProductSearchList } = this.props;
    return (
      <ScrollView 
        scrollY={true}
        className={`${cssPrefix}-list-left`}
      >
        {
          productList && productList.length > 0
            ? productList.map((list) => {
              
              return (
                <View 
                  key={list.typeInfo.id}
                  className={classnames(`${cssPrefix}-list-left-item`, {
                    [`${cssPrefix}-list-left-item-active`]: searchValue === '' && pureProductSearchList.length === 0 && list.typeInfo.id === currentType.id
                  })}
                  onClick={() => this.onTypeClick(list)}
                >
                  {searchValue === '' && pureProductSearchList.length === 0 && list.typeInfo.id === currentType.id && (
                    <View className={`${cssPrefix}-list-left-item-active-bge`} />
                  )}
                  {list.typeInfo.name}
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
    const { currentType, scrollProductId, searchValue } = this.state;

    if (pureProductSearchList.length === 0 && searchValue === '') {
      return (
        <View className={`${cssPrefix}-list-right`}>
          <View className={`${cssPrefix}-list-right-header`}>
            <View className={`${cssPrefix}-list-right-header-bge`}/>
            <Text className={`${cssPrefix}-list-right-header-text`}>{currentType.name}</Text>
          </View>
          <ScrollView 
            scrollY={true}
            className={`${cssPrefix}-list-right ${cssPrefix}-list-right-container`}
            scrollIntoView={`product${scrollProductId}`}
            onScroll={this.onScroll}
          >
            {
              productList && productList.length > 0
                ? productList.map((list) => {
                  return (
                    <View key={list.typeInfo.id}>
                      {
                        list.productList.map((product) => {
                          return (
                            <View    
                              id={`product${product.id}`}
                              className="product-component-base1"
                              key={product.id}
                            >
                              <ProductComponent
                                product={product}
                              />  
                            </View>
                          );
                        })
                      }
                    </View>
                  );
                })
                : <View />
            }
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
                  className="product-component-base1"
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
  const pureProductList: ProductInterface.ProductInfo[] = [];
  productList.forEach((list) => {
    list.productList.forEach((item) => {
      pureProductList.push(item);
    });
  });

  const productSearchList = getProductSearchList(state) || [];
  const pureProductSearchList: any[] = [];
  productSearchList.forEach((list) => {
    list.productList.forEach((item) => {
      pureProductSearchList.push(item);
    });
  });

  return {
    productList,
    pureProductList,
    productSearchList,
    pureProductSearchList,
  };
};

export default connect(mapState)(ProductOrder);