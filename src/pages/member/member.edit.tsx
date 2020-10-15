/*
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-22 16:10:01
 */
import Taro from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import "../style/member.less";
import "../../component/card/form.card.less";
import FormCard from "../../component/card/form.card";
import { FormRowProps } from "../../component/card/form.row";
import { AtButton, AtMessage } from "taro-ui";
import FormRow from "../../component/card/form.row";
import { MemberAction } from "../../actions";
import invariant from "invariant";
import { MemberInterface } from "../../constants";
import Validator from "../../common/util/validator";
import { debounce } from '../../common/util/common'
import { AppReducer } from "../../reducers";
import { getMemberDetail, getMemberLevel } from "../../reducers/app.member";
import { connect } from "@tarojs/redux";
import { Props as AddProps } from "./member.add";
import { ResponseCode } from "../../constants/index";
// import debounce from 'lodash.debounce'

const cssPrefix: string = "member";

interface Props extends AddProps {
  memberDetail: MemberInterface.MemberInfo;
}

interface State {
  sex: "0" | "1" | string | undefined; // 会员性别
  phone: string; // 会员手机号
  name: string; // 会员姓名
  birthday: string; // 会员生日
  memberStatus: boolean; // 会员状态
  cardNo: string; // 会员卡号
  createTime: string; // 开卡时间
  levelValue: number;
}



