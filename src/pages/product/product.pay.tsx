import Taro from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { AppReducer } from '../../reducers';
import { getProductCartList } from '../../common/sdk/product/product.sdk.reducer';
import { connect } from '@tarojs/redux';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import "../../component/card/form.card.less";
import './style/product.less';
import classnames from 'classnames';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import invariant from 'invariant';
import { ResponseCode } from '../../constants/index';
import { store } from '../../app';
import { ProductInterfaceMap } from '../../constants';

const cssPrefix = 'product';

interface Props {
  productCartList: ProductCartInterface.ProductCartInfo[];
}

class ProductPay extends Taro.Component<Props> {

  public onPayHandle = async () => {
    try {
      Taro.showLoading();
      const { productCartList } = this.props;
      const payload: ProductCartInterface.ProductPayPayload = {
        flag: false,
        order: {
          authCode: '-1',
          discount: 0,
          erase: 0,
          memberId: -1,
          orderNo: '',
          orderSource: 1,
          payType: 2,
          terminalCd: '-1',
          terminalSn: '-1',
          totalAmount: productSdk.getProductPrice(),
          totalNum: productSdk.getProductNumber(),
          transAmount: productSdk.getProductPrice(),
        },
        productInfoList: productCartList.map((item) => {
          return {
            activities: [],
            barcode: item.barcode,
            brand: item.brand,
            discountAmount: 0,
            discountType: 0,
            productId: item.id,
            productName: item.name,
            sellNum: item.sellNum,
            standard: item.standard,
            totalAmount: item.price * item.sellNum,
            transAmount: item.price * item.sellNum,
            type: item.typeId,
          };
        }),
        transProp: true
      };
      const result = await productSdk.cashierPay(payload);
      invariant(result.code === ResponseCode.success, result.msg || ResponseCode.error);
      Taro.hideLoading();
      store.dispatch({
        type: ProductInterfaceMap.reducerInterfaces.RECEIVE_PAY_DETAIL,
        payload: { 
          payReceive: {
            ...result.data,
            totalAmount: payload.order.totalAmount
          }
        }
      });
      Taro.navigateTo({
        url: `/pages/pay/pay.receive`
      });
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    return (
      <View className='container'>
        <View className={`${cssPrefix}-pay-container ${cssPrefix}-pay`} >
          {/* <ScrollView 
            scrollY={true}
            className={`${cssPrefix}-pay-list`}
          > */}
            {this.renderListProductCard()}
            {this.renderListDetail()}
          {/* </ScrollView> */}
        </View>
        {this.renderFooter()}
      </View>
    );
  }

  private renderListProductCard = () => {
    const { productCartList } = this.props;
    return (
      <View 
        className={classnames('component-form', {
          'component-form-shadow': true
        })}
      >
        <View className={`${cssPrefix}-row ${cssPrefix}-row-border`}>
          <Text className={`${cssPrefix}-row-normal`}>商品详情</Text>
        </View>
        {
          productCartList.map((item, index) => {
            return (
              <View 
                key={item.id}
                className={classnames(`${cssPrefix}-row ${cssPrefix}-row-content`, {
                  [`${cssPrefix}-row-border`]: index !== (productCartList.length - 1)
                })}
              >
                <View className={`${cssPrefix}-row-content-item`}>
                  <Text className={`${cssPrefix}-row-name`}>{item.name}</Text>
                  <Text className={`${cssPrefix}-row-normal`}>{`x ${item.sellNum}`}</Text>
                </View>
                <View className={`${cssPrefix}-row-content-item ${cssPrefix}-row-content-top`}>
                  <Text className={`${cssPrefix}-row-normal`}>{`￥ ${item.price}`}</Text>
                  <Text className={`${cssPrefix}-row-normal`}>{`小计：￥ ${item.sellNum}`}</Text>
                </View>
              </View>
            );
          })
        }
      </View>
    );
  }

  private renderListDetail = () => {
    const formCard: FormRowProps[] = [
      {
        title: '商品数量',
        extraText: `${productSdk.getProductNumber()}`
      },
      {
        title: '原价金额',
        extraText: `￥${productSdk.getProductPrice()}`
      },
      // {
      //   title: '优惠金额',
      //   extraText: `$10`,
      //   extraTextStyle: 'price'
      // },
      {
        title: '应收金额',
        extraText: `￥${productSdk.getProductPrice()}`,
        hasBorder: false
      },
    ];
    return (
      <FormCard items={formCard} />
    );
  }

  private renderFooter = () => {
    const { productCartList } = this.props;
    return (
      <View className={`${cssPrefix}-pay-footer`}>
        <View className={`${cssPrefix}-pay-footer-bg`}>
          <View className={`${cssPrefix}-pay-footer-left`}>
            <View className={`${cssPrefix}-pay-footer-left-item`}>
              <Image src='//net.huanmusic.com/weapp/icon_member.png' className={`${cssPrefix}-pay-footer-left-item-icon`} />
              <Text className={`${cssPrefix}-pay-footer-left-item-font`}>会员</Text>
            </View>
            <View className={`${cssPrefix}-pay-footer-left-item`}>
              <Image src='//net.huanmusic.com/weapp/icon_molin.png' className={`${cssPrefix}-pay-footer-left-item-icon`} />
              <Text className={`${cssPrefix}-pay-footer-left-item-font`}>抹零</Text>
            </View>
          </View>
          <View
            className={classnames(`${cssPrefix}-pay-footer-right`, {
              [`${cssPrefix}-pay-footer-right-active`]: productCartList.length > 0,
              [`${cssPrefix}-pay-footer-right-disabled`]: productCartList.length === 0,
            })}
            onClick={() => this.onPayHandle()}
          >
            收款￥{productSdk.getProductPrice()}
          </View>
        </View>
      </View>
    );
  }
}

const select = (state: AppReducer.AppState) => ({
  productCartList: getProductCartList(state),
});

export default connect(select)(ProductPay);