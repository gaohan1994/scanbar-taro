/**
 * @Author: Ghan 
 * @Date: 2019-11-01 15:43:06 
 * @Last Modified by: Ghan
 * @Last Modified time: 2019-11-11 10:41:10
 * 
 * @todo 添加会员页面
 */
import Taro from '@tarojs/taro';
import { View, ScrollView, Picker } from '@tarojs/components';
import "./style/member.less";
import FormCard from '../../component/card/form.card';
import { FormRowProps } from '../../component/card/form.row';
import { AtButton, AtMessage } from 'taro-ui';
import FormRow from '../../component/card/form.row';
import Validator from '../../common/util/validator';
import invariant from 'invariant';
import { MemberAction } from '../../actions';
import { MemberInterface } from '../../constants';

const cssPrefix: string = 'member';

interface Props { }

interface State { 
  sex: 'male' | 'female'; // 会员性别
  phone: string;          // 会员手机号
  name: string;           // 会员姓名
  birthday: string;       // 会员生日
  memberStatus: boolean;  // 会员状态
}

class MemberMain extends Taro.Component<Props, State> {
  readonly state: State = {
    sex: 'male',
    phone: '',
    name: '',
    birthday: '',
    memberStatus: true,
  };
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Taro.Config = {
    navigationBarTitleText: '添加会员'
  };

  /**
   * @todo [切换会员性别]
   * @todo [如果外部传入性别则改为外部传入的性别否则切换性别]
   * @memberof MemberMain
   */
  public onChangSex = (sex?: 'male' | 'female') => {
    this.setState(prevState => {
      return {
        ...prevState,
        sex: typeof sex === 'string' 
              ? sex 
              : prevState.sex === 'male'
                ? 'female'
                : 'male'
      };
    });
  }

  /**
   * @todo [用户修改姓名函数]
   *
   * @memberof MemberMain
   */
  public onChangeMemberName = (value: string) => {
    this.setState({ name: value });
  }

  /**
   * @todo [用户修改手机号函数]
   *
   * @memberof MemberMain
   */
  public onChangeMemberPhone = (value: string) => {
    this.setState({ phone: value });
  }

  /**
   * @todo [用户选择日期回调]
   *
   * @memberof MemberMain
   */
  public onDateChange = (event: any) => {
    this.setState({birthday: event.detail.value});
  }

  /**
   * @todo [修改会员状态]
   *
   * @memberof MemberMain
   */
  public onChangeMemberStatus = (status: boolean) => {
    this.setState({ memberStatus: status });
  }

  /**
   * @todo [判断是否通过校验]
   *
   * @memberof MemberMain
   */
  public validate = (): { success: boolean, result: any } => {
    const { phone, name } = this.state;
    const helper = new Validator();
    helper.add(phone, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入会员手机号',
    }, {
      strategy: 'isNumberVali',
      errorMsg: '请输入正确的手机号码'
    }]);

    helper.add(name, [{
      strategy: 'isNonEmpty',
      errorMsg: '请输入会员姓名',
    }]);

    const result = helper.start();
    if (result) {
      return { success: false, result: result.msg };
    }
    return { success: true, result: { phoneNumber: phone, username: name } };
  }

  /**
   * @todo [添加会员事件]
   * @todo [先校验用户输入，然后提交接口判断返回]
   *
   * @memberof MemberMain
   */
  public onAddMember = async () => {
    try {
      const { success, result } = this.validate();
      invariant(success, result || ' ');

      const params: MemberInterface.MemberInfoAddParams = {
        ...result,
        birthDate: this.state.birthday,
        merchantId: 1,
        sex: this.state.sex === 'male' ? 0 : 1,
        status: this.state.memberStatus === true ? 0 : 1,
      };
      const addResult = await MemberAction.memberAdd({payload: params});
      invariant(addResult.success, addResult.result || ' ');
      Taro.showToast({
        title: '添加会员成功',
        icon: 'success',
        mask: true,
        success: () => {
          Taro.navigateTo({url: `/pages/member/member`});
        }
      });
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  render () {
    const memberDetailForm: FormRowProps[] = [
      {
        title: '卡号',
        buttons: [
          {
            title: '保存后自动生成',
            type: 'cancel',
            onPress: () => { /** */ }
          }
        ]
      },
      {
        title: '手机号',
        isInput: true,
        inputName: 'member.phone',
        inputValue: this.state.phone,
        inputPlaceHolder: '请输入手机号码',
        inputOnChange: this.onChangeMemberPhone,
        inputType: 'phone',
      },
      {
        title: '姓名',
        isInput: true,
        inputName: 'member.name',
        inputValue: this.state.name,
        inputPlaceHolder: '请输入姓名',
        inputOnChange: this.onChangeMemberName,
      },
      {
        title: '性别',
        buttons: [
          {
            title: '先生',
            type: this.state.sex === 'male' ? 'confirm' : 'cancel',
            onPress: () => this.onChangSex('male')
          },
          {
            title: '女士',
            type: this.state.sex !== 'male' ? 'confirm' : 'cancel',
            onPress: () => this.onChangSex('female')
          }
        ]
      }
    ];
    const memberStoreDetail: FormRowProps[] = [
      {
        title: '开卡门店',
        buttons: [
          {
            title: '保存后自动生成',
            type: 'cancel',
            onPress: () => { /** */ }
          }
        ]
      },
      {
        title: '开卡时间',
        buttons: [
          {
            title: '保存后自动生成',
            type: 'cancel',
            onPress: () => { /** */ }
          }
        ]
      },
    ];
    const memberStatusForm: FormRowProps[] = [
      {
        title: '会员状态',
        buttons: [
          {
            title: '正常',
            type: this.state.memberStatus === true ? 'confirm' : 'cancel',
            onPress: () => this.onChangeMemberStatus(true)
          },
          {
            title: '停用',
            type: this.state.memberStatus !== true ? 'confirm' : 'cancel',
            onPress: () => this.onChangeMemberStatus(false)
          }
        ]
      },
    ];
    return (
      <ScrollView scrollY={true} className={`container`}>
        <AtMessage />
        <View className={`container ${cssPrefix}`}>
          <FormCard items={memberDetailForm}>
            <Picker 
              mode='date'
              onChange={this.onDateChange} 
              value={this.state.birthday}
            >
              <FormRow 
                title="生日" 
                extraText={this.state.birthday || '请选择生日'} 
              />
            </Picker>
          </FormCard>
          <FormCard items={memberStoreDetail} />
          <FormCard items={memberStatusForm} />

          <View className={`${cssPrefix}-edit`}>
            <AtButton 
              className="theme-button "
              onClick={this.onAddMember}
            >
              保存
            </AtButton>
          </View>
        </View>
      </ScrollView>
    );
  }
}

export default MemberMain;