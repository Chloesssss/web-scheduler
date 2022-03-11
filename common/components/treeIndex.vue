<template>
  <el-input v-model="state.filterText" clearable />
  <el-tree
    ref="dictTree"
    :data="state.menuList"
    class="fs-14"
    node-key="id"
    :default-expanded-keys="state.defaultExpandKeys"
    highlight-current
    default-expand-all
    :props="{ children: 'childrenTopics' }"
    @node-click="onTreeClick"
    :expand-on-click-node="false"
  >
    <template #default="{ data, node }">
      <span class="custom-tree-node flex width-a-hundred-percent align-items-center">
        <template v-if="!data.isLeaf">
          <i v-if="!node.expanded" class="el-icon-folder mr-5" />
          <i v-else class="el-icon-folder-opened mr-5" />
          <div style="max-width: 450px;" v-html="data.name"></div>
        </template>
        <template v-else>
          <i class="el-icon-document mr-5" />
          <div style="max-width: 450px;" v-html="data.name"></div>
        </template>
      </span>
    </template>
  </el-tree>
</template>

<script>
  import { onMounted, reactive, watch, getCurrentInstance } from "vue";
  export default {
    name: "TreeIndex",
    emits: ['click'],
    props: {
      url: {
        type: String,
        default: '',
      }
    },
    setup(props, { emit }) {
      const { proxy } = getCurrentInstance()
      const state = reactive({
        defaultExpandKeys: [],
        menuList: [],
        filterText: '',
      })
       const getTree = (filterText) => {
        const generateDefaultKey = (data) => {
          if(data && data.length) {
            setTimeout(() => {
              proxy.$refs.dictTree.setCurrentKey(data[0].id, true)
              onTreeClick(proxy.$refs.dictTree.getCurrentNode(), proxy.$refs.dictTree.getNode(data[0].id), proxy.$refs.dictTree.getCurrentNode())
            }, 500)
          }
        }
        //dindex-bkadmin/topic/directory
        proxy.$axios.get(props.url, { params: { keyword: filterText } }).then(({ data }) => {
          state.menuList = data.data || [];
          generateDefaultKey(state.menuList)
        })
      }
      const handleCommand = () => {}
      const onTreeClick = (data, node, item) => {
        /**
         * data 节点对应的对象
         * node 节点对应的node
         * item 节点组件本身
         * */
        emit('click', { data, node, item })
      }
      onMounted(() => {
        getTree()
      });
      watch(() => state.filterText, (val) => {
        // proxy.$refs.dictTree.filter(val)
        getTree(state.filterText)
      })
      return {
        handleCommand,
        onTreeClick,
        state,
      }
    },
  }
</script>

<style lang="scss" scoped>
 :deep(.el-tree-node__content) {
   height: unset;
 }
 :deep(.height-light) {
   color: #d8be5f;
 }
 :deep(.el-tree-node>.el-tree-node__children) {
   overflow: inherit;
 }
</style>