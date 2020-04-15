/*
 * @Author: Ghan 
 * @Date: 2019-11-01 10:07:05 
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-04-15 15:32:51
 */
import Taro, { useState, useEffect } from '@tarojs/taro';
import { View, Image, Text, Input, Picker } from '@tarojs/components';
import '../style/login.less';
import classnames from 'classnames';
import { AtButton } from 'taro-ui';
import invariant from 'invariant';
import merchantAction from '../../actions/merchant.action';
import { ResponseCode } from '../../constants/index';

const cssPrefix = 'sign';

function RegisterPage () {
  const [step, setStep] = useState(1);
  const [checked, setChecked] = useState(true);
  const [merchantNumber, setMerchantNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vercode, setVercode] = useState('');
  const [count, setCount] = useState(0);
  
  const [merchantProp, setMerchantProp] = useState([] as any[]);
  useEffect(() => {
    merchantAction.merchantInfoType().then((response) => {
      if (response.code === ResponseCode.success) {
        setMerchantProp(response.data.rows);
      }
    });
  }, []);

  useEffect(() => {
    let timer;

    if (count !== 0) {
      timer = setInterval(() => {
        setCount((num) => {
          if (num === 1) {
            clearInterval(timer);
          }
          return num - 1;
        });
      }, 1000);
    }
    return () => {
      clearInterval(timer);
    };
  }, [count]);

  const form1 = [{
    title: '机构号',
    value: merchantNumber,
    onChange: (value) => setMerchantNumber(value)
  }, {
    title: '手机号',
    value: phone,
    onChange: (value) => setPhone(value)
  }, {
    title: '密码',
    value: password,
    onChange: (value) => setPassword(value)
  }];

  const [contact, setContact] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [business, setBusiness] = useState(0);
  const form2 = [{
    title: '联系人',
    value: contact,
    onChange: (value) => setContact(value)
  }, {
    title: '店铺名称',
    value: merchantName,
    onChange: (value) => setMerchantName(value)
  }];

  async function getVercode () {
    try {
      invariant(!!phone, '请填写手机号');
      setCount(60);
      const result = await merchantAction.getCode(phone);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  async function onRegister () {
    try {
      const payload = {
        address: "",
        contactName: contact,
        institutionCode: Number(merchantNumber),
        location: 0,
        merchantName: merchantName,
        merchantProp: merchantProp[business].dictValue,
        password: password,
        phone: phone,
        validCode: Number(vercode)
      };
      const result = await merchantAction.register(payload);
      invariant(result.code === ResponseCode.success, result.msg || ' ');
      Taro.showToast({
        title: '注册成功'
      });
      // 接下来流程怎么走？
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  function onLogin () {
    try {
      if (step === 1) {
        invariant(!!checked, '请勾选隐私协议');
        invariant(!!merchantNumber, '请填写机构号');
        invariant(!!phone, '请填写手机号');
        invariant(!!password, '请填写密码');
        invariant(!!vercode, '请填写验证码');
        setStep(2);
        return;
      }
      const payload = {};
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  }

  return (
    <View className={classnames(['container', 'sign', ])} >
      {step === 1
      ? (
        <View className="sign-card sign-card-register">
          <View className="sign-step">
            <View className='sign-step-item sign-step-1' />
          </View>
          {form1.map((form) => {
            return (
              <View 
                className="sign-card-input"
                key={form.title}
              >
                <View className={`${cssPrefix}-input-box`} >
                  <View className={`${cssPrefix}-input-title`}>{form.title}</View>
                  <View className={`${cssPrefix}-input-container`}>
                    <Input
                      className={`${cssPrefix}-input-box-input`} 
                      value={form.value}
                      password={form.title === '密码'}
                      onInput={({detail: {value}}) => form.onChange(value)}
                      placeholder={`请输入${form.title}`}
                      placeholderStyle="fontSize: 26px; color: #cccccc"
                      type="number"
                    />
                  </View>
                </View>
              </View>
            );
          })}

          <View className="sign-card-input" style='display: flex; flex-direction: row'>
            <View className={`${cssPrefix}-input-box ${cssPrefix}-input-box-vercode`} >
              <View className={`${cssPrefix}-input-title`}>验证码</View>
              <View className={`${cssPrefix}-input-container`}>
                <Input
                  className={`${cssPrefix}-input-box-input`} 
                  value={vercode}
                  onInput={({detail: {value}}) => setVercode(value)}
                  placeholder="请输入验证码"
                  placeholderStyle="fontSize: 26px; color: #cccccc"
                  type="number"
                />
              </View>
            </View>

            <View 
              className={`${cssPrefix}-input-box ${cssPrefix}-input-box-button`} 
              onClick={() => {
                if (count === 0) {
                  getVercode();
                }
              }}
            >
              {count === 0 ? '获取验证码' : `重发(${count}s)`}
            </View>
          </View>
          
          <View className={classnames(['sign-card-check'])}>
            {
              !!checked
              ? (
                <Image onClick={() => setChecked(false)} className="sign-card-check-icon" src="http://net.huanmusic.com/weapp/icon_pitchon.png" />
              )
              : (
                <View onClick={() => setChecked(true)} className={classnames(['sign-card-check-icon', 'sign-card-check-uncheck'])} />
              )
            }
            <Text className="small-text">登录代表您已同意用户协议和隐私权政策</Text>
          </View>
          <AtButton 
            type='primary' 
            className="theme-button" 
            disabled={!checked}
            onClick={() => onLogin()}
          >
            下一步
          </AtButton>
        </View>
      )
      : (
        <View className="sign-card sign-card-register2">
          <View className="sign-step">
            <View className='sign-step-item sign-step-2' />
          </View>

          {form2.map((form) => {
            return (
              <View 
                className="sign-card-input"
                key={form.title}
              >
                <View className={`${cssPrefix}-input-box`} >
                  <View className={`${cssPrefix}-input-title`}>{form.title}</View>
                  <View className={`${cssPrefix}-input-container`}>
                    <Input
                      className={`${cssPrefix}-input-box-input`} 
                      value={form.value}
                      onInput={({detail: {value}}) => form.onChange(value)}
                      placeholder={`请输入${form.title}`}
                      placeholderStyle="fontSize: 26px; color: #cccccc"
                      type="number"
                    />
                  </View>
                </View>
              </View>
            );
          })}

          <Picker
            mode="selector"
            range={merchantProp && (merchantProp as any[]).length > 0 ? merchantProp.map((item) => item.dictLabel) : []}
            onChange={({detail: {value}}) => setBusiness(value)}
            value={business}
          >
            <View className="sign-card-input">
              <View className={`${cssPrefix}-input-box`} >
                <View className={`${cssPrefix}-input-title`}>所属行业</View>
                <View className={`${cssPrefix}-input-container`}>
                  <View className={`${cssPrefix}-input-box-input`}>
                    {`${merchantProp && merchantProp.length > 0 ? merchantProp[business].dictLabel : '请选择所属行业'}`}
                  </View>
                </View>
              </View>
            </View>
          </Picker>

          <AtButton 
            type='primary' 
            className="theme-button sign-button" 
            disabled={!checked}
            onClick={() => onRegister()}
          >
            注册
          </AtButton>

          <View className='sign-bar'>
            <View 
              className='sign-bar-active'
              onClick={() => setStep(1)}
            >
              上一步
            </View>
            <View style='display: flex; flex-direction: row'>
              已有账号，
              <View 
                className='sign-bar-active'
                onClick={() => Taro.navigateTo({
                  url: `/pages/sign/login`
                })}
              >
                点击登录
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default RegisterPage;