import Taro from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, ScrollView } from '@tarojs/components';
import CouponItem from '../../component/coupon/coupon';
import merchantAction from '../../actions/merchant.action';
import { getCouponList, getSelectCoupon } from '../../reducers/app.merchant';
import { MerchantInterface } from 'src/constants';
import '../style/pay.less';
import '../style/product.less';
import HeaderInput from '../../component/header/header.input';
import ButtonCostom from '../../component/button/button';
import invariant from 'invariant';
import { getProductCartList } from '../../common/sdk/product/product.sdk.reducer';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';

type Props = {
  couponList: MerchantInterface.Coupon[];
  productCartList: ProductCartInterface.ProductCartInfo[];
  selectCoupon?: MerchantInterface.Coupon;
};

type State = {
  selectId: number;
}

class CouponPage extends Taro.Component<Props, State> {

  state: State = {
    selectId: -1
  };

  config = {
    navigationBarTitleText: '优惠券'
  };

  componentDidShow () {
    this.init();
  }

  public init = async () => {
    const { phone, selectId } = this.$router.params;
    const { productCartList } = this.props;
    if (!!phone) {
      /**
       * @time 0318
       * @todo [修改改成getProductMemberPrice，如果使用transprice则会计算优惠券价格]
       */
      merchantAction.couponList({
        phone, 
        amount: productSdk.getProductMemberPrice(), 
        productIds: productCartList.map(item => item.id)
      });
      merchantAction.couponGetMemberExpiredCoupons({phone: phone});
    } else {
      merchantAction.emptyCoupon();
    }

    if (!!selectId) {
      this.setState({selectId: Number(selectId)});
    }
  }

  public onCouponClick = (coupon: MerchantInterface.Coupon) => {
    try {
      const { selectId } = this.state;
      invariant(!!coupon.ableToUse, '该优惠券暂不可用');

      /**
       * @time 0318
       * @todo [如果是再次点击则取消选择该优惠券]
       */
      if (selectId === coupon.id) {
        this.setState({selectId: -1});
        merchantAction.selectCoupon(undefined);
        Taro.navigateBack({});
        return;
      }

      this.setState({selectId: coupon.id});
      merchantAction.selectCoupon(coupon);
      Taro.showToast({ title: '选择优惠券' });
      setTimeout(() => {
        Taro.navigateBack({});  
      }, 500);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onScan = async () => {
    try {
      Taro.scanCode({
        onlyFromCamera: true,
        scanType: ['qrCode']
      }).then((result) => {
        const { } = result;
        console.log('result: ', result);
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { selectId } = this.state;
    const { couponList, selectCoupon } = this.props;
    return (
      <View className='container container-color'>
        <HeaderInput
          placeholder="请输入业务单号"
          value={''}
          // onInput={this.onInput}
          isRenderScan={true}
          scanClick={() => this.onScan()}
          // inputRightClick={() => this.onInput({detail: {value: ''}})}
        >
          <ButtonCostom
            title="确定"
            // onClick={() => this.onSuspensionHandle()}
            // badge={suspensionList.length}
          />
        </HeaderInput>

        <ScrollView
          scrollY={true}
          className={`product-list-container`}
        >
          <View className={`product-list-right`}>
            {couponList.map((item) => {
              const select = selectId === item.id;
              return (
                <CouponItem 
                  key={item.id}
                  select={!!select}
                  coupon={item} 
                  onClick={(coupon: MerchantInterface.Coupon) => this.onCouponClick(coupon)}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const select = (state: any) => ({
  couponList: getCouponList(state),
  productCartList: getProductCartList(state),
  selectCoupon: getSelectCoupon(state),
});

export default connect(select)(CouponPage as any);