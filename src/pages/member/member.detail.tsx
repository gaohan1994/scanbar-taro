/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-03-20 10:59:11
 */
import Taro from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import "../style/member.less";
import "../style/product.less";
import "../style/home.less";
import { Card } from '../../component/common/card/card.common';
import FormCard from '../../component/card/form.card';
import FormRow, { FormRowProps } from '../../component/card/form.row';
import { AtButton, AtActivityIndicator } from 'taro-ui';
import { MemberAction } from '../../actions';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getMemberDetail, getMemberPerference, getMemberOrderInfo } from '../../reducers/app.member';
import { MemberInterface } from '../../constants';
import numeral from 'numeral';

const cssPrefix: string = 'member';

interface MemberMainProps { 
  memberDetail: MemberInterface.MemberInfo;
  memberPerference: MemberInterface.MemberPerference[];
  memberOrderInfo: MemberInterface.MemberOrderInfo;
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
    navigationBarTitleText: '会员详情'
  };

  componentWillMount = () => {
    const { id } = this.$router.params;
    if (!id) {
      console.error('请传入会员id');
      return;
    }
    this.fetchMemberDetail(id);
  }

  /**
   * @todo [点击编辑会员事件:跳转到编辑会员页面]
   *
   * @memberof MemberMain
   */
  public onEditClick = () => {
    Taro.navigateTo({
      url: `/pages/member/member.edit?id=${this.$router.params.id}`
    });
  }

  public fetchMemberDetail = (id: string) => {
    MemberAction.memberDetail({id: Number(id)});
    MemberAction.memberPreference({id: Number(id)});
    MemberAction.memberOrderInfo({id: Number(id)});
  }

  render () {
    const { memberDetail, memberPerference, memberOrderInfo } = this.props;
    const form1: FormRowProps[] = [
      {
        title: '上次消费时间',
        extraText: memberDetail.createTime
      }
    ];
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
    const form2: FormRowProps[] = [
      {
        title: '卡号',
        extraText: memberDetail.cardNo
      },
      {
        title: '性别',
        extraText: memberDetail.sex === '1' ? '先生' : '女士'
      },
      {
        title: '生日',
        extraText: memberDetail.birthDate,
        hasBorder: false
      },
    ];
    const form3: FormRowProps[] = [
      {
        title: '开卡时间',
        extraText: memberDetail.createTime
      },
      {
        title: '会员状态',
        extraText: memberDetail.status === 0 ? '正常' : '注销',
        hasBorder: false
      },
    ];
    return (
      <View className={`container`}>
        <Image src="//net.huanmusic.com/weapp/v1/bg_member.png" className={`${cssPrefix}-bg`} />
        {!memberDetail.id
        ? (
          <View className={`container ${cssPrefix}-member`}>
            <AtActivityIndicator mode="center" />
          </View>
        )
        : (
          <View className={`container ${cssPrefix} ${cssPrefix}-pos container-color`}>
            <View className={`${cssPrefix}-detail-zindex`}>
              <Card card-class="home-card member-card">
                <View className={`${cssPrefix}-detail-img`}>
                  <View 
                    className={`${cssPrefix}-detail-avator`} 
                    style={memberDetail.avatar 
                      ? `background-image: url(http://inventory.51cpay.com/memberAvatar/${memberDetail.avatar})` 
                      : '//net.huanmusic.com/weapp/icon_vip_user.png'}
                  />
                </View>
                <View className={`${cssPrefix}-detail`}>
                  <View className={`title-text ${cssPrefix}-detail-name`}>
                    {memberDetail.username || ''}
                    <View className={`${cssPrefix}-detail-name-level`}>
                      {this.setLevel(memberDetail.levelId || 1)}
                    </View>
                  </View>
                  <View className="normal-text">{memberDetail.phoneNumber || ''}</View>
                </View>
                <View className="home-buttons member-buttons">
                  <View className="member-buttons-button home-buttons-button-border">
                    <View className="title-text">￥ {numeral(memberOrderInfo.totalAmount || 0).format('0.00')}</View>
                    <View className="small-text">累计消费</View>
                  </View>
                  <View className="member-buttons-button">
                    <View className="title-text">{numeral(memberOrderInfo.totalTimes || 0).value()}</View>
                    <View className="small-text">购买次数</View>
                  </View>
                </View>
              </Card>
            </View>

            <View className="product-add">
              <FormCard items={form1} >
                <FormRow 
                  title="消费偏好" 
                  hasBorder={false}
                  extraText={memberPerference.length > 0 ? '' : '暂无消费偏好'}
                >
                  {
                    memberPerference.length > 0 && (
                      memberPerference.map((perference) => {
                        return (
                          <View 
                            key={perference.typeId} 
                            className={`${cssPrefix}-detail-row-icons`}
                          >
                            <View  className={`${cssPrefix}-detail-row-icon`}>{perference.typeName}</View>
                          </View>
                        );
                      })
                    )
                  }
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
            <AtButton 
              className="theme-button "
              onClick={this.onEditClick}
            >
              <Text className="theme-button-text" >编辑</Text>
            </AtButton>
          </View>
          <View className={`product-add-buttons-button`}>
            <AtButton 
              className="theme-button"
              onClick={() => {}}
            >
              <Text className="theme-button-text" >会员充值</Text>
            </AtButton>
          </View>
        </View>
      </View>
    );
  }

  private setLevel = (id: number): string => {
    if (id === 1) {
      return '普通会员';
    }
    return '普通会员';
  }
}

const mapState = (state: AppReducer.AppState) => ({
  memberDetail: getMemberDetail(state),
  memberPerference: getMemberPerference(state),
  memberOrderInfo: getMemberOrderInfo(state),
});

export default connect(mapState)(MemberMain);