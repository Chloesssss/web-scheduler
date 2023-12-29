<template>
  <el-container class="sub-main-container">
    <el-aside class="side-menu-container">
      <!--左侧菜单-->
      <menu-list :menu-list="state.menuList" />
    </el-aside>
    <el-main class="sub-right-container">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { defineComponent, reactive } from "vue";
import MenuList from '../common/components/MenuList';
export default defineComponent({
  components: { MenuList },
  setup() {
    const state = reactive({
      menuList: [ // 左侧菜单列表
        {index:"WorkManage", name: "作业管理", icon: 'Setting' },
        // {index:"WorkMonitor", name:"作业监控", icon: 'Setting'},
        // {index:"ExampleMonitor", name:"实例监控", icon: 'Setting'},
      ],
    });
    return {
      state,
    };
  },
});
</script>

<style lang="scss">
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  //text-align: center;
  color: #2c3e50;
  background: #f0f2f5;
  //position: absolute;
  //left: 0;
  //right: 0;
  //top: 0;
  //bottom: 0;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.el-aside {
  width: 220px !important;
  .el-menu-item.is-active {
    color: white !important;
    background: linear-gradient(270deg, #09BCE5 2%, #377BFC 100%);
    i {
      color: white !important;
    }
  }
}
</style>
