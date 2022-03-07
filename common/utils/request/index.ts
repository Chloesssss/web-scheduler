import axios from "axios";
import { ElMessage } from 'element-plus'
//dolphinscheduler-api/dolphinscheduler-api
const instance = axios.create({
  baseURL: "/api",
  timeout: 90000,
  // `validateStatus` 定义对于给定的HTTP 响应状态码是 resolve 或 reject  promise 。如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 rejecte
  // validateStatus: function (status) {
  //   return status === 200;
  // },
  // headers: { "Content-Type": "application/json;charset=UTF-8" },
});
// 请求拦截
instance.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);
// 响应拦截
instance.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response;
    } else {
      response && response.data && ElMessage.error(response.data.msg)
      return Promise.reject();
    }
  },
  (error) => {
    // 生产环境中的接口异常情况统一描述为网络问题
    ElMessage.error(`${ error.response.status + (process.env.NODE_ENV === 'development' ? "! 接口请求失败!" : "! 请求失败, 请检查网络设置!" )}`)
    return Promise.reject(error.response);
  }
);
export default instance
