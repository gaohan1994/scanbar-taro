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

class CouponPage extends Taro.Component<Props> {

  config = {
    navigationBarTitleText: '优惠券'
  };

  componentDidShow () {
    this.init();
  }

  public init = async () => {
    const { phone } = this.$router.params;
    const { productCartList } = this.props;
    if (!!phone) {
      merchantAction.couponList({
        phone, 
        amount: productSdk.getProductTransPrice(), 
        productIds: productCartList.map(item => item.id)
      });
      merchantAction.couponGetMemberExpiredCoupons({phone: phone});
    } else {
      merchantAction.emptyCoupon();
    }
  }

  public onCouponClick = (coupon: MerchantInterface.Coupon) => {
    try {
      invariant(!!coupon.ableToUse, '该优惠券暂不可用');
      this.setState({selectCoupon: coupon.id});
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
              const select = selectCoupon && selectCoupon.id === item.id;
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