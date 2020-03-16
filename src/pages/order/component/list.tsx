import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import productSdk, { ProductCartInterface } from '../../../common/sdk/product/product.sdk';
import "./product.less";
import './index.less';
import classnames from 'classnames';
import numeral from 'numeral';
import { connect } from '@tarojs/redux';
import { getOrderDetail } from '../../../reducers/app.order';
import { OrderInterface } from '../../../constants';
import { OrderAction } from '../../../actions';

const cssPrefix = 'product';
const prefix = 'component-order-product';

type Props = {
  productList: Array<ProductCartInterface.ProductCartInfo>;
  className?: string;
  padding?: boolean;
  type?: number;
  payOrderDetail: any;
  orderDetail: OrderInterface.OrderDetail;
  showCallModal?: () => void;
};

class ProductPayListView extends Taro.Component<Props> {

  static options = {
    addGlobalClass: true
  };

  render() {
    const { productList, className, padding = true, payOrderDetail, type, orderDetail, showCallModal } = this.props;
    const { orderDetailList, order } = orderDetail;
    const status = OrderAction.orderStatus([], orderDetail as any);
    return (
      <View
        className={classnames(className, {
          [`${cssPrefix}-pay-pos`]: padding
        })}
      >
        <View
          className={classnames('component-form', {
            'component-form-shadow': true,
            [`${cssPrefix}-row-items`]: true
          })}
        >
          {
            /**
             * @time 0313
             * @todo [申请退货不显示header]
             */
            type && type === 1 && status.id !== 8 && (
              <View className={`${prefix}-detail-item ${prefix}-detail-bor`}> 
                <View 
                  className={`${prefix}-detail-avator`} 
                  style='background-image: url(//net.huanmusic.com/weapp/icon_order_note.png)'
                />
                <View className={`${prefix}-detail-box`}>
                  <View className={`${prefix}-detail-box-text`}>
                    <View className={`${prefix}-detail-title `}>{order.receiver || order.memberName}</View>
                    <View className={`${prefix}-detail-vip`}>{order.levelName}</View>
                  </View>
                  <View className={`${prefix}-detail-text ${prefix}-detail-mar`}>{order.receiverPhone || order.memberPhone}</View>
                </View>
                <View className={`${prefix}-detail-arror`} />
              </View>
            )
          }
          {
            type && type === 1
              ? orderDetailList && orderDetailList.length > 0 && orderDetailList.map((item) => {
                return this.renderProductItem(item)
              })
              : productList && productList.length > 0 && productList.map((item) => {
                return this.renderProductItem(item)
              })
          }
          {
            ((payOrderDetail && payOrderDetail.deliveryType !== undefined && payOrderDetail.deliveryType === 1) 
              || (order && order.deliveryType !== undefined && order.deliveryType === 1)) && (
              <View className={`${cssPrefix}-row-totals`}>
                <View className={`${cssPrefix}-row-content-item`}>
                  <Text className={`${cssPrefix}-row-voucher`}>配送费</Text>
                  <View>
                    <Text
                      className={
                        `${cssPrefix}-row-content-price ${cssPrefix}-row-content-price-black`
                      }
                    >
                      ￥{numeral(3.5).format('0.00')}
                    </Text>
                  </View>
                </View>
              </View>
            )
          }
          {this.renderDisount()}
          {this.renderTotal()}
        </View>
      </View>
    );
  }

