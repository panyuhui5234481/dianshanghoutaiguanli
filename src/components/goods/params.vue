<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert title="注意:只允许为第三方分类设置相关参数!" type="warning" :closable="false" show-icon> </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="goodsrow">
        <span>选择商品分类:</span>
        <!-- 级联选择器区域 -->
        <div class="block">
          <el-cascader v-model="seletekeys" :options="goodscatelist" :props="cateprops" @change="handleChange" clearable></el-cascader>
        </div>
      </el-row>
      <!-- 选项卡区域 -->
      <el-row>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" :disabled="isbtnflag" @click="openadd">添加参数</el-button>
            <!-- 动态数据表格 -->
            <el-table :data="dongparams" stripe style="width: 100%" border>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag框 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="deletetag(i, scope.row)">
                    {{ item }}
                  </el-tag>
                  <!-- tag输入框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加的按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"> </el-table-column>
              <el-table-column prop="attr_name" label="参数名称"> </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" @click="showedit(scope.row.attr_id)">修改</el-button>
                  <el-button type="danger" icon="el-icon-delete" @click="deleteparams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" :disabled="isbtnflag" @click="openadd">添加属性</el-button>
            <!-- 静态属性表格 -->
            <el-table :data="jinparams" stripe style="width: 100%" border>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <!-- 循环渲染tag框 -->
                  <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="deletetag(i, scope.row)">
                    {{ item }}
                  </el-tag>
                  <!-- tag输入框 -->
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  >
                  </el-input>
                  <!-- 添加的按钮 -->
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"> </el-table-column>
              <el-table-column prop="attr_name" label="属性名称"> </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button type="primary" icon="el-icon-edit" @click="showedit(scope.row.attr_id)">修改</el-button>
                  <el-button type="danger" icon="el-icon-delete" @click="deleteparams(scope.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-row>
    </el-card>
    <!-- 添加参数对话框 -->
    <el-dialog :title="'添加' + titletext" :visible.sync="isaddflag" width="50%" @close="reset">
      <el-form :model="addform" :rules="addformrules" ref="addformref" label-width="100px">
        <el-form-item :label="titletext" prop="attr_name">
          <el-input v-model="addform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isaddflag = false">取 消</el-button>
        <el-button type="primary" @click="addparams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数对话框 -->
    <el-dialog :title="'修改' + titletext" :visible.sync="iseditflag" width="50%" @close="editreset">
      <el-form :model="editform" :rules="editformrules" ref="editformref" label-width="100px">
        <el-form-item :label="titletext" prop="attr_name">
          <el-input v-model="editform.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="iseditflag = false">取 消</el-button>
        <el-button type="primary" @click="editparams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      goodscatelist: [],
      seletedlist: [],
      cateprops: { expandTrigger: 'hover', value: 'cat_id', label: 'cat_name', children: 'children' },
      //   级联选择框双向绑定的数组
      seletekeys: [],
      // 选项卡当前数据
      // 被激活的页签名称
      activeName: 'many',
      dongparams: [],
      jinparams: [],
      isaddflag: false,
      addform: {
        attr_name: ''
      },
      addformrules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      iseditflag: false,
      editform: {
        attr_name: ''
      },
      editformrules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getgoodcatelist()
  },
  methods: {
    getgoodcatelist() {
      this.$http.get('categories').then(res => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取商品分类列表失败')
        }
        this.$message.success('获取商品分类列表成功')
        this.goodscatelist = res.data.data
      })
    },
    // 级联选择框选择会触发
    // 相当于获取参数列表
    handleChange() {
      // 判断是否为三级分类
      if (this.seletekeys.length !== 3) {
        this.seletekeys = []
        this.dongparams = []
        this.jinparams = []
        return false
      }
      //   根据所处面板和所处三级分类,获取对应的参数
      this.$http
        .get(`categories/${this.threecateid}/attributes`, {
          params: {
            sel: this.activeName
          }
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            this.$message.error('获取参数失败')
          }
          this.$message.success('获取参数成功')
          res.data.data.forEach(value => {
            value.attr_vals ? (value.attr_vals = value.attr_vals.split(' ')) : (value.attr_vals = [])
            // 控制文本域的显示与隐藏
            value.inputVisible = false
            // 文本框中输入的值
            value.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.dongparams = res.data.data
          } else {
            this.jinparams = res.data.data
          }
        })
    },
    // tab点击事件的处理函数
    handleClick() {
      this.handleChange()
    },
    openadd() {
      this.isaddflag = true
    },
    // 监听关闭对话框事件
    reset() {
      this.$refs.addformref.resetFields()
    },
    // 提交表单与预验证
    addparams() {
      this.$refs.addformref.validate(val => {
        if (!val) return
        this.$http
          .post(`categories/${this.threecateid}/attributes`, {
            attr_name: this.addform.attr_name,
            attr_sel: this.activeName
          })
          .then(res => {
            if (res.data.meta.status !== 201) {
              this.$message.error('添加参数失败')
            }
            this.$message.success('添加参数成功')
            this.isaddflag = false
            this.handleChange()
          })
      })
    },
    // 点击打开修改对话框
    showedit(id) {
      this.$http
        .get(`categories/${this.threecateid}/attributes/${id}`, {
          params: {
            attr_sel: this.activeName
          }
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            this.$message.error('获取参数失败')
          }
          this.$message.success('获取参数成功')
          console.log(res.data)
          this.editform = res.data.data
          this.handleChange()
        })
      this.iseditflag = true
    },
    editreset() {
      this.$refs.editformref.resetFields()
    },
    editparams() {
      this.$refs.editformref.validate(val => {
        if (!val) return
        this.$http
          .put(`categories/${this.threecateid}/attributes/${this.editform.attr_id}`, {
            attr_name: this.editform.attr_name,
            attr_sel: this.activeName
          })
          .then(res => {
            if (res.data.meta.status !== 200) {
              this.$message.error('修改参数失败')
            }
            this.$message.success('修改参数成功')
            this.iseditflag = false
            this.handleChange()
          })
      })
    },
    // 删除属性事件
    deleteparams(id) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete(`categories/${this.threecateid}/attributes/${id}`).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('删除参数失败')
            }
            this.$message({
              type: 'success',
              message: '删除成功!'
            })
            this.handleChange()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 文本框失去焦点或者enter都将做出事件
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return this.$message.error('你输入的内容不合法')
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      // 向服务器发请求保存参数
      this.savetag(row)
    },
    savetag(row) {
      this.$http
        .put(`categories/${this.threecateid}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('修改参数失败')
          }
          this.$message.success('修改参数成功')
        })
    },
    // 点击显示文本框
    showInput(row) {
      row.inputVisible = true
      // 文本框自动获取焦点
      // $nextTick当页面上的元素被重新渲染之后才能执行这一串代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag事件
    deletetag(i, row) {
      row.attr_vals.splice(i, 1)
      this.savetag(row)
    }
  },
  computed: {
    //   如果被选数组的长度不等于三就返回true,
    //   其他返回false
    isbtnflag() {
      if (this.seletekeys.length !== 3) {
        return true
      } else {
        return false
      }
    },
    // 当前选中的三级分类id
    threecateid() {
      if (this.seletekeys.length === 3) {
        return this.seletekeys[this.seletekeys.length - 1]
      } else {
        return null
      }
    },
    titletext() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.goodsrow {
  margin: 10px 10px;
}
.el-cascader {
  width: 30%;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 10%;
}
</style>
