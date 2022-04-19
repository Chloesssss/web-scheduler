<template>
  <el-container class="sub-main-container">
    <el-aside class="side-menu-container">
      <!--左侧菜单-->
      <el-menu
        style="padding-top: 1px"
        :default-active="state.activeIndex"
        class="el-menu-vertical-demo height-a-hundred-percent text-align-left"
        @open="handleOpen"
        @close="handleClose"
        background-color="#FFFFFF"
        text-color="#0085FF"
        @select="handleSelect"
        active-text-color="#FFFFFF"
        :collapse="state.isCollapse"
      >
        <template v-for="(firstItem, firstIndex) in state.menuList" :key="firstIndex">
          <el-sub-menu v-if="firstItem.children && firstItem.children.length" :index="firstIndex + '-firstItem'">
            <template #title>
              <i class="blue-color mr-10" :class="firstItem.icon"></i>
              <span>{{firstItem.name}}</span>
            </template>
            <div v-for="(secondItem, secondIndex) in firstItem.children" :key="secondIndex + '-secondIndex'">
              <template v-if="secondItem.children && secondItem.children.length">
                <el-sub-menu :index="secondItem.index + '-secondIndex'">
                  <template #title>{{ secondItem.name }}</template>
                  <el-menu-item v-for="(thirdItem, thirdIndex) in secondItem" :key="thirdIndex" :index="thirdIndex">{{thirdItem.name}}</el-menu-item>
                </el-sub-menu>
              </template>
              <template v-else>
                <el-menu-item :index="secondItem.index" class="flex align-items-center">
                  <i class="blue-color mr-10" :class="secondItem.icon"></i>
                  <template #title>{{ secondItem.name }}</template>
                </el-menu-item>
              </template>
            </div>
          </el-sub-menu>

          <el-menu-item class="flex align-items-center" v-else :index="firstItem.index">
            <i class="blue-color mr-10" :class="firstItem.icon"></i>
            <template #title>{{firstItem.name}}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-main class="sub-right-container">
      <router-view />
    </el-main>
  </el-container>
  <!--  <router-view />-->
</template>

<script>
import { defineComponent, onMounted, onBeforeMount, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  setup() {
    const currentRoute = 'CURRENT_ROUTE' // 当前菜单存储
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      isCollapse: false,
      mainMenuActive: '',
      activeIndex: "",
      menuList: [ // 左侧菜单列表
        {index:"WorkManage", name: "作业管理" },
        {index:"WorkMonitor", name:"作业监控"},
        {index:"ExampleMonitor", name:"实例监控"},
      ],
      hrefName: "",
    });
    const handleSelect = (key) => {
      if (key !== route.name) {
        router.push({ name: key });
        localStorage.setItem(currentRoute, key)
      }
    };
    const handleOpen = (key, keyPath) => {
    };
    const handleClose = (key, keyPath) => {
    };
    onBeforeMount(() => {
      let hrefName = window.location.href
      state.hrefName = hrefName.split('/')[3]
    })
    onMounted(() => {
      const currentRouteTemp = localStorage.getItem(currentRoute);
      if(currentRouteTemp) {
        state.activeIndex = currentRouteTemp
      } else {
        state.activeIndex = state.menuList[0].index;
      }
      router.push({name: state.activeIndex})
    });
    return {
      state,
      handleSelect,
      handleOpen,
      handleClose,
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