class MemberMain extends Taro.Component<Props, State> {
  readonly state: State = {
    sex: "0",
    phone: "",
    name: "",
    birthday: "1990-01-01",
    memberStatus: true,
    cardNo: "",
    createTime: "",
    levelValue: 0
  };
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: "会员编辑"
  };

  componentWillMount() {
    const { id } = this.$router.params;
    if (!id) {
      console.error("请传入会员id");
      return;
    }
    this.fetchMemberDetail(id);
  }

  public fetchMemberDetail = async (id: string) => {
    try {
      Taro.showLoading();
      const levels = await MemberAction.memberLevelList();
      const { success, result } = await MemberAction.memberDetail({
        id: Number(id)
      });
      invariant(success, result || " ");
      const memberInfo: MemberInterface.MemberInfo = result;
      this.setState(
        {
          sex: memberInfo.sex || undefined,
          phone: memberInfo.phoneNumber,
          name: memberInfo.username,
          birthday: memberInfo.birthDate || "",
          memberStatus: memberInfo.status === 0 ? true : false,
          cardNo: memberInfo.cardNo || "",
          createTime: memberInfo.createTime,
          levelValue:
            levels.code === ResponseCode.success
              ? (levels.data as any).rows.findIndex(
                  l => l.id === memberInfo.levelId
                )
              : 0
        },
        () => {
          Taro.hideLoading();
        }
      );
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  /**
   * @todo [切换会员性别]
   * @todo [如果外部传入性别则改为外部传入的性别否则切换性别]
   * @memberof MemberMain
   */
  public onChangSex = (sex: "0" | "1" | undefined) => {
    this.setState((prevState: State) => {
      return {
        ...prevState,
        sex
      };
    });
  };

  public changeLevel = (event: any) => {
    const value: number = event.detail.value;
    this.setState({ levelValue: value });
  };

  /**
   * @todo [用户修改姓名函数]
   *
   * @memberof MemberMain
   */
  public onChangeMemberName = (value: string) => {
    this.setState({ name: value });
  };

  /**
   * @todo [用户修改手机号函数]
   *
   * @memberof MemberMain
   */
  public onChangeMemberPhone = (value: string) => {
    this.setState({ phone: value });
  };

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateChange = (event: any) => {
    this.setState({ birthday: event.detail.value });
  };

  /**
   * @todo [修改会员状态]
   *
   * @memberof MemberMain
   */
  public onChangeMemberStatus = (status: boolean) => {
    this.setState({ memberStatus: status });
  };

  /**
   * @todo [判断是否通过校验]
   *
   * @memberof MemberMain
   */
  public validate = (): { success: boolean; result: any } => {
    const { phone, name } = this.state;
    const helper = new Validator();
    helper.add(phone, [
      {
        strategy: "isNonEmpty",
        errorMsg: "请输入会员手机号"
      },
      {
        strategy: "isNumberVali",
        errorMsg: "请输入正确的手机号码"
      }
    ]);

    helper.add(name, [
      {
        strategy: "isNonEmpty",
        errorMsg: "请输入会员姓名"
      }
    ]);

    const result = helper.start();
    if (result) {
      return { success: false, result: result.msg };
    }
    return { success: true, result: { phoneNumber: phone, username: name } };
  };

  /**
   * @todo [添加会员事件]
   * @todo [先校验用户输入，然后提交接口判断返回]
   *
   * @memberof MemberMain
   */
  public onSaveMember = async () => {
    try {
      Taro.showLoading();
      const { success, result } = this.validate();
      invariant(success, result || " ");

      const { levelValue } = this.state;
      const { memberDetail, memberLevel } = this.props;
      const params: MemberInterface.MemberInfoEditParams = {
        ...result,
        merchantId: memberDetail.merchantId,
        sex: this.state.sex,
        status: this.state.memberStatus === true ? 0 : 1,
        birthDate: this.state.birthday,
        cardNo: memberDetail.cardNo,
        id: memberDetail.id,
        levelId: memberLevel[levelValue] && memberLevel[levelValue].id
      };
      const editResult = await MemberAction.memberEdit(params);
      invariant(editResult.success, editResult.result || " ");
      Taro.hideLoading();
      Taro.showToast({
        title: "修改成功",
        icon: "success",
        duration: 1500
      });

      setTimeout(() => {
        const { id } = this.$router.params;
        const pages = Taro.getCurrentPages()
        const memberPage: Taro.Page = pages[pages.length - 2]
        memberPage.$component.fetchMemberDetail(id)
        Taro.navigateBack({});
      }, 1500);
    } catch (error) {
      Taro.hideLoading();
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  render() {
    const memberDetailForm: FormRowProps[] = [
      {
        title: "卡号",
        extraText: this.state.cardNo,
        disabled: false
      },
      {
        title: "手机号",
        isInput: true,
        inputName: "member.phone",
        inputValue: this.state.phone,
        inputPlaceHolder: "请输入手机号码",
        inputOnChange: this.onChangeMemberPhone,
        inputType: "phone"
      },
      {
        title: "姓名",
        isInput: true,
        inputName: "member.name",
        inputValue: this.state.name,
        inputPlaceHolder: "请输入姓名",
        inputOnChange: this.onChangeMemberName
      }
    ];

    const form2 = [
      {
        title: "性别",
        buttons: [
          {
            title: "先生",
            type: this.state.sex === "0" ? "confirm" : "cancel",
            onPress: () => this.onChangSex("0")
          },
          {
            title: "女士",
            type: this.state.sex === "1" ? "confirm" : "cancel",
            onPress: () => this.onChangSex("1")
          }
        ]
      },
      {
        title: "状态",
        buttons: [
          {
            title: "启用",
            type: !!this.state.memberStatus ? "confirm" : "cancel",
            onPress: () => this.onChangeMemberStatus(true)
          },
          {
            title: "禁用",
            type: !this.state.memberStatus ? "confirm" : "cancel",
            onPress: () => this.onChangeMemberStatus(false)
          }
        ]
      }
    ];
    const { levelValue } = this.state;
    const { memberSelector, memberLevel } = this.props;

    return (
      <ScrollView scrollY={true} className={`container`}>
        <AtMessage />
        <View className={`container ${cssPrefix} ${cssPrefix}-add`}>
          <FormCard items={memberDetailForm} />
          <View className="component-form">
            <Picker
              mode="selector"
              range={memberSelector}
              onChange={this.changeLevel}
              value={levelValue}
            >
              <FormRow
                title="等级"
                extraText={
                  (memberLevel[levelValue] &&
                    memberLevel[levelValue].levelName) ||
                  ""
                }
                arrow="right"
              />
            </Picker>
            {form2.map(item => {
              return <FormRow key={item.title} {...item} />;
            })}
            <Picker
              mode="date"
              onChange={this.onDateChange}
              value={this.state.birthday}
            >
              <FormRow
                title="生日"
                extraText={this.state.birthday || "请选择生日"}
                hasBorder={false}
              />
            </Picker>
          </View>
          <View className={`${cssPrefix}-edit`}>
            <AtButton className="theme-button " onClick={debounce(this.onSaveMember, 300)}>
              保存
            </AtButton>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const mapState = (state: AppReducer.AppState) => {
  const memberDetail = getMemberDetail(state);
  const memberLevel = getMemberLevel(state);
  const memberSelector: string[] = memberLevel.map(item => {
    return item.levelName;
  });
  return {
    memberDetail,
    memberLevel,
    memberSelector
  };
};

export default connect(mapState)(MemberMain);
