<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <!-- 添加分类区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="openaddcate">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <zk-table ref="table" sum-text="sum" index-text="#" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index border :show-row-hover="false">
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="danger" size="mini" v-else>三级</el-tag>
        </template>
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-edit" size="mini">删除</el-button>
        </template>
      </zk-table>
      <!-- 分页区域 -->
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10, 15]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="this.total"
        >
        </el-pagination>
      </div>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addcateflag" width="50%" @close="addcateclose">
      <!-- 添加分类表单 -->
      <el-form :model="addcateform" :rules="addcateformrules" ref="addcateformref" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="addcateform.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <div class="block">
            <el-cascader v-model="selectedkeys" :options="parentcatelist" :props="cateprops" @change="handleChange" clearable></el-cascader>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addcateflag = false">取 消</el-button>
        <el-button type="primary" @click="addcate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类数据
      catelist: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 模板
          type: 'template',
          // 模板名称
          template: 'isok'
        },
        {
          label: '排序',
          // 模板
          type: 'template',
          // 模板名称
          template: 'order'
        },
        {
          label: '操作',
          // 模板
          type: 'template',
          // 模板名称
          template: 'opt'
        }
      ],
      addcateflag: false,
      addcateform: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      addcateformrules: {
        cat_name: [{ required: true, message: '请输入分类名', trigger: 'blur' }]
      },
      parentcatelist: [],
      // 配置级联选择器的props
      cateprops: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedkeys: []
    }
  },
  created() {
    this.getcatelist()
  },
  methods: {
    //   获取商品分类
    getcatelist() {
      this.$http
        .get('categories', {
          params: this.queryInfo
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            this.$message.error('获取商品分类列表失败')
          }
          this.$message.success('获取商品分类列表成功')
          this.catelist = res.data.data.result
          this.total = res.data.data.total
        })
    },
    // 监听pagesize改变
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getcatelist()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getcatelist()
    },
    // 打开添加分类弹框
    openaddcate() {
      this.getparentcatelist()
      this.addcateflag = true
    },
    // 获得父级分类的数据列表
    getparentcatelist() {
      this.$http
        .get('categories', {
          params: { type: 2 }
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            this.$message.error('获取数据分类列表失败')
          }
          this.$message.success('获取数据分类列表成功')
          this.parentcatelist = res.data.data
        })
    },
    // 选中项变化触发事件
    handleChange() {
      // 如果selectedkeys.length大于0,证明选中父级分类,反之,没有任何父级分类
      if (this.selectedkeys.length > 0) {
        // 父级分类的id
        this.addcateform.cat_pid = this.selectedkeys[this.selectedkeys.length - 1]
        //  为当前分类等级赋值
        this.addcateform.cat_level = this.selectedkeys.length
        return false
      } else {
        this.addcateform.cat_pid = 0
        this.addcateform.cat_level = 0
      }
    },
    addcate() {
      this.$refs.addcateformref.validate(val => {
        if (!val) return
        this.$http.post('categories', this.addcateform).then(res => {
          if (res.data.meta.status !== 200) {
            this.$message.error('添加分类失败')
          }
          this.$message.success('添加分类成功')
          this.getcatelist()
          this.addcateflag = false
        })
      })
    },
    // 监听对话框关闭事件,重置表单数据
    addcateclose() {
      this.$refs.addcateformref.resetFields()
      this.selectedkeys = []
      this.addcateform.cat_level = 0
      this.addcateform.cat_pid = 0
    }
  }
}
</script>

<style lang="less" scoped>
.zk-table {
  margin-top: 15px;
}
</style>
