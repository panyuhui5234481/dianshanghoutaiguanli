import Vue from 'vue'
import App from './App.vue'
import router from './router/router.js'
import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import ZkTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

// timeline
import Timeline from './assets/js/timeline/index.js'
import TimelineItem from './assets/js/timeline-item/index.js'
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(VueQuillEditor)
Vue.use(ZkTable)

Vue.use(Timeline)
Vue.use(TimelineItem)
// 配置请求根路径
axios.defaults.baseURL = `http://127.0.0.1:8888/api/private/v1/`
// axios拦截器
// 按要求在表头Authorization属性加入token
axios.interceptors.request.use(config => {
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
axios.interceptors.response.use(config => {
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.filter('dateFormat', function(time) {
  let date = new Date(time) // time 时间戳（通常为13位）
  let Y = date.getFullYear()
  let M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1
  let D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  let H = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
  let Min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
  let S = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()
  let times = Y + '-' + M + '-' + D + ' ' + H + ':' + Min + ':' + S
  return times //  eg:  2018-08-02 09:30:12
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
