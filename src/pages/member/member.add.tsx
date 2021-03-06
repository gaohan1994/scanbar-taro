/**
 * @Author: Ghan
 * @Date: 2019-11-01 15:43:06
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-08 11:24:23
 *
 * @todo 添加会员页面
 */
import Taro from "@tarojs/taro";
import { View, ScrollView, Picker } from "@tarojs/components";
import "../style/member.less";
import "../../component/card/form.card.less";
import FormCard from "../../component/card/form.card";
import { FormRowProps } from "../../component/card/form.row";
import { AtButton, AtMessage } from "taro-ui";
import FormRow from "../../component/card/form.row";
import Validator from "../../common/util/validator";
import invariant from "invariant";
import { MemberAction } from "../../actions";
import {
  MemberInterface,
  MemberInterfaceMap,
  MemberService
} from "../../constants";
import memberService from "../../constants/member/member.service";
import { ResponseCode } from "../../constants/index";
import { store } from "../../app";
import { connect } from "@tarojs/redux";
import { getMemberLevel } from "../../reducers/app.member";
import member from "src/constants/member/member";

const cssPrefix: string = "member";

export interface Props {
  memberLevel: MemberInterface.MemberLevel[];
  memberSelector: string[];
}

interface State {
  sex: "0" | "1" | undefined; // 会员性别 男士 女士 未知
  cardNo: string; // 会员卡号
  phone: string; // 会员手机号
  name: string; // 会员姓名
  birthday: string; // 会员生日
  memberStatus: boolean; // 会员状态
  needCallback: boolean; // 添加成功之后是否需要回调这个会员数据
  levelValue: number;
}

class MemberMain extends Taro.Component<Props, State> {
  readonly state: State = {
    sex: undefined,
    cardNo: "",
    phone: "",
    name: "",
    birthday: "",
    levelValue: 0,
    memberStatus: true,
    needCallback: false
  };
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: "添加会员"
  };

  componentWillMount() {
    const { params } = this.$router.params;

    if (params) {
      const payload = JSON.parse(params);

      if (payload.phoneNumber) {
        this.setState({ phone: payload.phoneNumber });
      }
      if (payload.needCallback) {
        this.setState({ needCallback: payload.needCallback });
      }
    }

    this.init();
  }

  public init = async () => {
    try {
      const levels = await MemberAction.memberLevelList();
      // if (levels.code === ResponseCode.success) {
      //   this.setState({levelName: levels.data[0].levelName});
      // }

      const result = await MemberService.getRandomCaroNo();
      invariant(result.code === ResponseCode.success, result.msg || " ");
      this.setState({ cardNo: result.data });
    } catch (error) {
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
  public onChangSex = (sex: "0" | "1" | undefined ) => {
    this.setState((prevState: State) => {
      return {
        ...prevState,
        sex
      };
    });
  };

  /**
   * @todo [卡号]
   *
   * @memberof MemberMain
   */
  public onChangeCardNo = (value: string) => {
    this.setState({ cardNo: value });
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

  public changeLevel = (event: any) => {
    const value: number = event.detail.value;
    this.setState({ levelValue: value });
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
    return { success: true, result: { phoneNumber: phone } };
  };

  /**
   * @todo [添加会员事件]
   * @todo [先校验用户输入，然后提交接口判断返回]
   *
   * @memberof MemberMain
   */
  public onAddMember = async () => {
    try {
      const { success, result } = this.validate();
      invariant(success, result || " ");

      const { memberLevel } = this.props;
      const { cardNo, name, levelValue } = this.state;
      let params: MemberInterface.MemberInfoAddParams = {
        ...result,
        birthDate: this.state.birthday || null,
        merchantId: 1,
        sex: this.state.sex,
        // sex: this.state.sex === "male" ? 0 : 1,
        status: this.state.memberStatus === true ? 0 : 1,
        levelId: memberLevel[levelValue] && memberLevel[levelValue].id
      };
      if (cardNo !== "") {
        params.cardNo = cardNo;
      }
      if (name !== "") {
        params.username = name;
      }
      const addResult = await MemberAction.memberAdd({ payload: params });
      invariant(addResult.success, addResult.result || " ");

      const { needCallback } = this.state;

      if (needCallback === true) {
        /**
         * @todo 如果需要添加完会员之后进行回调切需要这个会员数据则存到redux中
         */
        const memberDetail = await memberService.memberDetail({
          id: Number(addResult.result)
        });
        if (memberDetail.code === ResponseCode.success) {
          store.dispatch({
            type: MemberInterfaceMap.reducerInterfaces.SET_MEMBER_SELECT,
            payload: { selectMember: memberDetail.data }
          });
        }
      }

      // Taro.showToast({
      //   title: "添加会员成功",
      //   icon: "success",
      //   mask: true,
      //   success: () => {
      //     Taro.navigateBack();
      //   }
      // });

      Taro.showToast({
        title: "添加会员成功",
        icon: "success",
        duration: 1500
      });

      setTimeout(() => {
        const pages = Taro.getCurrentPages()
        const memberPage: Taro.Page = pages[pages.length - 2]
        memberPage.$component.onTabClick && memberPage.$component.onTabClick('create_time', 'desc')
        Taro.navigateBack({});
      }, 1500);
      
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  };

  render() {
    const { cardNo, levelValue } = this.state;
    const memberDetailForm: FormRowProps[] = [
      {
        title: "卡号",
        isInput: true,
        inputType: "number",
        inputValue: cardNo,
        inputOnChange: this.onChangeCardNo,
        inputPlaceHolder: "请输入会员卡号"
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
        hasBorder: false,
        inputName: "member.name",
        inputValue: this.state.name,
        inputPlaceHolder: "请输入姓名",
        inputOnChange: this.onChangeMemberName
      }
    ];

    const from2: FormRowProps[] = [
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
      }
    ];
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
            {from2.map(item => {
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
            <AtButton className="theme-button" onClick={this.onAddMember}>
              保存
            </AtButton>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const select = (state: any) => {
  const memberLevel = getMemberLevel(state);
  const memberSelector: string[] = memberLevel.map(item => {
    return item.levelName;
  });
  return {
    memberLevel,
    memberSelector
  };
};

export default connect(select)(MemberMain);
