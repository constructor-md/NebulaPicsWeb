

// 是否是首次获取登录用户
import router from "@/router";
import {useLoginUserStore} from "@/stores/user";
import {message} from "ant-design-vue";

let firstFetchLoginUser = true;

/**
 * 全局权限校验
 */
router.beforeEach(async (to, from, next) => {
  const loginUserStore = useLoginUserStore()
  let loginUser = loginUserStore.loginUser
  // 页面刷新、首次加载时，等待后端返回永固信息再校验权限
  if (firstFetchLoginUser) {
    await loginUserStore.fetchLoginUser()
    loginUser = loginUserStore.loginUser
    firstFetchLoginUser = false
  }
  const toUrl = to.fullPath
  if (toUrl.startsWith('/admin')) {
    if (!loginUser || loginUser.userRole !== 'admin') {
      message.error("没有权限")
      next(`/user/login?redirect=${to.fullPath}`)
      return
    }
  }
  next()
})
