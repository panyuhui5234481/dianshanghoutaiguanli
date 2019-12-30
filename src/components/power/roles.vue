<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card class="box-card">
      <!-- 添加角色列表区 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="roleslist" stripe style="width: 90%" border row-key="id" :tree-props="{ children: null, hasChildren: null }">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdbottom', i1 === 0 ? 'bdtop' : '']">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop']">
                  <el-col :span="6">
                    <el-tag type="success">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag type="danger" v-for="(item3, i3) in item2.children" :key="item3.id" :class="[i3 === 0 ? '' : 'bdtop']" closable @close="removerights(scope.row.id, item3.id)">{{
                      item3.authName
                    }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 角色列 -->
        <el-table-column type="index" label="#"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="showroles(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setrightsVisible" width="50%" @close="rightsclose">
      <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeref"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setrightsVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotrights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleslist: [],
      setrightsVisible: false,
      //   所有权限的数据
      rightslist: [],
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      //   被选中的权限
      defkeys: [],
      roleid: ''
    }
  },
  created() {
    this.getroleslist()
  },
  methods: {
    getroleslist() {
      this.$http.get('roles').then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        } else {
          this.roleslist = res.data.data
        }
      })
    },
    // 根据id删除对应权限
    removerights(roleId, rightId) {
      this.$confirm('是否删除所选权限?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$http.delete(`roles/${roleId}/rights/${rightId}`).then(res => {
            if (res.data.meta.status !== 200) {
              this.$message.error('删除权限失败')
              this.getroleslist()
              return false
            } else {
              this.roleslist = res.data.data
              this.$message({
                type: 'success',
                message: '删除成功!'
              })
              this.getroleslist()
            }
          })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    // 展示分配权限的对话框
    showroles(role) {
      // 获取所有权限的数据
      this.roleid = role.id
      this.$http.get('rights/tree').then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取权限数据失败')
        } else {
          this.$message.success('获取权限数据成功')
          this.rightslist = res.data.data
        }
      })
      this.getdfkeys(role, this.defkeys)
      this.setrightsVisible = true
    },
    // 通过递归获取角色所有三级权限的id,保存到数组中
    getdfkeys(node, arr) {
      if (!node.children) {
        arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getdfkeys(item, arr)
        })
      }
    },
    // 监听分配权限对话框的关闭
    rightsclose() {
      this.defkeys = []
    },
    //   点击为角色分配权限
    allotrights() {
      const keys = [this.$refs.treeref.getHalfCheckedKeys(), this.$refs.treeref.getCheckedKeys()]
      const idstr = keys.join(',')
      this.$http.post(`roles/${this.roleid}/rights`, { rids: idstr }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getroleslist()
        this.setrightsVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
</style>
