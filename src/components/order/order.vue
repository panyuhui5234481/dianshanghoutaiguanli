<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片试图区 -->
    <el-card>
      <el-row>
        <div style="margin-top: 15px;">
          <el-input placeholder="请输入内容" v-model="queryInfo.orderinput" clearable class="input-with-select">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </div>
      </el-row>
      <!-- 订单表格列表 -->
      <el-table :data="orderlist" stripe style="width: 100%" border>
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="order_number" label="订单编号" width="250px"> </el-table-column>
        <el-table-column prop="order_price" label="订单价格" align="center"> </el-table-column>
        <el-table-column label="是否付款" align="center">
          <template slot-scope="scope">
            <el-tag :type="scope.row.pay_status == 0 ? 'danger' : 'success'">{{ scope.row.pay_status == 0 ? '未付款' : '已付款' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" align="center"> </el-table-column>
        <el-table-column label="下单时间" align="center">
          <template slot-scope="scope">
            {{ scope.row.update_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template>
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showlocation"></el-button>
            <el-button type="success" icon="el-icon-location-outline" size="mini" @click="showmessage"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="block">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
      </div>
    </el-card>
    <!-- 地区弹框 -->
    <el-dialog title="修改地址" :visible.sync="locationflag" width="50%">
      <el-form :model="locationForm" :rules="locationrules" ref="locationFormref" label-width="100px" class="demo-ruleForm">
        <el-form-item label="省市区/县" prop="location">
          <el-cascader v-model="locationForm.location" :options="city" :props="{ expandTrigger: 'hover' }" @change="changelocation"></el-cascader>
        </el-form-item>
        <el-form-item label="具体地址" prop="location2">
          <el-input v-model="locationForm.location2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="locationflag = false">取 消</el-button>
        <el-button type="primary" @click="locationflag = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="messageflag" width="50%">
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in wuliu" :key="index" :timestamp="activity.time">
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import Citydata from '../../assets/js/citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        orderinput: '',
        pagenum: 1,
        pagesize: 10
      },
      orderlist: [],
      total: 0,
      locationflag: false,
      locationForm: {
        location: [],
        location2: ''
      },
      city: Citydata,
      locationrules: {
        location: [{ required: true, message: '请选择省市县', trigger: 'change' }],
        location2: [{ required: true, message: '请填写具体地址', trigger: 'change' }]
      },
      messageflag: false,
      wuliu: []
    }
  },
  created() {
    this.getorderlist()
    console.log(this.city)
  },
  methods: {
    getorderlist() {
      this.$http.get('orders', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取订单列表失败')
        }
        console.log(res.data)
        this.total = res.data.data.total
        this.orderlist = res.data.data.goods
      })
    },
    // 页码size发生变化事件
    handleSizeChange(newpagesize) {
      this.queryInfo.pagesize = newpagesize
      this.getorderlist()
    },
    // 当前页发生变化事件
    handleCurrentChange(newpagenum) {
      this.queryInfo.pagenum = newpagenum
      this.getorderlist()
    },
    // 点击展示地区弹框
    showlocation() {
      this.locationflag = true
    },
    // 级联选择框选择事件
    changelocation() {
      console.log(this.locationForm.location)
    },
    // 点击展示物流进度对话框
    showmessage() {
      this.messageflag = true
      this.getmessage()
    },
    // 获取物流信息
    getmessage() {
      this.$http.get('/kuaidi/1106975712662').then(res => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取商品物流信息失败')
        }
        this.$message.success('获取商品物流信息成功')
        console.log(res.data.data)
        this.wuliu = res.data.data
      })
    }
  }
}
</script>

<style lang="less" scoped>
.input-with-select {
  width: 30%;
}
</style>
