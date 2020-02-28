/**
 * @Author: Ghan 
 * @Date: 2019-11-13 09:41:02 
 * @Last Modified by: centerm.gaozhiying
 * @Last Modified time: 2020-02-12 18:17:27
 * 
 */
import Taro from '@tarojs/taro';
import { View, ScrollView, Text, Image } from '@tarojs/components';
import "../style/product.less";
import "../style/member.less";
import "../../component/product/product.less";
import '../../component/cart/cart.less';
import { AppReducer } from '../../reducers';
import { connect } from '@tarojs/redux';
import classnames from 'classnames';
import { getSuspensionCartList, ProductSDKReducer } from '../../common/sdk/product/product.sdk.reducer';
import dayJs from 'dayjs';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import { store } from '../../app';
import invariant from 'invariant';

const cssPrefix = 'product';
const cssPrefixComponent = "component-product";

interface Props {
  suspensionCartList: ProductSDKReducer.SuspensionCartBase[];
}

interface State {
  currentSuspension: number;
}

class ProductSuspension extends Taro.Component<Props, State> {

  config: Taro.Config = {
    navigationBarTitleText: '挂单'
  };

  state = {
    currentSuspension: -1
  };

  public componentDidShow() {
    const { suspensionCartList } = this.props;
    if (suspensionCartList.length > 0) {
      this.setState({ currentSuspension: suspensionCartList[0].suspension.date });
    }
  }

  public onSuspensionClick = (suspension: ProductSDKReducer.SuspensionCartBase) => {
    this.setState({ currentSuspension: suspension.suspension.date });
  }

  public manageProduct = (product: any, type: ProductCartInterface.ProductCartAdd | ProductCartInterface.ProductCartReduce, suspension: number) => {
    // 这里要判断一下，是否是最后一个商品如果是，那么可能要删除该挂单
    productSdk.manage({ type, product, suspension });
  }

  /**
   * @todo 下单
   *
   * @memberof ProductSuspension
   */
  public onOrder = async () => {
    try {
      Taro.showLoading();
      const { currentSuspension } = this.state;
      if (currentSuspension === -1) {
        return;
      }
      const { success } = await productSdk.suspensionOrder(currentSuspension);
      invariant(success, '下单失败');
      Taro.hideLoading();
      // Taro.redirectTo({url: `/pages/product/product.order`});
      Taro.navigateBack();
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({ title: error.message, icon: 'none' });
    }
  }

  public onDeleteSuspension = (suspension?: number) => {
    const { suspensionCartList } = this.props;

    if (suspensionCartList.length === 0) {
      return;
    }

    Taro.showModal({
      title: '提示',
      content: suspension ? '确认删除该挂单吗？' : '确认清空所有挂单吗？',
      success: async (result) => {
        if (result.confirm) {
          // 删除挂单
          await productSdk.deleteSuspension(suspension);
          Taro.showToast({ title: suspension ? '删除挂单' : '清空挂单', icon: 'success' });

          // 如果删除了挂单之后，把当前挂单指向第一个挂单
          if (suspension) {
            const nextState = await store.getState();
            const nextSuspensionCartList = getSuspensionCartList(nextState);
            if (nextSuspensionCartList.length > 0) {
              this.setState({ currentSuspension: nextSuspensionCartList[0].suspension.date });
              return;
            }
          }
          // 如果挂单空了则设置回初始值-1
          this.setState({ currentSuspension: -1 });
        }
      }
    });
  }

  render() {
    const { suspensionCartList } = this.props;
    return (
      <View className={`container ${cssPrefix}`}>
        {
          suspensionCartList && suspensionCartList.length > 0 ? (
            <View className={`${cssPrefix}-list-container ${cssPrefix}-list-container-suspension`}>
              {this.renderLeft()}
              {this.renderRight()}
            </View>
          ) : (
              <View className={`${cssPrefix}-suspension`}>
                <Image src="//net.huanmusic.com/weapp/img_kong.png" className={`${cssPrefix}-suspension-image`} />
                <Text className={`${cssPrefix}-suspension-text`}>暂无内容</Text>
              </View>
            )
        }

        {this.renderFooter()}
      </View>
    );
  }

  private renderLeft = () => {
    const { currentSuspension } = this.state;
    const { suspensionCartList } = this.props;
    return (
      <ScrollView
        scrollY={true}
        className={`${cssPrefix}-list-left`}
      >
        {
          suspensionCartList && suspensionCartList.length > 0
            ? suspensionCartList.map((suspension) => {
              return (
                <View
                  key={suspension.suspension.date}
                  className={classnames(`${cssPrefix}-list-left-item`, {
                    [`${cssPrefix}-list-left-item-active`]: currentSuspension === suspension.suspension.date,
                    [`${cssPrefix}-list-left-item-suspension`]: true
                  })}
                  onClick={() => this.onSuspensionClick(suspension)}
                >
                  {currentSuspension === suspension.suspension.date && (
                    <View className={`${cssPrefix}-list-left-item-active-bge`} />
                  )}
                  <Text>{dayJs(suspension.suspension.date).format('MM月DD日')}</Text>
                  <Text>{dayJs(suspension.suspension.date).format('HH:mm')}</Text>
                </View>
              );
            })
            : <View />
        }
      </ScrollView>
    );
  }

