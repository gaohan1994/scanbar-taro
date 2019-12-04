/**
 * @Author: Ghan 
 * @Date: 2019-11-15 11:17:25 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-12-03 14:06:06
 * 
 * @todo [商品管理页面]
 */
import Taro from '@tarojs/taro';
import { View, Image, Input, ScrollView, Text } from '@tarojs/components';
import "./style/product.less";
import "../member/style/member.less";
import { ProductAction } from '../../actions';
import { ResponseCode, ProductInterface, ProductService } from '../../constants/index';
import invariant from 'invariant';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getProductManageList, getProductManageListIndexes, getProductType, getProductSupplier } from '../../reducers/app.product';
import ProductManageComponent from '../../component/product/product.manage';
import { AtFloatLayout, AtButton } from 'taro-ui';
import classnames from 'classnames';
import productSdk from '../../common/sdk/product/product.sdk';

const memberPrefix = 'member';
const cssPrefix = 'product';

interface Props { 
  productIndexList: ProductInterface.IndexProducList[];
  productType: Array<ProductInterface.ProductType>;
  productSupplier: Array<ProductInterface.ProductSupplier>;
}

interface State {
  selectVisible: boolean;
  selectTypeId: number;
  selectSupplierId: number;
  selectStatus: number;
  searchValue: string;
}

class ProductManage extends Taro.Component<Props, State> {

  static config: Taro.Config = {
    navigationBarTitleText: '商品管理'
  };

  readonly state: State = {
    selectVisible: false,
    selectTypeId: -1,
    selectSupplierId: -1,
    selectStatus: -1,
    searchValue: '',
  };

  componentDidShow () {
    this.init();
  }

  public changeSelectVisible = (visible?: boolean) => {
    this.setState(prevState => {
      return {
        ...prevState,
        selectVisible: typeof visible === 'boolean' ? visible : !prevState.selectVisible
      };
    });
  }

  public onChangeValue = (e: any) => {
    const value = e.detail.value;
    this.setState({ searchValue: value }, () => {
      this.searchProduct();
    });
    return value;
  }

  public changeSelectType = (type: ProductInterface.ProductType) => {
    this.setState({selectTypeId: type.id});
  }

  public changeSelectSupplier = (supplier: ProductInterface.ProductSupplier) => {
    this.setState({selectSupplierId: supplier.id});
  }

  public changeSelectStatus = (status: number) => {
    this.setState({selectStatus: status});
  }

  public reset = () => {
    this.setState({
      selectTypeId: -1,
      selectSupplierId: -1,
      selectStatus: -1
    });
  }

