<template>
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
    <template v-for="(firstItem, firstIndex) in menuList" :key="firstIndex">
      <el-sub-menu v-if="firstItem.children && firstItem.children.length" :index="firstIndex + '-firstItem'">
        <template #title>
          <el-icon style="margin-right: 5px">
            <component :is="firstItem.icon"></component>
          </el-icon>
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
              <el-icon color="#0085FF" style="margin-right: 5px">
                <component :is="secondItem.icon"></component>
              </el-icon>
              <template #title>{{ secondItem.name }}</template>
            </el-menu-item>
          </template>
        </div>
      </el-sub-menu>

      <el-menu-item class="flex align-items-center" v-else :index="firstItem.index">
        <el-icon color="#0085FF" style="margin-right: 5px">
          <component :is="firstItem.icon"></component>
        </el-icon>
        <template #title>{{firstItem.name}}</template>
      </el-menu-item>
    </template>
  </el-menu>
  <el-tooltip effect="dark" placement="right" :content="!state.isCollapse ? '收起' : '展开'">
    <el-button @click="onHandleExpand" style="position: fixed; left: 0; bottom: 10px" type="warning" :icon="!state.isCollapse ? Fold : Expand" circle />
  </el-tooltip>
</template>

<script>
import { onMounted, reactive, defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Setting, Platform, Orange, Fold, Expand } from '@element-plus/icons-vue'
export default defineComponent({
  components: { Setting, Platform, Orange },
  props: {
    menuList: {
      type: Array,
      default: () => []
    }
  },
  setup(props, {emit}) {
    const currentRoute = 'CURRENT_ROUTE' // 当前菜单存储
    const route = useRoute();
    const router = useRouter();
    const state = reactive({
      isCollapse: false,
      mainMenuActive: '',
      activeIndex: "",
      // menuList: [ // 左侧菜单列表
      //   { index: "dbSource", name: "数据源中心", icon: 'setting' },
      //   { index: "cluster", name: "集群中心", icon: 'platform' },
      //   // { index: "metadata", name: "元数据管理", icon: 'orange' },
      // ],
    });
    const handleSelect = (key) => {
      if (key !== route.name) {
        router.push({ name: key });
        localStorage.setItem(currentRoute, key)
      }
    };
    const handleOpen = (key, keyPath) => {
      console.log(key, keyPath);
    };
    const handleClose = (key, keyPath) => {
      console.log(key, keyPath);
    };
    const onHandleExpand = () => {
      state.isCollapse = !state.isCollapse;
    }

    onMounted(() => {
      const currentRouteTemp = localStorage.getItem(currentRoute);
      if(currentRouteTemp) {
        state.activeIndex = currentRouteTemp
      } else {
        state.activeIndex = props.menuList[0].index;
      }
      router.push({name: state.activeIndex})
    });
    return {
      state,
      handleSelect,
      onHandleExpand,
      handleOpen,
      handleClose,
      Fold,
      Expand
    }
  }})

</script>

<style lang="scss" scoped>

</style>
