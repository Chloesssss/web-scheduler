<template>
  <div class="pr-10" style="border-right: 1px solid rgb(220, 223, 230);">
    <div style="width:280px;" v-if="showFlag">
      <div style="float:right">
        <i class="el-icon-circle-plus-outline mr-10 cursor-pointer"></i>
        <i class="el-icon-s-fold cursor-pointer" @click="changeDom"></i>
      </div>
      <el-input v-model="searchInput" clearable placeholder="请输入" class="mt-5 mb-5" @keyup.enter.native="searchAll">
        <template #suffix>
          <el-icon class="el-icon-search"></el-icon>
        </template>
      </el-input>
      <el-tree
        :data="dataSource"
        node-key="id"
        default-expand-all
        :expand-on-click-node="false"        
      >
        <!-- accordion //手风琴  default-expand-all //打开全部 -->
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span v-if="!node.data.children">
              <i class="el-icon-edit-outline mr-10"></i>
              <i class="el-icon-delete" @click="remove(node, data)"></i>
            </span>
          </span>
        </template>
      </el-tree>

    </div>

    <div style="min-height:300px" v-else>
      <i class="el-icon-s-unfold cursor-pointer" @click="changeDom"></i>
    </div>
  </div>  
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive, toRefs } from "vue";

 const data = [
      {
        id: 1,
        label: '第一',
        children: [
          {
            id: 3,
            label: '第一 1-1',
          },
          {
            id: 4,
            label: '第一 1-2',
          },
        ],
      },
      {
        id: 2,
        label: '第二',
        children: [
          {
            id: 5,
            label: '第二 2-1',
          },
          {
            id: 6,
            label: '第二 2-2',
          },
        ],
      },
    ]
export default defineComponent({
  name: "DocTree",
  setup() {
    const state = reactive({
      searchInput:'',
      dataSource:JSON.parse(JSON.stringify(data)),
      showFlag:true
    })
    //移除
    const  remove=(node, data)=> {
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
    //搜索
    const searchAll = () =>{
      console.log(state.searchInput);
    }
    

    return {
      ...toRefs(state),
      remove,
      changeDom,
      searchAll
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