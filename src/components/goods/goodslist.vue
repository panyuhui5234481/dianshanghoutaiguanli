<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <div>
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getgoodslist()">
              <el-button slot="append" icon="el-icon-search" @click="sousuo"></el-button>
            </el-input>
          </div>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goaddgoods">
            添加商品
          </el-button></el-col
        >
      </el-row>
      <!-- 表格区 -->
      <el-table :data="goodslist" stripe style="width: 100%">
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="700"> </el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)"> </el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"> </el-table-column>
        <el-table-column label="创建时间" width="100">
          <template slot-scope="scope">
            {{ scope.row.add_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deletegoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <div class="block">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="queryInfo.pagesize"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      //   商品列表
      goodslist: []
    }
  },
  created() {
    this.getgoodslist()
  },
  methods: {
    //   根据参数获取所有的商品列表
    getgoodslist() {
      this.$http
        .get('goods', {
          params: this.queryInfo
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('获取商品列表失败')
          }
          this.$message.success('获取商品列表成功')
          this.goodslist = res.data.data.goods
          this.total = res.data.data.total
        })
    },
    // 监听页面size变化事件
    handleSizeChange(val) {
      this.queryInfo.pagesize = val
      this.getgoodslist()
    },
    // 监听当前页变化事件
    handleCurrentChange(currentnum) {
      this.queryInfo.pagenum = currentnum
      this.getgoodslist()
    },
    // 搜索事件
    sousuo() {
      this.getgoodslist()
    },
    // 删除goods
    deletegoods(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.$http.delete('goods/' + id).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('删除商品失败')
            }
            this.$message.success('删除商品成功')
            this.getgoodslist()
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 点击添加按钮跳转到物品添加页面
    goaddgoods(){
      this.$router.push('/home/addgoods')
    }
  }
}
</script>

<style lang="less" scoped></style>
