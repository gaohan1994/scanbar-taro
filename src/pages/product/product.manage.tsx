/**
 * @Author: Ghan
 * @Date: 2019-11-15 11:17:25
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-08 15:04:53
 *
 * @todo [商品管理页面]
 */
import React from 'react'
import Taro from "@tarojs/taro";
import { View, Image, Input, ScrollView, Text } from "@tarojs/components";
import ScrollPagingView  from '../../component/product/product.listview.paging'
import "../style/product.less";
import "../style/member.less";
import "../../component/card/form.card.less";
import { ProductAction } from "../../actions";
import {
  ResponseCode,
  ProductInterface,
  ProductService
} from "../../constants/index";
import invariant from "invariant";
import { connect } from "@tarojs/redux";
import { AppReducer } from "../../reducers";
import {
  getProductManageList,
  getProductManageListIndexes,
  getProductType,
  getProductSupplier
} from "../../reducers/app.product";
// import ProductManageComponent from '../../component/product/product.manage';
import ProductComponent from "../../component/product/product";
import classnames from "classnames";
import productSdk from "../../common/sdk/product/product.sdk";
import merge from "lodash.merge";
import ButtonFooter from "../../component/button/button.footer";
import { debounce } from '../../common/util/common'
import { AtActivityIndicator } from "taro-ui";

const memberPrefix = "member";
const cssPrefix = "product";

let pageNum: number = 1
const pageSize: number = 20

interface Props {
  productList: ProductInterface.ProductInfo[];
  productListTotal: number;
  productType: Array<ProductInterface.ProductType>;
  productSupplier: Array<ProductInterface.ProductSupplier>;
}

interface State {
  selectVisible: boolean;
  selectTypeId: number[];
  selectSupplierId: number[];
  selectStatus: number[];
  searchValue: string;
  lastIsSearch: boolean;
  loading: boolean;
  refreshing: boolean;
  scrollTop: number
}

class ProductManage extends Taro.Component<Props, State> {

  // static ref = React.createRef()

  static config: Taro.Config = {
    navigationBarTitleText: "商品管理"
  };

  readonly state: State = {
    selectVisible: false,
    selectTypeId: [],
    selectSupplierId: [],
    selectStatus: [],
    searchValue: "",
    lastIsSearch: false,
    loading: false,
    refreshing: false,
    scrollTop: 0
  };

  // componentDidShow() {
  //   this.init();
  // }

  componentWillMount() {
    this.init()
  }

