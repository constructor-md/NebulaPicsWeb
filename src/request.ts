import axios from "axios";
import { message} from "ant-design-vue";


// 创建axios实例
const myAxios = axios.create({
  baseURL: 'http://localhost:8123',
  timeout: 60000,
  // 需要携带Cookie时需要加
  withCredentials: true
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    const { data } = response;
    // 未登录
    if (data.code === 41000) {
      // 不是获取用户信息的请求，并且用户目前不是已经在用户登陆页面，就跳转到登陆页面
      if (
        !response.request.responseURL.includes('user/get/login') &&
        !window.location.pathname.includes('/user/login')
      ) {
        message.warning('请先登录')
        window.location.href = `/usr/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  function (error) {
    // Any status codes that falls outsides the range of 2xx cause this function tp trigger
    // Do something with response error
    return Promise.reject(error)
  }
)

export default myAxios
