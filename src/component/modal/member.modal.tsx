import Taro from '@tarojs/taro';
import { View, Image } from '@tarojs/components';
import "../card/form.card.less";
import '../../pages/style/product.less';
import '../../styles/theme.less';
import "../cart/cart.less";
import classnames from 'classnames';
import { FormRowProps } from '../../component/card/form.row';
import numeral from 'numeral';
import { Card } from '../../component/common/card/card.common';
import FormRow from '../../component/card/form.row';
import ButtonFooter from '../../component/button/button.footer';
import { MemberInterface } from 'src/constants';

const cssPrefix = 'product';

export interface SelectMember extends MemberInterface.MemberInfo {
  perference?: MemberInterface.MemberPerference[];
  orderInfo?: MemberInterface.MemberOrderInfo;
}

type Props = {
  visible: boolean;
  selectMember: SelectMember;
  onClose: () => void;
  buttons?: any;
};

class Page extends Taro.Component<Props> {
  render () {
    const { visible, selectMember, onClose, buttons } = this.props;
    if (selectMember !== undefined && visible) {
      const cssPrefix = 'member';
      const memberForm: FormRowProps[] = [{
        title: '上次消费时间',
        extraText: selectMember.orderInfo !== undefined ? selectMember.orderInfo.lastPayTime : '暂无消费记录'
      }];
      const form4: FormRowProps[] = [
        {
          title: '积分',
          extraText: '1000'
        },
        {
          title: '储值余额',
          extraText: '￥2000',
        },
        {
          title: '优惠券',
          extraText: '5',
          hasBorder: false
        },
      ];
      return (
        <View className={`product-pay-member-layout-mask`} >
          <View
            className={`product-pay-member-layout-mask product-pay-member-layout-transparent`}
            onClick={onClose}
          />
          <View className={`product-pay-member-layout-box product-pay-member-layout-container`}>
            <View
              className={`product-detail-modal-close`}
              onClick={onClose}
            >
              <Image
                className={`product-detail-modal-close-image`}
                src="//net.huanmusic.com/weapp/icon_del_1.png"
              />
            </View>
            <Card card-class="home-card member-card product-pay-member-layout-card">
              <View className={classnames(`${cssPrefix}-detail-img`)}>
                <Image className={`${cssPrefix}-detail-avator`} src="//net.huanmusic.com/weapp/icon_user.png" />
              </View>
              <View className={`${cssPrefix}-detail`}>
                <View className={`title-text ${cssPrefix}-detail-name`}>
                  {selectMember.username || ''}
                  <View className={`${cssPrefix}-detail-name-level`}>{selectMember.levelName}</View>
                </View>
                <View className="small-text">{selectMember.phoneNumber || ''}</View>
              </View>
              <View className="home-buttons member-buttons">
                <View className="member-buttons-button home-buttons-button-border">
                  <View className="title-text">
                    ￥{numeral(selectMember.orderInfo !== undefined && selectMember.orderInfo.totalAmount || 0).format('0.00')}
                  </View>
                  <View className="small-text">累计消费</View>
                </View>
                <View className="member-buttons-button">
                  <View className="title-text">
                    {numeral(selectMember.orderInfo !== undefined && selectMember.orderInfo.totalTimes || 0).value()}
                  </View>
                  <View className="small-text">购买次数</View>
                </View>
              </View>
            </Card>
            <Card card-class="home-card member-card">
              {memberForm.map((item) => {
                return <FormRow key={item.title} {...item} />;
              })}
              <FormRow
                title="消费偏好"
                hasBorder={false}
                extraText={selectMember.perference !== undefined && selectMember.perference.length > 0 ? '' : '暂无消费偏好'}
              >
                {
                  selectMember.perference !== undefined && selectMember.perference.length > 0 && (
                    selectMember.perference.map((perference) => {
                      return (
                        <View
                          key={perference.typeId}
                          className={`member-detail-row-icons`}
                        >
                          <View className={`member-detail-row-icon`}>{perference.typeName}</View>
                        </View>
                      );
                    })
                  )
                }
              </FormRow>
            </Card>
            <Card card-class="home-card member-card">
              {form4.map((item) => {
                return <FormRow key={item.title} {...item} />;
              })}
            </Card>
            <View style="height: 100px; width: 100%" />
            {buttons && buttons.length > 0 && (
              <ButtonFooter
                buttons={buttons}
              />
            )}
          </View>
        </View>
      );
    }
    return (
      <View />
    );
  }
}
export default Page;