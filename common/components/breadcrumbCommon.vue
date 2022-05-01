<template>
  <el-breadcrumb style="padding: 10px;background-color: white;" :separator-icon="ArrowRight">
    <el-breadcrumb-item v-for="(item, index) in route.matched" :key="index">{{item.meta ? item.meta.breadcrumbName : '请到router.js中配置breadcrumbName'}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
  import { useRoute } from "vue-router";
  import { ArrowRight } from '@element-plus/icons-vue'
  export default {
    name: "breadcrumb-common",
    setup() {
      const route = useRoute()
      return {
        route,
        ArrowRight
      }
    }
  }
</script>
