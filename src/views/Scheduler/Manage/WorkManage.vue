<template>
  <div class=" flex" style="overflow: hidden;">
    <div class="overflow-auto mr-20" style="width:25%;min-width: 250px ">
      <main class="flex">
        <doc-tree ref="mychild" />
      </main>  
    </div>
    <div style="width:75%">
      <div class="top-menu pl-20 flex align-items-start" style="width: 500px">
        <i @click="onSave" class="el-icon-collection mt-1 cursor-pointer" style="width:80px;"> 保存</i>
        <i @click="onLine" class="el-icon-upload mr-10 cursor-pointer" style="width:80px;"> 上线</i>
        <i @click="onMonitior" class="el-icon-data-line mr-10 cursor-pointer" style="width:100px;"> 前往监控</i>
        <i @click="onCommitConfig" class="el-icon-folder-checked mr-10 cursor-pointer" style="width:100px;"> 立即执行</i>
        <i @click="onSetTime" class="el-icon-video-pause mr-10 cursor-pointer" style="width:100px;"> 定时管理</i>
      </div>
    </div>
  </div>
  <!-- 定时管理弹窗 -->
  <time-control :dialog-form-visible='state.dialogFormVisible' @close='closeModal'></time-control>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import { useRouter } from 'vue-router'
import DocTree from "../Manage/components/DocTree.vue";
import timeControl from "../Manage/components/TimeControl.vue";

export default defineComponent({
  components: { DocTree, timeControl },
  name: "WorkManage",
  setup() {
   
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const state = reactive({
      //timeFormVisible: false,
      dialogFormVisible: false,
      code: '',
      projectCode: '',
      releaseState: '',
    })
    //保存
    const onSave =() => {
      // proxy.$axios.put('/dlink/dlink-admin/task', generateCommitParams()).then(({data}) => {
      //   ElMessage[data.code === 0 ? 'success': 'error'](data.msg)
      // })
    }
    //上下线
    const onLine =() => {
      proxy.$axios.post(`/dolphinscheduler/projects/process-definition/release/?code=${state.id}`,{
        code: state.id,
        projectCode: state.projectCode,
        releaseState: state.releaseState,
      })
      .then((res) => {
        let resq = res.data
        if(resq.code == 200){
          ElMessage.success('修改状态成功')
          getData()
        }else if(resq.code == 400){
          ElMessageBox.alert(resq.msg, '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
          .catch(() => {})
        }else{
          ElMessage.error(resq.msg)
        }
      });
    }
    //前往监控
    const onMonitior =(data,node) => {
      proxy.$refs.mychild.onTreeClick(data,node)
      router.push({path: 'workMonitor', query: {projectCode:state.projectCode}})
    }
    //定时管理
    const onSetTime =() => {
      state.dialogFormVisible = true
    }
    //关闭弹框
    const closeModal = () =>{
      state.dialogFormVisible = false
      //state.timeFormVisible = false
      // state.apiVisible = false
      // state.rulesVisible=false
      // getData()
    }
    return {
      state,
      onSave,
      onLine,
      onMonitior,
      onSetTime,
      closeModal,
    }
  },
});



</script>
<style lang="scss" scoped>

</style>