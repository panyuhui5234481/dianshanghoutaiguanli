<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <div style="margin-top: 15px;">
        <el-row :gutter="20">
          <el-col :span="7">
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getuserlist">
              <el-button slot="append" icon="el-icon-search" @click="getuserlist"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="adddialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>
      </div>
      <!-- 用户展示页面 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column label="#" prop="id"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"> </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" active-color="yellow" inactive-color="black" @change="statechange(scope.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-tooltip effect="dark" content="修改" placement="top" :enterable="false" transition="liner">
              <el-button type="primary" icon="el-icon-edit" size="small" @click="showuser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="删除" placement="top" :enterable="false" transition="liner">
              <el-button type="danger" icon="el-icon-delete" size="small" @click="deleteuser(scope.row.id)"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false" transition="liner">
              <el-button type="warning" icon="el-icon-setting" size="small" @click="showfenpei(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="adddialogVisible" width="50%" @close="addclose">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addrules" ref="addruleForm" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="adddialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="adduser">添加</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editdialogVisible" width="50%" @close="editclose">
      <!-- 主体表单区域 -->
      <el-form :model="editForm" :rules="addrules" ref="editruleForm" label-width="70px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 页脚区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="edituser(editForm.id)">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="fenpeijuese" width="50%" @close="saverolesclose">
      <div>
        <p>当前的用户:{{ userInfo.username }}</p>
        <p>当前的角色:{{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedrole" placeholder="请选择角色">
            <el-option v-for="item in rolelist" :key="item.id" :label="item.roleName" :value="item.id"> </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fenpeijuese = false">取 消</el-button>
        <el-button type="primary" @click="savefenpei">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        // 显示内容
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条
        pagesize: 2
      },
      userlist: [],
      total: 0,
      // 控制添加对话框的显示与隐藏
      adddialogVisible: false,
      // 添加用户表单数据
      addForm: {
        userform: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户表单
      editForm: {
        userform: '',
        password: '',
        email: ''
      },
      // 添加表单验证规则
      addrules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          {
            required: true,
            pattern: /^1[34578]\d{9}$/, // 可以写正则表达式呦呦呦
            message: '目前只支持中国大陆的手机号码',
            trigger: 'blur'
          }
        ]
      },
      editdialogVisible: false,
      fenpeijuese: false,
      userInfo: {},
      rolelist: [],
      // 已选中的角色id值
      selectedrole: ''
    }
  },
  created() {
    this.getuserlist()
  },
  methods: {
    getuserlist() {
      this.$http.get('users', { params: this.queryInfo }).then(res => {
        console.log(res)
        if (res.status !== 200) {
          return this.$message.error('用户获取失败')
        } else {
          this.userlist = res.data.data.users
          this.total = res.data.data.total
        }
      })
    },
    // 监听每页显示条数改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getuserlist()
    },
    // 监听页码值改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getuserlist()
    },
    // 监听开关状态改变
    statechange(userinfo) {
      this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`).then(res => {
        if (res.data.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      })
    },
    // 监听表单关闭事件
    addclose() {
      this.$refs.addruleForm.resetFields()
    },
    // 监听修改表单关闭事件
    editclose() {
      this.$refs.editruleForm.resetFields()
    },
    // 添加事件表单预验证
    adduser() {
      this.$refs.addruleForm.validate(valid => {
        if (!valid) return
        this.$http.post('users', this.addForm).then(res => {
          if (res.data.meta.status !== 201) {
            this.$message.error('添加用户失败')
          } else {
            this.$message.success('添加用户成功')
            this.adddialogVisible = false
            this.getuserlist()
          }
        })
      })
    },
    // 修改表单预验证
    edituser(id) {
      this.$refs.editruleForm.validate(valid => {
        if (!valid) return
        this.$http.put('users/' + id, this.editForm).then(res => {
          if (res.data.meta.status !== 200) {
            this.$message.error('修改用户失败')
          } else {
            this.$message.success('修改用户成功')
            this.editdialogVisible = false
            this.getuserlist()
          }
        })
      })
    },
    // 点击修改用户事件
    showuser(id) {
      this.$http.get('users/' + id).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('查询用户信息失败')
        } else {
          this.editForm = res.data.data
          this.editdialogVisible = true
        }
      })
    },
    // 删除用户事件
    async deleteuser(id) {
      const res = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 如果用户点击确认返回值为字符串confirm
      // 如果用户取消了字符串,返回值为字符串cancel
      if (res !== 'confirm') {
        return this.$message.info('已经取消了删除')
      }
      this.$http.delete('users/' + id).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('用户删除成功')
        // 如果当前最后一页只有一条数据我们点击删除,也就是this.userlist==0时,需要使他的当前页码往前跳一页再进行渲染
        if (this.userlist.length === 1) {
          this.queryInfo.pagenum -= 1
        }
        this.getuserlist()
      })
    },
    // 打开分配角色对话框
    showfenpei(user) {
      this.userInfo = user
      // 获取所有角色列表
      this.$http.get('roles').then(res => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取角色列表失败')
          return false
        }
        this.rolelist = res.data.data
      })
      this.fenpeijuese = true
    },
    // 点击按钮分配角色
    savefenpei() {
      if (!this.selectedrole) {
        return this.$message.error('请选择要分配的角色')
      }
      this.$http
        .put(`users/${this.userInfo.id}/role`, {
          rid: this.selectedrole
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('分配角色失败')
          }
          this.$message.success('分配角色成功')
          this.getuserlist()
          this.fenpeijuese = false
        })
    },
    // 监听分配角色框关闭
    saverolesclose() {
      this.selectedrole = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
  font-size: 15px;
}
</style>
