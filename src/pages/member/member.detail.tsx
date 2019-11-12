/*
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-12 11:17:10
 */
import Taro from '@tarojs/taro';
import { View, ScrollView, Image } from '@tarojs/components';
import "./style/member.less";
import "../home/style/home.less";
import { Card } from '../../component/common/card/card.common';
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { AtButton, AtActivityIndicator } from 'taro-ui';
import { MemberAction } from '../../actions';
import { connect } from '@tarojs/redux';
import { AppReducer } from '../../reducers';
import { getMemberDetail } from '../../reducers/app.member';
import { MemberInterface } from '../../constants';

const cssPrefix: string = 'member';

interface MemberMainProps { 
  memberDetail: MemberInterface.MemberInfo;
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
  }

  render () {
    const { memberDetail } = this.props;
    const form1: FormRowProps[] = [
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
        extraText: memberDetail.birthDate
      },
    ];
    const form2: FormRowProps[] = [
      {
        title: '开发门店',
        extraText: ''
      },
      {
        title: '开卡时间',
        extraText: memberDetail.createTime
      },
    ];
    const form3: FormRowProps[] = [
      {
        title: '会员状态',
        extraText: memberDetail.status === 0 ? '正常' : '注销'
      },
    ];
    return (
      <ScrollView scrollY={true} className={`container`}>
        <Image src="//net.huanmusic.com/weapp/bg_member.png" className={`${cssPrefix}-bg`} />
        {Number(this.$router.params.id) !== memberDetail.id
        ? (
          <View className={`container ${cssPrefix}-member`}>
            <AtActivityIndicator mode="center" />
          </View>
        )
        : (
          <View className={`container ${cssPrefix} ${cssPrefix}-pos`}>
            <Card card-class="home-card member-card">
              <View className={`${cssPrefix}-detail-img`}>
                <Image className={`${cssPrefix}-detail-avator`} src="//net.huanmusic.com/weapp/icon_user.png" />
              </View>
              <View className={`${cssPrefix}-detail`}>
                <View className="title-text">{memberDetail.username || ''}</View>
                <View className="small-text">{memberDetail.phoneNumber || ''}</View>
              </View>
              <View className="home-buttons member-buttons">
                <View className="member-buttons-button home-buttons-button-border">
                  <View className="title-text">100000.00</View>
                  <View className="small-text">累计消费</View>
                </View>
                <View className="member-buttons-button">
                  <View className="title-text">100000.00</View>
                  <View className="small-text">购买次数</View>
                </View>
              </View>
            </Card>
            <FormCard items={form1} />
            <FormCard items={form2} />
            <FormCard items={form3} />

            <View className={`${cssPrefix}-edit`}>
              <AtButton 
                className="theme-button "
                onClick={this.onEditClick}
              >
                编辑
              </AtButton>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }
}

const mapState = (state: AppReducer.AppState) => ({
  memberDetail: getMemberDetail(state),
});

export default connect(mapState)(MemberMain);