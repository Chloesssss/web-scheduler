<template>
  <div class="pr-10" style="border-right: 1px solid rgb(220, 223, 230);">
    <div style="width:280px;" v-if="showFlag">
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
        node-key="code"
        highlight-current
        default-expand-all
        :expand-on-click-node="true" 
        :filter-node-method="filterNode"       
      >
        <!-- accordion //手风琴  default-expand-all //打开全部 -->
        <template  #default="{ node, data }" >
          <span v-if="!data.isInput" class="custom-tree-node">
            <i v-if="!node.expanded" class="el-icon-folder mr-5" @click="config">{{data.label}}</i>
            <i v-else class="el-icon-folder-opened mr-5" @click="config">{{data.label}}</i>
            <span v-if="!node.data.children">
              <i class="el-icon-edit-outline mr-10" @click="edit"></i>
              <i class="el-icon-delete" @click="remove(node, data)"></i>
            </span>
          </span>
          <span v-else><el-input v-model="currentInput" placeholder="请输入分类名称" @blur="saveCurrentInp"></el-input></span>
        </template>
      </el-tree>
    </div>
    <div style="min-height:300px" v-else>
      <i class="el-icon-s-unfold cursor-pointer" @click="changeDom"></i>
    </div>
  </div>
  <!-- <div>
    <tree-from :dialog-visible='state.dialogVisible' :data-id='state.dataId' @close='closeSet' />
  </div> -->
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive, toRefs } from "vue";
import { ElMessage } from 'element-plus'
import treeFrom from '../components/ConfigTree.vue'
import {useRouter ,useRoute} from "vue-router";

export default defineComponent({
  name: "DocTree",
  components: { treeFrom },
  setup() {
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const route = useRoute()
    const treeRef = ref(null);
    const state = reactive({
      searchInput: '',
      dataSource: [],
      showFlag: true,
      // dialogVisible: false,
      sourceId: '',
      dataId: '',
      childrenName: '',
      treeClickCount: 0,
      newsinput: '',
      currentData: '',
      currentNode: '',
      tmpCurrent: '',
      currentInput: '',
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
        
        // if(route.searchInput.id){
        //   searchObj.dbType = route.searchInput.dbType
        //   state.sourceId = route.searchInput.id
        //   fetchData()
        // }
        // else{
          // state.sourceId = data[0].children[0].value
          // searchObj.dbType = data[0].label
          // fetchData()
        // }
    }
    //设计节点双击
    // const handleNodeClick = (data, node) => {
    //   //记录点击次数
    //   state.treeClickCount++;
    //   //单次点击次数超过2次不作处理,直接返回,也可以拓展成多击事件
    //   if (state.treeClickCount >= 2) {
    //     return;
    //   }
    //   //计时器,计算300毫秒为单位,可自行修改
    //   this.timer = window.setTimeout(() => {
    //     if (state.treeClickCount == 1) {
    //       //把次数归零
    //       state.treeClickCount = 0;
    //       //单击事件处理
    //       return onTreeClick();
    //     } else if (this.treeClickCount > 1) {
    //       //把次数归零
    //       state.treeClickCount = 0;
    //       //双击事件
    //       // return state.dialogVisible="true";
    //     }
    //   }, 300);
    // }
    //点击目录
    const onTreeClick = (data,node) => {
      console.log("data",data)
      console.log("node",node.parent)
      state.sourceId = data.value
      searchObj.dbType = node.parent.label
      state.childrenName = data.label
      if(state.sourceId){
        fetchData()
      }
    }
    // 保存当前点击
    const handleNodeClick = (data,node) => {
      state.currentData = data // 当前分类的数据
      state.currentNode = node // 当前分类的节点
      if(data.code != -1){
        state.tmpCurrent = data // 缓存当前分类数据，主要用于新增时防止再次点击输入框当前值变化
      }
    }
    // 新增树节点
    const appendNode = (data) => {
      const newChild = { code: -1, label: '', leaf: true, isInput:true }
      if (!state.currentData.children) {
        this.$set(state.currentData, 'children', [])
      }
      state.currentData.children.push(newChild)
      state.dataSource = [...state.dataSource]
    }
    // 保存分类新增或者修改
    const saveCurrentInp = () => {
      if(state.currentInput){
        var params = {
          name:state.currentInput
        }
        if(tmpCurrent.isEdit){
          params.code = state.tmpCurrent.code
        }else{
          params.parentId = this.tmpCurrent.id
        }
        // 调用接口新增分类，成功后会返回分类信息，这样就可以更新新增的分类数据了，这里记得添加上保存的接口才可以哦
        var newChild = {id:res.result.id,label:res.result.name,children:[],isInput:false}
        this.$set(state.currentNode,'data',newChild)
        proxy.$refs.tree.updateKeyChildren(currentData.isEdit?tmpCurrent.code:-1,newChild)
        
      }else{
        ElMessage.error('请输入节点名称')
      }
    }
    //移除
    const  remove = (node, data) => {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      children.splice(index, 1)
      state.dataSource = [...state.dataSource]
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
    // 编辑树节点
    const edit = (node, data) => {
      console.log(node);
      console.log(data);
      const { parent } = node;
      const children = parent.data.children || parent.data;
      const index = children.findIndex((d) => d.id === data.id);
      state.newsinput = data.inputs;
      this.$set(node, 'editable', true);
      this.$nextTick(() => {
        this.$refs.input.focus();
      });
		}
    //关闭抽屉表单
    const closeSet = () => {
      // state.dialogVisible = false
    }
    return {
      ...toRefs(state),
      treeRef,
      state,
      getTreeData,
      handleNodeClick,
      appendNode,
      remove,
      changeDom,
      searchAll,
      filterNode,
      edit,
      closeSet,
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