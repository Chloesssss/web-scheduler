<template>
  <div class=" flex" style="overflow: hidden;">
    <div class="overflow-auto mr-20" style="width:25%;min-width: 150px ">
      <main class="flex">
        <doc-tree />
      </main>
      
      
    </div>
    <div style="width:75%">
      <div class="top-menu pl-20 flex align-items-start">
        <i @click="onSave" class="el-icon-collection mt-1 cursor-pointer" style="width:80px;"> 保存</i>
        <i @click="onLine" class="el-icon-upload mr-10 cursor-pointer" style="width:80px;"> 上线</i>
        <i @click="onMonitior" class="el-icon-data-line mr-10 cursor-pointer" style="width:100px;"> 前往监控</i>
        <i @click="onCommitConfig" class="el-icon-folder-checked mr-10 cursor-pointer" style="width:100px;"> 立即执行</i>
        <i @click="onSetTime" class="el-icon-video-pause mr-10 cursor-pointer" style="width:100px;"> 定时管理</i>
      </div>
    </div>
  </div>
</template>ior

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import DocTree from "../Manage/components/DocTree.vue";


export default defineComponent({
  components: { DocTree },
  name: "WorkManage",
  setup() {
   
   

    const onSave =() => {
      // proxy.$axios.put('/dlink/dlink-admin/task', generateCommitParams()).then(({data}) => {
      //   ElMessage[data.code === 0 ? 'success': 'error'](data.msg)
      // })
    }
    const onLine =() => {
      proxy.$axios.post(`/dolphinscheduler/projects/process-definition/release?code=${data.code}`, generateCommitParams()).then(({data}) => {
        ElMessage[data.code === 0 ? 'success': 'error'](data.msg)
      })
    }
    const onMonitior =() => {
      // proxy.$axios.put('/dlink/dlink-admin/task', generateCommitParams()).then(({data}) => {
      //   ElMessage[data.code === 0 ? 'success': 'error'](data.msg)
      // })
    }
    return {
      onSave,
      onLine,
      onMonitior,
    }
  },
});



</script>
<style lang="scss" scoped>

</style>