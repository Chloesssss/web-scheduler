<template>
  <div class="pr-10" style="border-right: 1px solid rgb(220, 223, 230);">
    <div style="width:230px;" v-if="showFlag">
      <div style="float:right">
        <i class="el-icon-circle-plus-outline mr-10 cursor-pointer" @click="appendNode"></i>
        <i class="el-icon-s-fold cursor-pointer" @click="changeDom"></i>
      </div>
      <el-input v-model="state.searchInput" clearable placeholder="请输入" @input="searchAll" class="mt-5 mb-5">
        <template #suffix>
          <el-icon class="el-icon-search"></el-icon>
        </template>
      </el-input>
      <el-tree
        :data="state.dataSource"
        ref="treeRef"
        node-key="id"
        highlight-current
        default-expand-allid
        @node-click="onTreeClick"
        :expand-on-click-node="true" 
        :filter-node-method="filterNode"       
      >
        <!-- accordion //手风琴  default-expand-all //打开全部 -->
        <template #default="{ data, node }">
          <span class="custom-tree-node flex width-a-hundred-percent">
            <template v-if="data.children===null">
              <i class="el-icon-document mr-5"></i>
              <el-dropdown class="width-a-hundred-percent" @command="handleCommand($event, data, node)" trigger="contextmenu">
                <span class="flex" style="max-width: 150px;white-space: normal;">{{ data.label }}</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="renamework">重命名</el-dropdown-item>
                    <el-dropdown-item :disabled="node.childNodes.length >0" command="delete">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <i v-if="!node.expanded" class="el-icon-folder mr-5"></i>
              <i v-else class="el-icon-folder-opened mr-5"></i>
              <el-dropdown class="width-a-hundred-percent" @command="handleCommand($event, data, node)" trigger="contextmenu">
                <span class="flex" style="max-width: 150px;white-space: normal;">{{ data.label }}</span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="createMenu">创建目录</el-dropdown-item>
                    <el-dropdown-item command="createWork">创建作业</el-dropdown-item>
                    <el-dropdown-item command="rename">重命名</el-dropdown-item>
                    <el-dropdown-item :disabled="node.childNodes.length >0" command="delete">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </span>
        </template>
      </el-tree>
    </div>
    <div style="min-height:300px" v-else>
      <i class="el-icon-s-unfold cursor-pointer" @click="changeDom"></i>
    </div>
  </div>
  <div>
    <work-menu :visible="state.workMenuVisible" :name="state.createWorkName" :id="state.createWorkId" :parent-id="state.workParentId" @onOk="workMenuOk" @cancel="state.workMenuVisible = false"></work-menu>
    <create-work :id="state.createWorkId" :name="state.createWorkName" :parent-id="state.workParentId" :visible="state.createWorkVisible" @onOk="createWorkOk" @cancel="state.createWorkVisible = false" />
  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive, toRefs } from "vue";
import { ElMessage } from 'element-plus'
import {useRouter ,useRoute} from "vue-router";
import CreateWork from "./CreateWork.vue";
import WorkMenu from "./WorkMenu.vue";
import { DeleteConfirm } from '@/../common/utils/index.js'

export default defineComponent({
  name: "DocTree",
  components: { CreateWork, WorkMenu },
  emits:['giveCode'],
  setup(props,{emit}) {
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const route = useRoute()
    const treeRef = ref(null);
    const state = reactive({
      searchInput: '',
      dataSource: [],
      showFlag: true,
      sourceId: '',
      id: 0,
      dataId: '',
      createWorkId: '',
      workParentId: '',
      createWorkName: '',
      createWorkVisible: false,
      workMenuVisible: false,
      currentData: '',
      currentNode: '',
      tmpCurrent: '',
      code: '',
      projectCode: '',
      currentNodeName: '', //当前选中的节点名
      motif: '',//作业主题名（根节点名）
    })
    //获取目录
    const getTreeData = () => {
      proxy.$axios.get("/dolphinscheduler/projects/view-tree",{
      })
      .then((res) => {
        let resq = res.data
        if(resq.code == 200){
          state.dataSource = resq.data
        }else{
          ElMessage.error(resq.msg)
        }
      });
    }
    //点击目录
    const onTreeClick = (data,node) => {
      state.code = data.code
      if (data.children===null) {
        state.currentNodeName = data.label
        state.projectCode = node.parent.data.code
      } else {
        state.projectCode = 0
        state.motif = data.label
      }
      emit("giveCode", state.code, state.projectCode, state.currentNodeName, state.motif);
    }
    // 保存当前点击
    const saveNodeClick = (data,node) => {
      state.currentData = data // 当前分类的数据
      state.currentNode = node // 当前分类的节点
      if(state.dataId != -1){
        state.tmpCurrent = data // 缓存当前分类数据，主要用于新增时防止再次点击输入框当前值变化
      }
    }
    const createWorkOk =() => {// 创建根目录
      state.createWorkVisible = false
      getTreeData()
    }
    const workMenuOk =() => {// 创建作业
      state.workMenuVisible = false
      getTreeData()
    }
    //右击指令操作列菜单
    const handleCommand =(command, data, node) => {
      switch (command) {
        case 'delete':
        DeleteConfirm().then(() => {
          if (data.children === null&&state.projectCode != 0) {
            proxy.$axios.delete(`/dolphinscheduler/projects/process-definition/delete?code=${state.code}&projectCode=${state.projectCode}`,
            ).then((data) => {
              if(data.data.code == 200){
                console.log();
                ElMessage.success("删除工作流作业成功")
                getTreeData()
              }else {
                ElMessage.error(data.data.msg)
              }
            }).catch(e => {
              ElMessage.error('请求失败！请重试！')
              getTreeData()
            })
          } else {
            proxy.$axios.delete(`/dolphinscheduler/projects/${state.code}`,
            ).then((data) => {
              if(data.data.code == 200){
                ElMessage.success("删除项目成功")
                getTreeData()
              }else {
                ElMessage.error(data.data.msg)
              }
            }).catch(e => {
              ElMessage.error('请求失败！请重试！')
            })
          }
        })
        break;
        case 'createMenu':
        state.workParentId = data.code
        state.createWorkVisible = true
        state.createWorkId = 0
        break;
        case 'createWork':
        state.workParentId = data.code
        state.workMenuVisible = true
        break;
        case 'renamework': // 重命名作业
        state.workMenuVisible = true
        state.createWorkId = data.code
        state.workParentId = node.parent.data.code
        state.createWorkName = data.label
        break;
        case 'rename': // 重命名目录
        state.createWorkVisible = true
        state.createWorkId = data.code
        state.createWorkName = data.label
        break;
      }
    }
    // 新增树节点
    const appendNode = (data) => {
      state.workParentId = 0
      state.createWorkVisible = true
      state.createWorkId = 0
    }
    //收起与展开
    const changeDom = () =>{
      state.showFlag=!state.showFlag
    }
    //获取树形目录搜索值
    const searchAll = (searchInput) => {
      const tree = treeRef.value
      tree?.filter(searchInput)
    }
    //树形目录搜索
    const filterNode = (searchInput, node) => {
      return node.label.indexOf(searchInput) !== -1
    }
    onMounted(() => {
      getTreeData()
    })
    return {
      ...toRefs(state),
      treeRef,
      state,
      getTreeData,
      onTreeClick,
      createWorkOk,
      workMenuOk,
      handleCommand,
      saveNodeClick,
      appendNode,
      changeDom,
      searchAll,
      filterNode,
    }
  },
});

</script>
<style lang="scss" scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>