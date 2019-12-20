<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/img/heima.png" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="out">退出登录</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏导航区 -->
      <el-aside :width="iscoll ? '64px' : '200px'">
        <div class="toggle-button" @click="lashen">|||</div>
        <el-row class="tac">
          <el-col :span="12" class="asidestyle">
            <el-menu default-active="2" class="el-menu-vertical-demo" background-color="#545c64" unique-opened :collapse="iscoll" :collapse-transition="false">
              <!-- 一级菜单 -->
              <el-submenu :index="item.id + ''" v-for="item in caidan" :key="item.id">
                <template slot="title">
                  <i :class="tubiao[item.id]"></i>
                  <span>{{ item.authName }}</span>
                </template>
                <!-- 二级菜单 -->
                <el-menu-item :index="item2.id + ''" v-for="item2 in item.children" :key="item2.id">
                  <i :class="tubiao.cha"></i>
                  {{ item2.authName }}
                </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-col>
        </el-row>
        <!-- 侧边栏导航区结束 -->
      </el-aside>
      <el-main><router-view></router-view></el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      caidan: [],
      tubiao: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-lock_fill',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao',
        cha: 'iconfont icon-tijikongjian'
      },
      iscoll: false
    }
  },
  created() {
    this.getlist()
  },
  methods: {
    out() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    getlist() {
      this.$http.get('menus').then(res => {
        res = res.data
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.caidan = res.data
      })
    },
    // 拉伸与折叠导航栏
    lashen() {
      this.iscoll = !this.iscoll
    }
  }
}
</script>
<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #545c64;
  span {
    color: #fff;
  }
}
.el-main {
  background-color: #eaedf1;
  border-right: none;
}
.home-container {
  height: 100%;
}
.asidestyle {
  width: 100%;
}
.el-menu-item {
  font-weight: 600;
  padding: 0;
  margin: 0;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  color: white;
  text-align: center;
  line-height: 24px;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
