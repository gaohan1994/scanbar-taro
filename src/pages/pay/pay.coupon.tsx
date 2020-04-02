import Taro from '@tarojs/taro';
import { connect } from '@tarojs/redux';
import { View, Text, ScrollView } from '@tarojs/components';
import CouponItem from '../../component/coupon/coupon';
import merchantAction from '../../actions/merchant.action';
import { getCouponList, getSelectCoupon, getSearchCoupon } from '../../reducers/app.merchant';
import { MerchantInterface } from 'src/constants';
import '../style/pay.less';
import '../style/product.less';
import HeaderInput from '../../component/header/header.input';
import ButtonCostom from '../../component/button/button';
import invariant from 'invariant';
import { getProductCartList } from '../../common/sdk/product/product.sdk.reducer';
import productSdk, { ProductCartInterface } from '../../common/sdk/product/product.sdk';
import { ResponseCode } from '../../constants/index';
import ButtonFooter from '../../component/button/button.footer';

type Props = {
  couponList: MerchantInterface.Coupon[];
  productCartList: ProductCartInterface.ProductCartInfo[];
  selectCoupon?: MerchantInterface.Coupon;
  searchCoupon?: MerchantInterface.Coupon[];
};

type State = {
  selectId: number;
  value: string;
};

class CouponPage extends Taro.Component<Props, State> {

  state: State = {
    selectId: -1,
    value: '',
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

  public cancelCoupon = () => {
    /**
     * @todo 取消使用优惠券
     */
    this.setState({selectId: -1});
    merchantAction.selectCoupon(undefined);
    Taro.navigateBack({});
  }

  public onCouponClick = (coupon: MerchantInterface.Coupon) => {
    try {
      invariant(!!coupon.ableToUse, '该优惠券暂不可用');

      /**
       * @time 0318
       * @todo [如果是再次点击则取消选择该优惠券]
       * 
       * @time 0401
       * @todo [取消反选]
       */
      // if (selectId === coupon.id) {
      //   this.setState({selectId: -1});
      //   merchantAction.selectCoupon(undefined);
      //   Taro.navigateBack({});
      //   return;
      // }

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
        
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  public onInput = (value: string) => {
    this.setState({value});
  }

  public onCoupon = async () => {
    try {
      const { phone } = this.$router.params;
      const { productCartList } = this.props;
      const { value } = this.state;
      invariant(!!value, '请输入要查询的优惠券码');
      const result = await merchantAction.getByCode({
        code: value,
        phone,
        amount: productSdk.getProductMemberPrice(), 
        productIds: productCartList.map(item => item.id),
      });
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      // this.onCouponClick(result.data);
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const { selectId, value } = this.state;
    const { couponList, searchCoupon } = this.props;
    return (
      <View className='container container-color'>
        <HeaderInput
          placeholder="请输入业务单号"
          value={value}
          onInput={({detail: {value}}) => this.onInput(value)}
          isRenderScan={true}
          scanClick={() => this.onScan()}
          // inputRightClick={() => this.onInput({detail: {value: ''}})}
        >
          <ButtonCostom
            title="确定"
            onClick={() => this.onCoupon()}
          />
        </HeaderInput>

        <ScrollView
          scrollY={true}
          className={`product-list-container`}
        >
          <View className={`product-list-right`}>
            {!!searchCoupon && searchCoupon.map((item) => {
              return (
                <CouponItem 
                  key={item.id}
                  select={item.id === selectId}
                  coupon={item} 
                  onClick={(coupon: MerchantInterface.Coupon) => this.onCouponClick(coupon)}
                />
              );
            })}
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

        <ButtonFooter
          buttons={[{
            title: '不使用券',
            onPress: () => this.cancelCoupon()
          }]}
        />
      </View>
    );
  }
}

const select = (state: any) => ({
  couponList: getCouponList(state),
  productCartList: getProductCartList(state),
  selectCoupon: getSelectCoupon(state),
  searchCoupon: getSearchCoupon(state),
});

export default connect(select)(CouponPage as any);