  private renderRight = () => {
    const { currentSuspension } = this.state;
    const { suspensionCartList } = this.props;

    const currentSuspensionList = suspensionCartList.find(s => s.suspension.date === currentSuspension) || {};
    const { productCartList } = currentSuspensionList as ProductSDKReducer.SuspensionCartBase;
    return (
      <View className={`${cssPrefix}-list-right`}>
        <ScrollView
          scrollY={true}
          className={`${cssPrefix}-list-right ${cssPrefix}-list-right-container-search`}
        >
          {
            productCartList && productCartList.length > 0 && productCartList.map((product, index) => {
              return (
                <View
                  key={`${product.id}-${index}`}
                  className={`${cssPrefixComponent} ${cssPrefixComponent}-border`}
                >
                  <View className={`${cssPrefixComponent}-content`}>
                    <View className={`${cssPrefixComponent}-content-cover`}>
                      {product.pictures && product.pictures !== '' ? (
                        <Image src={product.pictures} className={`${cssPrefixComponent}-content-cover-image`} />
                      ) : (
                          <Image src="//net.huanmusic.com/weapp/empty.png" className={`${cssPrefixComponent}-content-cover-image`} />
                        )}
                    </View>
                    <View className={`${cssPrefixComponent}-content-detail`}>
                      <View className={`${cssPrefixComponent}-title`}>{product.name}</View>
                      <Text className={`${cssPrefixComponent}-normal`}>
                        <Text className={`${cssPrefixComponent}-price-bge`}>￥</Text>
                        <Text className={`${cssPrefixComponent}-price`}>{product.price}</Text>
                        /{product.unit}
                      </Text>
                    </View>
                    <View className={`${cssPrefixComponent}-stepper`}>
                      <View className={`${cssPrefixComponent}-stepper-container`}>
                        <View
                          className={classnames(`${cssPrefixComponent}-stepper-button`, `${cssPrefixComponent}-stepper-button-reduce`)}
                          onClick={() => this.manageProduct(product, productSdk.productCartManageType.REDUCE, currentSuspension)}
                        />
                        <Text className={`${cssPrefixComponent}-stepper-text`}>{product.sellNum}</Text>
                        {!productSdk.isWeighProduct(product) && (
                          <View
                            className={classnames(`${cssPrefixComponent}-stepper-button`, `${cssPrefixComponent}-stepper-button-add`)}
                            onClick={() => this.manageProduct(product, productSdk.productCartManageType.ADD, currentSuspension)}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              );
            })
          }
        </ScrollView>
      </View>
    );
  }

  private renderFooter = () => {
    const { currentSuspension } = this.state;
    return (
      <View>
        <View className="cart">
          <View className="cart-bg cart-bg-suspension">
            <View className="cart-suspension-left">
              <View
                className="cart-suspension-left-item"
                onClick={() => this.onDeleteSuspension()}
              >
                {
                  currentSuspension !== -1
                    ? (
                      <Image
                        src="//net.huanmusic.com/weapp/icon_orders_empty.png"
                        className="cart-suspension-left-item-empty"
                      />
                    )
                    : (
                      <Image
                        src="//net.huanmusic.com/weapp/icon_orders_empty_none.png"
                        className="cart-suspension-left-item-empty"
                      />
                    )
                }

                <Text
                  className={classnames(`cart-suspension-left-item-text`, {
                    [`cart-suspension-left-item-gray`]: currentSuspension === -1,
                  })}
                >
                  清空
                </Text>
              </View>
              <View
                className="cart-suspension-left-item"
                onClick={() => this.onDeleteSuspension(currentSuspension)}
              >
                {
                  currentSuspension !== -1
                    ? (
                      <Image
                        src="//net.huanmusic.com/weapp/icon_orders_del.png"
                        className="cart-suspension-left-item-delete"
                      />
                    )
                    : (
                      <Image
                        src="//net.huanmusic.com/weapp/icon_orders_del_none.png"
                        className="cart-suspension-left-item-delete"
                      />
                    )
                }
                <Text
                  className={classnames(`cart-suspension-left-item-text`, {
                    [`cart-suspension-left-item-gray`]: currentSuspension === -1,
                  })}
                >
                  删除
                </Text>
              </View>
            </View>
            <View
              className={classnames(`cart-right`, {
                [`cart-right-suspension`]: true,
                [`cart-right-suspension-active`]: currentSuspension !== -1,
                [`cart-right-suspension-disabled`]: currentSuspension === -1
              })}
              onClick={() => this.onOrder()}
            >
              {
                currentSuspension !== -1
                  ? (
                    <Image
                      src="//net.huanmusic.com/weapp/icon_xiadan.png"
                      className="cart-right-suspension-icon"
                    />
                  )
                  : (
                    <Image
                      src="//net.huanmusic.com/weapp/icon_xiadan_none.png"
                      className="cart-right-suspension-icon"
                    />
                  )
              }
              <Text className={`cart-right-suspension-text`}>下单</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  suspensionCartList: getSuspensionCartList(state)
});

export default connect(select)(ProductSuspension);