  public changeSelectVisible = (visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        selectVisible:
          typeof visible === "boolean" ? visible : !prevState.selectVisible
      };
    });
  };

   public changeAll = (key: string) => {
    const { productType, productSupplier } = this.props;
    this.setState(prevState => {
      const prevData = merge([], prevState[key]);
      let nextData: any[] = [];
      if (prevData.length === 0) {
        if (key === "selectTypeId") {
          nextData = productType.map(t => t.id);
        } else if (key === "selectSupplierId") {
          nextData = productSupplier.map(s => s.id);
        } else if (key === "selectStatus") {
          nextData = [0, 1];
        }
      }
      return {
        ...prevState,
        [key]: nextData
      };
    });
  };

  public changeSelectType = (type: ProductInterface.ProductType) => {
    this.setState(prevState => {
      const prevIds = merge([], prevState.selectTypeId);
      const index = prevIds.findIndex(p => p === type.id);
      if (index === -1) {
        prevIds.push(type.id);
      } else {
        prevIds.splice(index, 1);
      }
      return {
        ...prevState,
        selectTypeId: prevIds
      };
    });
  };

  public changeSelectSupplier = (
    supplier: ProductInterface.ProductSupplier
  ) => {
    this.setState(prevState => {
      const prevIds = merge([], prevState.selectSupplierId);
      const index = prevIds.findIndex(p => p === supplier.id);
      if (index === -1) {
        prevIds.push(supplier.id);
      } else {
        prevIds.splice(index, 1);
      }
      return {
        ...prevState,
        selectSupplierId: prevIds
      };
    });
  };

  public changeSelectStatus = (status: number) => {
    this.setState(prevState => {
      const prevIds = merge([], prevState.selectStatus);
      const index = prevIds.findIndex(p => p === status);
      if (index === -1) {
        prevIds.push(status);
      } else {
        prevIds.splice(index, 1);
      }
      return {
        ...prevState,
        selectStatus: prevIds
      };
    });
  };

  public reset = () => {
    this.setState({
      selectTypeId: [],
      selectSupplierId: [],
      selectStatus: []
    });
  };

  public onScanProduct = async () => {
    try {
      const result = await productSdk.scanProduct();      
      Taro.showLoading();
      if (result.code === ResponseCode.success) {
        // 说明有这个商品，去自己的库里查查看
        const { code, data } = await ProductService.productInfoScanGet({
          barcode: result.data.barcode
        });
        Taro.hideLoading();
        if (code === ResponseCode.success) {
          // 说明自己的库里也有这个商品跳转到详情
          Taro.navigateTo({
            url: `/pages/product/product.detail?id=${data.id}`
          });
          return;
        }
        Taro.showModal({
          title: "提示",
          content: `商品${result.data.barcode}不存在，是否现在建档？`,
          success: ({ confirm }) => {
            if (confirm) {
              Taro.navigateTo({
                url: `/pages/product/product.add?scanProduct=${JSON.stringify(
                  result.data
                )}`
              });
            }
          }
        });
        return;
      } else {
        Taro.hideLoading();
        throw new Error("没有找到对应的商品！");
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public resetScrollTop = (position?: number) => {    
    this.setState({
      scrollTop: position ? position : Math.random() * 0.00001
    },() => {
      console.log(this.state.scrollTop);
      
    })
  }

  public submit = async (page?: number, sort?: string) => {
    try {
      const { selectStatus, selectSupplierId, selectTypeId } = this.state;
      const {productList, productListTotal}  = this.props
      const currentPage = typeof page === "number" ? page : pageNum;
      this.changeSelectVisible(false);
      if (currentPage === 1) {
        this.resetScrollTop(0)
        if (this.state.refreshing === true) {
          return;
        }
        this.setState({refreshing: true});
      } else {
        if (this.state.loading === true) {
          return;
        }
        if (productList.length >= productListTotal) {
          Taro.showToast({
            title: "已经到底了",
            icon: "none"
          });
          return;
        }
        this.setState({loading: true});
      }
      Taro.showLoading();
      let payload: ProductInterface.ProductInfoListFetchFidle = {
        pageNum: page || pageNum,
        pageSize,
        orderByColumn : 'number desc'
      };
      if (selectStatus.length === 1) {
        payload.status = selectStatus[0];
      }
      if (selectSupplierId.length > 0) {
        payload.supplierId = selectSupplierId.join(",");
      }
      if (selectTypeId.length > 0) {
        payload.type = selectTypeId.join(",");
      }

      if(sort) {
        payload.orderByColumn = sort
      }
      const { success, result } = await ProductAction.productInfoList(payload);
      Taro.hideLoading();
      invariant(success, result || ResponseCode.error);
      pageNum = (page || pageNum) + 1
      this.setState({
        refreshing: false,
        loading: false
      })
    } catch (error) {
      this.setState({
        refreshing: false,
        loading: false,
      })
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public init = async () => {
    try {
      Taro.showLoading();
      // const { success, result } = await ProductAction.productInfoList({pageNum, pageSize});
      // invariant(success, result || ResponseCode.error);
      this.submit(1)

      const typeResult = await ProductAction.productInfoType();
      invariant(typeResult.code === ResponseCode.success, typeResult.msg);

      const supplierResult = await ProductAction.productInfoSupplier();
      invariant(
        supplierResult.code === ResponseCode.success,
        supplierResult.msg
      );

      Taro.hideLoading();
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  public searchProduct = async (page?: number) => {
    try {
      this.setState({lastIsSearch: true})
      const { searchValue } = this.state;
      const { productList, productListTotal } = this.props
      
      if (searchValue === "") {
        this.setState({lastIsSearch: false})
        this.submit(1)
        // const { success, result } = await ProductAction.productInfoList({pageNum: 1, pageSize});
        // invariant(success, result || ResponseCode.error);
        return;
      }

      const currentPage = typeof page === "number" ? page : pageNum;
      if (currentPage === 1) {
        this.resetScrollTop()
        if (this.state.refreshing === true) {
          return;
        } else {
          this.setState({refreshing: true});
        }
      } else {
        if (this.state.loading === true) {
          return;
        } 

        if (productList.length >= productListTotal) {
          Taro.showToast({
            title: "已经到底了",
            icon: "none"
          });
          return;
        }
        this.setState({loading: true});
        
      }
      Taro.showLoading();
      const payload: ProductInterface.ProductInfoListFetchFidle = {
        pageNum: page || pageNum,
        pageSize
      };
      payload.words = searchValue
      const { success, result } = await ProductAction.productInfoList(payload);
      invariant(success, result || ResponseCode.error);
      pageNum = (page || pageNum) + 1
      this.setState({
        refreshing: false,
        loading: false
      })
      Taro.hideLoading();
    } catch (error) {
      Taro.hideLoading();
      this.setState({
        refreshing: false,
        loading: false,
        lastIsSearch: false
      })
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };


  public onChangeValue = (e: any) => {    
    const value = e.detail.value;
    this.setState({ searchValue: value }, () => {
      this.searchProduct(1);
    });
    return value;
  };

  public onSelectClick = () => {
    this.changeSelectVisible(true);
  };

  public onAddClick = () => {
    this.resetScrollTop()
    Taro.navigateTo({ url: `/pages/product/product.add` });
  };

  public loadMore = () => {
    const { lastIsSearch } = this.state;    
    if (lastIsSearch === false) {
      this.submit();
    } else {
      this.searchProduct();
    }
  }

  public refresh = () => {
    const { lastIsSearch } = this.state;
    if (lastIsSearch === false) {
      this.submit(1);
    } else {
      this.searchProduct(1);
    }
  }

  render() {
    const { searchValue, loading, scrollTop,selectStatus, selectSupplierId,selectTypeId } = this.state;
    const { productList, productListTotal } = this.props;

    return (
      <View className="container">
        {this.renderSelectModal()}
        <View className={`${cssPrefix}-header`}>
          <View
            className={`${memberPrefix}-main-header-search ${cssPrefix}-header-search`}
          >
            <Image
              src="//net.huanmusic.com/weapp/icon_import.png"
              className={`${memberPrefix}-main-header-search-icon`}
            />
            <Input
              className={`${memberPrefix}-main-header-search-input`}
              placeholder="请输入商品名称或条码"
              value={searchValue}
              onInput={debounce(this.onChangeValue, 500)}
              placeholderClass={`${memberPrefix}-main-header-search-input-holder`}
            />
            <View
              onClick={() => this.onScanProduct()}
              className={`${memberPrefix}-main-header-search-scan ${memberPrefix}-main-header-search-mar`}
            >
              <Image
                src="//net.huanmusic.com/weapp/icon_commodity_scan.png"
                className={`${memberPrefix}-main-header-search-scan`}
              />
            </View>
          </View>
          <View
            className={`${cssPrefix}-header-item`}
            onClick={() => this.onSelectClick()}
          >
            <Image
              src="//net.huanmusic.com/weapp/icon_shaixuan.png"
              className={`${cssPrefix}-header-item-icon-select`}
            />
            <Text
              className={`${cssPrefix}-header-item-text ${cssPrefix}-header-item-text-select`}
            >
              筛选
            </Text>
          </View>
          <View
            className={`${cssPrefix}-header-item`}
            onClick={() => this.onAddClick()}
          >
            <Image
              src="//net.huanmusic.com/weapp/icon_tianjia.png"
              className={`${cssPrefix}-header-item-icon`}
            />
            <Text className={`${cssPrefix}-header-item-text`}>添加</Text>
          </View>
        </View>

        <View className={`${cssPrefix}-manage-list`}>
          {/* <ScrollPagingView 
            fetchProductList = {ProductAction.productInfoList}
            searchValue= {searchValue}
            productList = {productList}
            productListTotal= { productListTotal }
            selectStatus={selectStatus}
            selectSupplierId={selectSupplierId}
            selectTypeId={selectTypeId}
          /> */}
          <ScrollView
            scrollY={true}
            className={`${cssPrefix}-manage-list-container`}
            onScrollToUpper={this.refresh}
            onScrollToLower={this.loadMore}
            enableBackToTop={true}
            scrollTop={scrollTop}
            // onScroll={debounce((e) => {this.resetScrollTop(e.detail.scrollTop);console.log(e.detail.scrollTop)}, 500)}
          >
             {/* {productList.map(list => {
              const { data } = list;
              return (
                <View key={list.key}>
                  {this.renderSectionHeader(list)}
                  {data.map(item => {
                    return (
                      <ProductComponent
                        key={item.id}
                        product={item}
                        sort={
                          productSdk.reducerInterface.PAYLOAD_SORT
                            .PAYLOAD_MANAGE
                        }
                      />
                      // <ProductManageComponent key={item.id} product={item} />
                    );
                  })}
                </View>
              );
            })}  */}
            {productList.map(item => {
              return (
                <ProductComponent
                  key={item.id}
                  product={item}
                  sort={
                    productSdk.reducerInterface.PAYLOAD_SORT
                      .PAYLOAD_MANAGE
                  }
                />
              );
            })}
            {/* {loading && (
              <View className={`${memberPrefix}-loading`}>
                <AtActivityIndicator mode="center" />
              </View>
            )} */}
          </ScrollView>

          
        </View>
      </View>
    );
  }

  private renderSelectModal = () => {
    const {
      selectTypeId,
      selectSupplierId,
      selectStatus,
      selectVisible
    } = this.state;
    const { productSupplier, productType } = this.props;
    if (selectVisible) {
      return (
        <View className={`product-pay-member-layout-mask`}>
          <View
            className={`product-pay-member-layout-box product-pay-member-layout-container`}
            style="background-color: #ffffff;"
          >
            <Image
              src="//net.huanmusic.com/weapp/icon_del_1.png"
              className={`${cssPrefix}-select-header-close`}
              onClick={() => this.changeSelectVisible(false)}
            />
            <View className={`${cssPrefix}-select-header`}>筛选</View>
            <View className={`${cssPrefix}-select-content`}>
              {productType.length > 0 && (
                <View
                  className={`${cssPrefix}-select-content-item ${cssPrefix}-select-border`}
                >
                  <View className={`${cssPrefix}-select-content-item-title`}>
                    品类
                  </View>
                  <View className={`${cssPrefix}-select-content-item-buttons`}>
                    <View
                      onClick={() => this.changeAll("selectTypeId")}
                      className={classnames("component-form-button", {
                        [`${cssPrefix}-select-content-button`]: true,
                        "component-form-button-confirm":
                          selectTypeId.length === productType.length,
                        "component-form-button-cancel":
                          selectTypeId.length !== productType.length
                      })}
                    >
                      全部
                    </View>
                    {productType.map(type => {
                      return (
                        <View
                          key={type.id}
                          onClick={() => this.changeSelectType(type)}
                          className={classnames("component-form-button", {
                            [`${cssPrefix}-select-content-button`]: true,
                            "component-form-button-confirm": selectTypeId.some(
                              t => t === type.id
                            ),
                            "component-form-button-cancel": !selectTypeId.some(
                              t => t === type.id
                            )
                          })}
                        >
                          {type.name}
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              <View
                className={`${cssPrefix}-select-content-item ${cssPrefix}-select-border`}
              >
                <View className={`${cssPrefix}-select-content-item-title`}>
                  供应商
                </View>
                <View className={`${cssPrefix}-select-content-item-buttons`}>
                  <View
                    onClick={() => this.changeAll("selectSupplierId")}
                    className={classnames("component-form-button", {
                      [`${cssPrefix}-select-content-button`]: true,
                      "component-form-button-confirm":
                        selectSupplierId.length === productSupplier.length,
                      "component-form-button-cancel":
                        selectSupplierId.length !== productSupplier.length
                    })}
                  >
                    全部
                  </View>
                  {productSupplier.map(supplier => {
                    return (
                      <View
                        key={supplier.id}
                        onClick={() => this.changeSelectSupplier(supplier)}
                        className={classnames("component-form-button", {
                          [`${cssPrefix}-select-content-button`]: true,
                          "component-form-button-confirm": selectSupplierId.some(
                            t => t === supplier.id
                          ),
                          "component-form-button-cancel": !selectSupplierId.some(
                            t => t === supplier.id
                          )
                        })}
                      >
                        {supplier.name}
                      </View>
                    );
                  })}
                </View>
              </View>
              <View
                className={`${cssPrefix}-select-content-item ${cssPrefix}-select-border`}
              >
                <View className={`${cssPrefix}-select-content-item-title`}>
                  商品状态
                </View>
                <View className={`${cssPrefix}-select-content-item-buttons`}>
                  <View
                    onClick={() => this.changeAll("selectStatus")}
                    className={classnames("component-form-button", {
                      [`${cssPrefix}-select-content-button`]: true,
                      "component-form-button-confirm":
                        selectStatus.length === 2,
                      "component-form-button-cancel": selectStatus.length !== 2
                    })}
                  >
                    全部
                  </View>
                  {[0, 1].map(status => {
                    return (
                      <View
                        key={status}
                        onClick={() => this.changeSelectStatus(status)}
                        className={classnames("component-form-button", {
                          [`${cssPrefix}-select-content-button`]: true,
                          "component-form-button-confirm": selectStatus.some(
                            t => t === status
                          ),
                          "component-form-button-cancel": !selectStatus.some(
                            t => t === status
                          )
                        })}
                      >
                        {status === 0 ? "启用" : "禁用"}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
            <ButtonFooter
              buttons={[
                { title: "重置", type: "cancel", onPress: () => this.reset() },
                { title: "确定", type: "confirm", onPress: () => this.submit(1) }
              ]}
            />
          </View>
        </View>
      );
    }
    return <View />;
  };

  // private renderSectionHeader = (section: ProductInterface.IndexProducList) => {
  //   return (
  //     <View className={`${cssPrefix}-list-section`}>
  //       <View className={`${cssPrefix}-list-section-icon`} />
  //       <Text className={`${cssPrefix}-list-section-title`}>
  //         {section.title}
  //       </Text>
  //     </View>
  //   );
  // };
}

const select = (state: AppReducer.AppState) => {
  // const productManageList = getProductManageList(state);
  // const productList = getProductManageListIndexes(productManageList);
  return {
    productList: getProductManageList(state).data || [],
    productListTotal: getProductManageList(state).total || 0,
    productType: getProductType(state),
    productSupplier: getProductSupplier(state)
  };
};

export default connect(select)(ProductManage);