  public onScanProduct = async () => {
    try {
      const result = await productSdk.scanProduct();
      Taro.showLoading();
      if (result.code === ResponseCode.success) {
        // 说明有这个商品，去自己的库里查查看
        const { code, data } = await ProductService.productInfoScanGet({barcode: result.data.barcode});
        Taro.hideLoading();
        if (code === ResponseCode.success) {
          // 说明自己的库里也有这个商品跳转到详情
          Taro.navigateTo({
            url: `/pages/product/product.detail?id=${data.id}`
          });
          return;
        }
        Taro.showModal({
          title: '提示',
          content: `商品${result.data.barcode}不存在，是否现在建档？`,
          success: ({confirm}) => {
            if (confirm) {
              Taro.navigateTo({
                url: `/pages/product/product.add?scanProduct=${JSON.stringify(result.data)}`
              });
            }
          }
        });
        return;
      } else {
        Taro.hideLoading();
        throw new Error('没有找到对应的商品！');
      }
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public submit = async () => {
    try {
      const { selectStatus, selectSupplierId, selectTypeId } = this.state;
      this.changeSelectVisible(false);
      Taro.showLoading();
      let payload: ProductInterface.ProductInfoListFetchFidle = {};
      if (selectStatus !== -1) {
        payload.status = selectStatus;
      }
      if (selectSupplierId !== -1) {
        payload.supplierId = selectSupplierId;
      }
      if (selectTypeId !== -1) {
        payload.type = selectTypeId;
      }
      const { success, result } = await ProductAction.productInfoList(payload);
      Taro.hideLoading();
      invariant(success, result || ResponseCode.error);
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public init = async () => {
    try {
      Taro.showLoading();
      const { success, result } = await ProductAction.productInfoList();
      invariant(success, result || ResponseCode.error);

      const typeResult = await ProductAction.productInfoType();
      invariant(typeResult.code === ResponseCode.success, typeResult.msg);

      const supplierResult = await ProductAction.productInfoSupplier();
      invariant(supplierResult.code === ResponseCode.success, supplierResult.msg);

      Taro.hideLoading();
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public searchProduct = async () => {
    try {
      const { searchValue } = this.state; 
      if (searchValue === '') {
        /**
         * @todo [如果搜索是''那么回归查询全部]
         */
        const { success, result } = await ProductAction.productInfoList();
        invariant(success, result || ResponseCode.error);
        return;
      }
      const payload: ProductInterface.ProductInfoListFetchFidle = {
        name: searchValue
      };
      const { success, result } = await ProductAction.productInfoList(payload);
      invariant(success, result || ResponseCode.error);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onSelectClick = () => {
    this.changeSelectVisible(true);
  }

  public onAddClick = () => {
    Taro.navigateTo({url: `/pages/product/product.add`});
  }

  render () {
    const { searchValue } = this.state;
    const { productIndexList } = this.props;
    return (
      <View className="container">
        {this.renderSelectModal()}
        <View className={`${cssPrefix}-header`}>
          <View className={`${memberPrefix}-main-header-search ${cssPrefix}-header-search`}>
            <Image src="//net.huanmusic.com/weapp/icon_import.png" className={`${memberPrefix}-main-header-search-icon`} />
            <Input
              className={`${memberPrefix}-main-header-search-input`} 
              placeholder="请输入商品名称或条码"
              value={searchValue}
              onInput={this.onChangeValue}
              placeholderClass={`${memberPrefix}-main-header-search-input-holder`}
            />
            <View
              onClick={() => this.onScanProduct()}
              className={`${memberPrefix}-main-header-search-scan`} 
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
            <Image src="//net.huanmusic.com/weapp/icon_shaixuan.png" className={`${cssPrefix}-header-item-icon`} />
            <Text className={`${cssPrefix}-header-item-text`}>筛选</Text>
          </View>
          <View
            className={`${cssPrefix}-header-item`}
            onClick={() => this.onAddClick()}
          >
            <Image src="//net.huanmusic.com/weapp/icon_tianjia.png" className={`${cssPrefix}-header-item-icon`} />
            <Text className={`${cssPrefix}-header-item-text`}>添加</Text>
          </View>
        </View>

        <View className={`${cssPrefix}-manage-list`}>
          <ScrollView
            scrollY={true}
            className={`${cssPrefix}-manage-list-container`}
          >
            {
              productIndexList.map((list) => {
                const { data } = list;
                return (
                  <View key={list.key}>
                    {this.renderSectionHeader(list)}
                    {
                      data.map((item) => {
                        return (
                          <ProductManageComponent key={item.id} product={item} />
                        );
                      })
                    }  
                  </View>
                );
              })
            }
          </ScrollView>
        </View>
      </View>
    );
  }

  private renderSelectModal = () => {
    const { selectTypeId, selectSupplierId, selectStatus, selectVisible } = this.state;
    const { productSupplier, productType } = this.props;
    return (
      <AtFloatLayout
        isOpened={selectVisible}
        onClose={() => this.changeSelectVisible(false)}
      >
        <View className={`${cssPrefix}-select-header`}>
          <View 
            className={`${cssPrefix}-select-header-close`}
            onClick={() => this.changeSelectVisible(false)}
          >
            <Image 
              className={`${cssPrefix}-select-header-close-image`} 
              src="//net.huanmusic.com/weapp/icon_del.png" 
            />
          </View>
          筛选
        </View>
        <View className={`${cssPrefix}-select-content`}>
          <View className={`${cssPrefix}-select-content-item ${cssPrefix}-select-border`}>
            <View className={`${cssPrefix}-select-content-item-title`}>品类</View>
            <View className={`${cssPrefix}-select-content-item-buttons`}>
              {
                productType.map((type) => {
                  return (
                    <AtButton
                      key={type.id}
                      type="primary"
                      onClick={() => this.changeSelectType(type)}
                      className={classnames(
                        'product-manage-select-modal-button', 
                        {
                          'product-manage-select-modal-button-confirm': selectTypeId === type.id,
                          'product-manage-select-modal-button-cancel': selectTypeId !== type.id,
                        }
                      )}
                    >
                      {type.name}
                    </AtButton>
                  );
                })
              }
            </View>
          </View>
          <View className={`${cssPrefix}-select-content-item ${cssPrefix}-select-border`}>
            <View className={`${cssPrefix}-select-content-item-title`}>供应商</View>
            <View className={`${cssPrefix}-select-content-item-buttons`}>
              {
                productSupplier.map((supplier) => {
                  return (
                    <AtButton
                      key={supplier.id}
                      type="primary"
                      onClick={() => this.changeSelectSupplier(supplier)}
                      className={classnames(
                        'product-manage-select-modal-button', 
                        {
                          'product-manage-select-modal-button-confirm': selectSupplierId === supplier.id,
                          'product-manage-select-modal-button-cancel': selectSupplierId !== supplier.id,
                        }
                      )}
                    >
                      {supplier.name}
                    </AtButton>
                  );
                })
              }
            </View>
          </View>
          <View className={`${cssPrefix}-select-content-item ${cssPrefix}-select-border`}>
            <View className={`${cssPrefix}-select-content-item-title`}>商品状态</View>
            <View className={`${cssPrefix}-select-content-item-buttons`}>
              <AtButton
                type="primary"
                onClick={() => this.changeSelectStatus(0)}
                className={classnames(
                  'product-manage-select-modal-button', 
                  {
                    'product-manage-select-modal-button-confirm': selectStatus === 0,
                    'product-manage-select-modal-button-cancel': selectStatus !== 0,
                  }
                )}
              >
                启用
              </AtButton>
              <AtButton
                type="primary"
                onClick={() => this.changeSelectStatus(1)}
                className={classnames(
                  'product-manage-select-modal-button', 
                  {
                    'product-manage-select-modal-button-confirm': selectStatus === 1,
                    'product-manage-select-modal-button-cancel': selectStatus !== 1
                  }
                )}
              >
                停用
              </AtButton>
            </View>
          </View>
          
          <View className={`${cssPrefix}-select-content-item-buttons ${cssPrefix}-select-form`}>
            <AtButton
              type="primary"
              onClick={() => this.reset()}
              className={`product-manage-select-modal-button-reset`}
            >
              重置
            </AtButton>
            <AtButton
              type="primary"
              onClick={() => this.submit()}
              className={`product-manage-select-modal-button-submit`}
            >
              确定
            </AtButton>
          </View>
        </View>
      </AtFloatLayout>
    );
  }

  private renderSectionHeader = (section: ProductInterface.IndexProducList) => {
    return (
      <View className={`${cssPrefix}-list-section`}>
        <View className={`${cssPrefix}-list-section-icon`}/>
        <Text className={`${cssPrefix}-list-section-title`}>{section.title}</Text>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => {
  const productManageList = getProductManageList(state);
  const productIndexList = getProductManageListIndexes(productManageList);
  return {
    productIndexList,
    productType: getProductType(state),
    productSupplier: getProductSupplier(state),
  };
};

export default connect(select)(ProductManage);