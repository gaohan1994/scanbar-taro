// @ts-ignore
const getBaseUrl = (url: string) => {
  let BASE_URL = "";
  if (process.env.NODE_ENV === "development") {
    // 开发环境 - 根据请求不同返回不同的BASE_URL
    // BASE_URL = 'http://172.30.200.231:8089/inventory-app/api';
    // BASE_URL = 'http://172.30.200.76:8089/inventory-app/api';
    BASE_URL = "https://inventory.51cpay.com/inventory-app";
  } else {
    // 生产环境
    BASE_URL = "https://xyt.51cpay.com/inventory-app";
  }
  return BASE_URL;
};

export default getBaseUrl;
