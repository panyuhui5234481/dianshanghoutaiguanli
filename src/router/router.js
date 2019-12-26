import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login.vue'
import Home from '../components/home.vue'
import Welcome from '../components/welcome.vue'
import User from '../components/userlist.vue'
import Rights from '../components/power/rights.vue'
import Roles from '../components/power/roles.vue'
import Cate from '../components/goods/cate.vue'
import Params from '../components/goods/params.vue'
import Goodslist from '../components/goods/goodslist.vue'
import Addgoods from '../components/goods/addgoods.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/home/welcome',
    children: [
      { path: '/home/welcome', component: Welcome },
      { path: '/home/users', component: User },
      { path: '/home/rights', component: Rights },
      { path: '/home/roles', component: Roles },
      { path: '/home/categories', component: Cate },
      { path: '/home/params', component: Params },
      { path: '/home/goods', component: Goodslist },
      { path: '/home/addgoods', component: Addgoods }
    ]
  }
]

const router = new VueRouter({
  routes
})
//  挂载路由守卫
router.beforeEach((to, from, next) => {
  //  to 将要访问的路径
  //  from 从哪个路径跳转而来
  //  next 函数，代表放行
  //  next（） 放行 next（'login') 强行跳转
  if (to.path === '/login') {
    return next()
  }
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) {
    return next('/login')
  }
  next()
})

export default router