  private renderProductItem = (item: any) => {
    const { type } = this.props;
    if (type && type === 1) {
      return (
        <View
          key={item.id}
          className={classnames(`${cssPrefix}-row ${cssPrefix}-row-content`, {
            // [`container-border`]: index !== (productList.length - 1)
          })}
        >
          <View className={`${cssPrefix}-row-box`}>
            {
              item && item.picUrl && item.picUrl.length > 0
                ? (
                  <View
                    className={`${cssPrefix}-row-cover`}
                    style={`background-image: url(${item.picUrl})`}
                  />
                )
                : (
                  <View
                    className={`${cssPrefix}-row-cover`}
                    style={`background-image: url(${"//net.huanmusic.com/scanbar-c/v1/pic_nopicture.png"})`}
                  />
                )
            }

            <View className={`${cssPrefix}-row-content ${cssPrefix}-row-content-box`}>
              <Text className={`${cssPrefix}-row-name`}>{item.productName}</Text>
              <Text className={`${cssPrefix}-row-normal`}>{`x ${item.num}`}</Text>
              <View className={`${cssPrefix}-row-corner`}>
                <View>
                  <Text className={`${cssPrefix}-row-corner-price`}>￥</Text>
                  <Text className={`${cssPrefix}-row-corner-big`}>{numeral(item.transAmount).format('0.00').split('.')[0]}</Text>
                  <Text className={`${cssPrefix}-row-corner-price`}>{`.${numeral(item.transAmount).format('0.00').split('.')[1]}`}</Text>
                </View>
                {
                  item.totalAmount !== item.transAmount && (
                    <Text className={`${cssPrefix}-row-corner-origin`}>{`￥${item.totalAmount}`}</Text>
                  )
                }
              </View>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View
        key={item.id}
        className={classnames(`${cssPrefix}-row ${cssPrefix}-row-content`, {
          // [`container-border`]: index !== (productList.length - 1)
        })}
      >
        <View className={`${cssPrefix}-row-box`}>
          {
            item && item.pictures && item.pictures.length > 0
              ? (
                <View
                  className={`${cssPrefix}-row-cover`}
                  style={`background-image: url(${item.pictures[0]})`}
                />
              )
              : (
                <View
                  className={`${cssPrefix}-row-cover`}
                  style={`background-image: url(${"//net.huanmusic.com/scanbar-c/v1/pic_nopicture.png"})`}
                />
              )
          }

          <View className={`${cssPrefix}-row-content ${cssPrefix}-row-content-box`}>
            <Text className={`${cssPrefix}-row-name`}>{item.name}</Text>
            <Text className={`${cssPrefix}-row-normal`}>{`x ${item.sellNum}`}</Text>
            <View className={`${cssPrefix}-row-corner`}>
              <View>
                <Text className={`${cssPrefix}-row-corner-price`}>￥</Text>
                <Text className={`${cssPrefix}-row-corner-big`}>{numeral(productSdk.getProductItemPrice(item)).format('0.00').split('.')[0]}</Text>
                <Text className={`${cssPrefix}-row-corner-price`}>{`.${numeral(productSdk.getProductItemPrice(item)).format('0.00').split('.')[1]}`}</Text>
              </View>
              {
                item.price !== productSdk.getProductItemPrice(item) && (
                  <Text className={`${cssPrefix}-row-corner-origin`}>{`￥${item.price}`}</Text>
                )
              }
            </View>
          </View>
        </View>
      </View>
    );
  }

  private renderDisount = () => {
    return (
      <View>
        <View className={`${cssPrefix}-row-totals`}>
          <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-column`}>
            <View className={`${cssPrefix}-row-content-column-item`}>
              <View 
                className={classnames(`${cssPrefix}-row-content-row`, {
                  [`${cssPrefix}-row-content-row-top`]: true,
                })}
              >
                <View
                  className={classnames(
                    `${cssPrefix}-row-discount`,
                    {
                      [`${cssPrefix}-row-discount-full`]: true,
                      [`${cssPrefix}-row-discount-first`]: false,
                    })}
                >
                  满减
                  </View>
                <Text className={`${cssPrefix}-row-discount-title`}>满500减20</Text>
              </View>
              <Text className={`${cssPrefix}-row-content-price`}>-￥20</Text>
            </View>
            <View className={`${cssPrefix}-row-content-column-item`}>
              <View className={`${cssPrefix}-row-content-row`}>
                <View
                  className={classnames(
                    `${cssPrefix}-row-discount`,
                    {
                      [`${cssPrefix}-row-discount-full`]: false,
                      [`${cssPrefix}-row-discount-first`]: true,
                    })}
                >
                  首单
                </View>
                <Text className={`${cssPrefix}-row-discount-title`}>首单立减10元</Text>
              </View>
              <Text className={`${cssPrefix}-row-content-price`}>-￥20</Text>
            </View>
          </View>
        </View>

        <View className={`${cssPrefix}-row-totals`}>
          <View className={`${cssPrefix}-row-content-item`}>
            <Text className={`${cssPrefix}-row-voucher`}>抵用券</Text>
            <View>
              <Text className={`${cssPrefix}-row-content-price`}>-￥20</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  private renderTotal = () => {
    const { payOrderDetail, type, orderDetail } = this.props;
    const { order } = orderDetail;
    let price = numeral(productSdk.getProductTransPrice() + 
      (payOrderDetail && payOrderDetail.deliveryType !== undefined && payOrderDetail.deliveryType === 1 ? 3.5 : 0)).format('0.00');
    let discountPrice = numeral(numeral(productSdk.getProductsOriginPrice()).value() - numeral(productSdk.getProductTransPrice()).value()).format('0.00');
    if (type && type === 1) {
      price = numeral(orderDetail.order.transAmount).format('0.00');
      discountPrice = numeral(order.totalAmount - order.transAmount).format('0.00');
    }
    return (
      <View className={`${cssPrefix}-row-totals`}>
        <View className={`${cssPrefix}-row-content-item`}>
          <View />
          <View className={`${cssPrefix}-row-tran`}>
            <Text className={`${cssPrefix}-row-tran`}>{`已优惠￥ ${discountPrice}`}</Text>
            <Text className={`${cssPrefix}-row-tran ${cssPrefix}-row-tran-margin`}>{`合计：`}</Text>
            <Text className={`${cssPrefix}-row-tran-price`}>￥</Text>
            <Text className={`${cssPrefix}-row-tran-price ${cssPrefix}-row-tran-big `}>{price.split('.')[0]}</Text>
            <Text className={`${cssPrefix}-row-tran-price`}>{`.${price.split('.')[1]}`}</Text>
          </View>
        </View>
      </View>
    );
  }
}

const select = (state) => {
  return {
    payOrderDetail: state.productSDK.payOrderDetail,
    orderDetail: getOrderDetail(state),
  }
}
export default connect(select)(ProductPayListView);