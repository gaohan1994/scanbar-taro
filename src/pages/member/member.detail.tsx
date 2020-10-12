/*
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-06-10 15:14:34
 */
import Taro from "@tarojs/taro";
import { View, Image, Text, ScrollView } from "@tarojs/components";
import "../style/member.less";
import "../style/product.less";
import "../style/home.less";
import "../style/inventory.less";
import { Card } from "../../component/common/card/card.common";
import FormCard from "../../component/card/form.card";
import FormRow, { FormRowProps } from "../../component/card/form.row";
import { AtButton, AtActivityIndicator } from "taro-ui";
import { MemberAction } from "../../actions";
import { connect } from "@tarojs/redux";
import { AppReducer } from "../../reducers";
import {
  getMemberDetail,
  getMemberPerference,
  getMemberOrderInfo
} from "../../reducers/app.member";
import { MemberInterface, MerchantService } from "../../constants";
import numeral from "numeral";
import ModalLayout from "../../component/layout/modal.layout";
import CouponItem from "../../component/coupon/coupon";
import { ResponseCode } from "../../constants/index";

const cssPrefix: string = "member";

interface MemberMainProps {
  memberDetail: MemberInterface.MemberInfo;
  memberPerference: MemberInterface.MemberPerference[];
}

class MemberMain extends Taro.Component<MemberMainProps> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: "会员详情"
  };

  state = {
    showCoupon: false, // 显示优惠券modal
    couponsList: [] // 会员优惠券列表
  };

  componentWillMount = () => {
    const { id } = this.$router.params;
    if (!id) {
      console.error("请传入会员id");
      return;
    }
    this.fetchMemberDetail(id);
  };

  /**
   * @todo [点击编辑会员事件:跳转到编辑会员页面]
   *
   * @memberof MemberMain
   */
  public onEditClick = () => {
    Taro.navigateTo({
      url: `/pages/member/member.edit?id=${this.$router.params.id}`
    });
  };

  public fetchMemberDetail = async (id: string) => {
    const result = await MemberAction.memberDetail({ id: Number(id) });
    if (!!result.success) {
      const coupons = await MerchantService.getMemberCoupons({
        phone: result.result.phoneNumber
      });
      if (coupons.code === ResponseCode.success) {
        this.setState({ couponsList: coupons.data.rows });
      }
    }
    MemberAction.memberPreference({ id: Number(id) });
  };

  public renderCouponeModal = () => {
    const { showCoupon, couponsList } = this.state;
    return (
      <ModalLayout
        visible={showCoupon}
        onClose={() => this.setState({ showCoupon: false })}
        // contentClassName={`${cssPrefix}-layout`}
        title="优惠券"
      >
        <View className={`inventory-select`}>
          {!!couponsList && couponsList.length > 0 && (
            <ScrollView scrollY={true} className={`${cssPrefix}-coupons`}>
              {couponsList.map((item: any) => {
                return (
                  <CouponItem
                    key={(item as any).id}
                    coupon={{
                      ...item,
                      ableToUse: true
                    }}
                    touchable={false}
                    onClick={() => {}}
                  />
                );
              })}
            </ScrollView>
          )}
        </View>
      </ModalLayout>
    );
  };

  render() {
    const { memberDetail } = this.props;
    const form1: FormRowProps[] = [
      {
        title: "上次消费时间",
        extraText: `${memberDetail.lastPayTime || "暂无消费记录"}`
      }
    ];
    const form4: FormRowProps[] = [
      {
        title: "积分",
        extraText: `${memberDetail.points || 0}`
      },
      {
        title: "储值余额",
        extraText: `￥${numeral(memberDetail.accumulativeMoney).format("0.00")}`
      },
      {
        title: "优惠券",
        arrow: "right",
        extraText: `${(memberDetail.couponVOS &&
          memberDetail.couponVOS.length) ||
          0}`,
        onClick: () => this.setState({ showCoupon: true }),
        hasBorder: false
      }
    ];
    const form2: FormRowProps[] = [
      {
        title: "卡号",
        extraText: memberDetail.cardNo
      },
      {
        title: "性别",
        extraText: memberDetail.sex === "0" ? "先生" : memberDetail.sex === "1" ? "女士" : "未知"
      },
      {
        title: "生日",
        extraText: memberDetail.birthDate,
        hasBorder: false
      }
    ];
    const form3: FormRowProps[] = [
      {
        title: "开卡时间",
        extraText: memberDetail.createTime
      },
      {
        title: "会员状态",
        extraText: memberDetail.status === 0 ? "正常" : "注销",
        hasBorder: false
      }
    ];
    return (
      <View className={`container`}>
        <Image
          src="//net.huanmusic.com/weapp/v1/bg_member.png"
          className={`${cssPrefix}-bg`}
        />
        {!memberDetail.id ? (
          <View className={`container ${cssPrefix}-member`}>
            <AtActivityIndicator mode="center" />
          </View>
        ) : (
          <View
            className={`container ${cssPrefix} ${cssPrefix}-pos container-color`}
          >
            <View className={`${cssPrefix}-detail-zindex`}>
              <Card card-class="home-card member-card">
                <View className={`${cssPrefix}-detail-img`}>
                  <View
                    className={`${cssPrefix}-detail-avator`}
                    style={
                      memberDetail.avatar
                        ? `background-image: url(${memberDetail.avatar})`
                        : `background-image: url(//net.huanmusic.com/weapp/icon_vip_user.png)`
                    }
                  />
                </View>
                <View className={`${cssPrefix}-detail`}>
                  <View className={`title-text ${cssPrefix}-detail-name`}>
                    {memberDetail.username || ""}
                    <View className={`${cssPrefix}-detail-name-level`}>
                      {memberDetail.levelName}
                    </View>
                  </View>
                  <View className="normal-text">
                    {memberDetail.phoneNumber || ""}
                  </View>
                </View>
                <View className="home-buttons member-buttons">
                  <View className="member-buttons-button home-buttons-button-border">
                    <View className="title-text">
                      ￥ {numeral(memberDetail.totalAmount || 0).format("0.00")}
                    </View>
                    <View className="small-text">累计消费</View>
                  </View>
                  <View className="member-buttons-button">
                    <View className="title-text">
                      {numeral(memberDetail.totalTimes || 0).value()}
                    </View>
                    <View className="small-text">购买次数</View>
                  </View>
                </View>
              </Card>
            </View>

            <View className="product-add">
              <FormCard items={form1}>
                <FormRow
                  title="消费偏好"
                  hasBorder={false}
                  extraText={
                    memberDetail.preferenceVo &&
                    memberDetail.preferenceVo.length > 0
                      ? ""
                      : "暂无消费偏好"
                  }
                >
                  {memberDetail.preferenceVo.length > 0 &&
                    memberDetail.preferenceVo.map(perference => {
                      return (
                        <View
                          key={perference.typeId}
                          className={`${cssPrefix}-detail-row-icons`}
                        >
                          <View className={`${cssPrefix}-detail-row-icon`}>
                            {perference.typeName}
                          </View>
                        </View>
                      );
                    })}
                </FormRow>
              </FormCard>
              <FormCard items={form4} />
              <FormCard items={form2} />
              <FormCard items={form3} />
            </View>
          </View>
        )}
        <View className={`product-add-buttons`}>
          <View className={`product-add-buttons-button`}>
            <AtButton className="theme-button " onClick={this.onEditClick}>
              <Text className="theme-button-text">编辑</Text>
            </AtButton>
          </View>
          <View className={`product-add-buttons-button`}>
            <AtButton
              className="theme-button"
              onClick={() => Taro.showToast({ title: "开发中", icon: "none" })}
            >
              <Text className="theme-button-text">会员充值</Text>
            </AtButton>
          </View>
        </View>
        {this.renderCouponeModal()}
      </View>
    );
  }
}

const mapState = (state: AppReducer.AppState) => ({
  memberDetail: getMemberDetail(state),
  memberPerference: getMemberPerference(state)
});

export default connect(mapState)(MemberMain);
