<template>
  <el-breadcrumb style="padding: 10px;background-color: white;" separator-class="el-icon-arrow-right">
    <el-breadcrumb-item v-for="(item, index) in route.matched" :key="index">{{item.meta ? item.meta.breadcrumbName : '请到router.js中配置breadcrumbName'}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
  import { useRoute } from "vue-router";

  export default {
    name: "breadcrumb-common",
    setup() {
      const route = useRoute()
      return {
        route
      }
    }
  }
</script>