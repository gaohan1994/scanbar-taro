import Taro from "@tarojs/taro";
import { HTTP_STATUS } from "./config";

const customInterceptor = (chain) => {
  const requestParams = chain.requestParams;

  return chain.proceed(requestParams).then((res) => {
    console.log("res.data", res.data);
    if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
      return Promise.reject("请求资源不存在");
    } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
      return Promise.reject("服务端出现了问题");
    } else if (res.statusCode === HTTP_STATUS.FORBIDDEN) {
      Taro.setStorageSync("Authorization", "");
      // pageToLogin()
      // TODO 根据自身业务修改
      return Promise.reject("没有权限访问");
    } else if (res.statusCode === HTTP_STATUS.AUTHENTICATE) {
      Taro.setStorageSync("Authorization", "");
      // pageToLogin()
      return Promise.reject("需要鉴权");
    } else if (res.data && (res.data.msg as string).indexOf("权限") !== -1) {
      return {
        ...res.data,
        msg: "您还没有权限",
      };
    } else if (res.data && res.data.code === "unauthorized") {
      const timeId = setTimeout(() => {
        clearTimeout(timeId);
        Taro.redirectTo({ url: "/pages/sign/login" });
      }, 1000);
      return { ...res.data, msg: res.msg || '还未授权或已过期，请重新登陆'};
    } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
      return res.data;
    }
  });
};

const interceptors = [customInterceptor, Taro.interceptors.logInterceptor];

export default interceptors;
