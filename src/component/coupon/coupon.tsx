import Taro from "@tarojs/taro";
import { View, Image, Text } from "@tarojs/components";
import "./index.less";
import "../card/form.card.less";
import dayJs from "dayjs";
import classnames from "classnames";
import { MerchantInterface } from "src/constants";

interface Props {
  coupon: MerchantInterface.Coupon;
  select?: boolean;
  onClick?: any;
  touchable?: boolean;
}
interface State {
  showMore: boolean;
}

const cssPrefix = "user-coupon";
class Page extends Taro.Component<Props, State> {
  state: State = {
    showMore: false
  };

  onChange = () => {
    this.setState({
      showMore: !this.state.showMore
    });
  };

  render() {
    const { showMore } = this.state;
    const {
      coupon = {} as MerchantInterface.Coupon,
      select = false,
      onClick = () => {},
      touchable = true
    } = this.props;
    return (
      <View className={`${cssPrefix}-item`} onClick={() => onClick(coupon)}>
        <View
          className={classnames(`${cssPrefix}-item-top`, {
            [`${cssPrefix}-item-top-grey`]: !coupon.ableToUse
          })}
        >
          <View className={`${cssPrefix}-item-top-left`}>
            <Text className={`${cssPrefix}-item-top-left-price`}>
              {coupon.couponVO && coupon.couponVO.discount}
              <Text className={`${cssPrefix}-item-top-left-sign`}>¥</Text>
            </Text>
            <Text className={`${cssPrefix}-item-top-left-info`}>
              满{coupon.couponVO && coupon.couponVO.threshold}可用
            </Text>
          </View>
          <View className={`${cssPrefix}-item-top-right`}>
            <Text
              className={classnames(`${cssPrefix}-item-top-right-info`, {
                [`${cssPrefix}-item-text-grey`]: !coupon.ableToUse
              })}
            >
              {coupon.couponVO && coupon.couponVO.filterType === 0
                ? "全品类可用"
                : "部分商品可用"}
            </Text>
            <View
              className={`${cssPrefix}-item-top-right-row`}
              onClick={() => this.onChange()}
            >
              <Text
                className={classnames(`${cssPrefix}-item-top-right-time`, {
                  [`${cssPrefix}-item-text-grey`]: !coupon.ableToUse
                })}
              >
                {`${dayJs(coupon.createTime).format("MM/DD")}~${dayJs(
                  coupon.effectiveTime
                ).format("MM/DD")}`}
              </Text>
              <Image
                className={classnames(`${cssPrefix}-item-top-right-pop`, {
                  [`${cssPrefix}-item-top-right-pop-down`]: !showMore
                })}
                src="//net.huanmusic.com/weapp/icon_packup_gray.png"
              />
            </View>
          </View>
          {!!touchable && (
            <View
              className={classnames(`${cssPrefix}-item-top-button`, {
                [`${cssPrefix}-item-top-button-active`]: !!select,
                [`${cssPrefix}-item-top-button-normal`]: !select
              })}
            />
          )}
        </View>
        {!!showMore && (
          <View className={`${cssPrefix}-item-bottom`}>
            <Text className={`${cssPrefix}-item-bottom-info`}>
              1.优惠券满{(coupon.couponVO && coupon.couponVO.threshold) || 0}
              元减
              {(coupon.couponVO && coupon.couponVO.discount) || 0}元，
              {coupon.couponVO && coupon.couponVO.filterType === 0
                ? "全品类可用"
                : "部分商品可用"}
              （优惠商品除外）；
            </Text>
            <Text className={`${cssPrefix}-item-bottom-info`}>
              2.一个订单只能使用一张优惠券；
            </Text>
            <Text className={`${cssPrefix}-item-bottom-info`}>
              3.优惠券只能抵扣商品费用，不抵扣配送费
            </Text>
          </View>
        )}
      </View>
    );
  }
}

export default Page;
