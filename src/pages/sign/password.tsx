/*
 * @Author: Ghan
 * @Date: 2019-11-01 10:07:05
 * @Last Modified by: Ghan
 * @Last Modified time: 2020-05-22 14:14:01
 */
import Taro, { useState, useEffect } from "@tarojs/taro";
import { View, Image, Text, Input, Picker } from "@tarojs/components";
import "../style/login.less";
import classnames from "classnames";
import { AtButton } from "taro-ui";
import invariant from "invariant";
import merchantAction from "../../actions/merchant.action";
import { ResponseCode } from "../../constants/index";

const cssPrefix = "sign";

function ForgetPassword() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [vercode, setVercode] = useState("");
  const [count, setCount] = useState(0);

  async function getVercode() {
    try {
      invariant(!!phone, "请填写手机号");
      setCount(60);
      const result = await merchantAction.getCode(phone);
      invariant(result.code === ResponseCode.success, result.msg || " ");
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: "none"
      });
    }
  }

  async function findPassword() {
    console.log("findPassword");
  }

  const forms = [
    {
      title: "手机号",
      value: phone,
      onChange: value => setPhone(value)
    },
    {
      title: "密码",
      value: password,
      onChange: value => setPassword(value)
    }
  ];

  return (
    <View className={classnames(["container", "sign"])}>
      <View className="sign-card sign-card-register2">
        <View className="sign-step">
          <View className="sign-step-title">忘记密码</View>
        </View>
        {forms.map(form => {
          return (
            <View className="sign-card-input" key={form.title}>
              <View className={`${cssPrefix}-input-box`}>
                <View className={`${cssPrefix}-input-title`}>{form.title}</View>
                <View className={`${cssPrefix}-input-container`}>
                  <Input
                    className={`${cssPrefix}-input-box-input`}
                    value={form.value}
                    password={form.title === "密码"}
                    onInput={({ detail: { value } }) => form.onChange(value)}
                    placeholder={`请输入${form.title}`}
                    placeholderStyle="fontSize: 26px; color: #cccccc"
                    type="number"
                  />
                </View>
              </View>
            </View>
          );
        })}

        <View
          className="sign-card-input"
          style="display: flex; flex-direction: row"
        >
          <View
            className={`${cssPrefix}-input-box ${cssPrefix}-input-box-vercode`}
          >
            <View className={`${cssPrefix}-input-title`}>验证码</View>
            <View className={`${cssPrefix}-input-container`}>
              <Input
                className={`${cssPrefix}-input-box-input`}
                value={vercode}
                onInput={({ detail: { value } }) => setVercode(value)}
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
            {count === 0 ? "获取验证码" : `重发(${count}s)`}
          </View>
        </View>

        <AtButton
          type="primary"
          className="theme-button"
          onClick={() => findPassword()}
        >
          确定
        </AtButton>

        <View className="sign-bar sign-bar-margin">
          <View style="display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%">
            已有账号，
            <View
              className="sign-bar-active"
              onClick={() =>
                Taro.navigateTo({
                  url: `/pages/sign/login`
                })
              }
            >
              点击登录
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default ForgetPassword;
