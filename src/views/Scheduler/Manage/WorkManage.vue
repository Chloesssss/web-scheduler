<template>
  <div class=" flex" style="overflow: hidden;">
    <div class="overflow-auto mr-20" style="width: 100%;min-width: 250px ">
      <main class="flex">
        <doc-tree ref="mychild" @give-code="getCode"/>
      </main>  
    </div>
    <div style="width: 100%">
      <div style="width: 100%,hight: 100%">
        <i @click="onSave" class="el-icon-collection mt-1 cursor-pointer" style="width:80px;"> 保存</i>
        <i @click="onLine" class="el-icon-upload mr-10 cursor-pointer" style="width:80px;"> 上线</i>
        <i @click="onMonitior" class="el-icon-data-line mr-10 cursor-pointer" style="width:100px;"> 前往监控</i>
        <i @click="onCommitConfig" class="el-icon-folder-checked mr-10 cursor-pointer" style="width:100px;"> 立即执行</i>
        <i @click="onSetTime" class="el-icon-video-pause mr-10 cursor-pointer" style="width:100px;"> 定时管理</i>
      </div>
      <div style="width: 100%,hight: 100%">
        <filiation-graph  />
      </div>
    </div>
  </div>
  <!-- 定时管理弹窗 -->
  <time-control :dialog-form-visible='state.dialogFormVisible' @close='closeModal'></time-control>
  <!-- 执行策略配置 -->
  <config-tree :visible="state.dialogVisible" @close="closeModal"/>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import { useRouter } from 'vue-router'
import DocTree from "../Manage/components/DocTree.vue";
import timeControl from "../Manage/components/TimeControl.vue";
import { ElMessage } from 'element-plus'
import ConfigTree from "./components/ConfigTree.vue";
import FiliationGraph from "./components/filiationGraph.vue";

export default defineComponent({
  components: { DocTree, timeControl, ConfigTree, FiliationGraph },
  name: "WorkManage",
  setup() {
   
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const state = reactive({
      dialogFormVisible: false,
      code: '',
      projectCode: '',
      releaseState: '',
      dialogVisible: false,
    })
    const getCode = (e,i) => {
      console.log(e);
      console.log(i);
      state.code = e;
      state.projectCode=i;
     
    }
    //保存
    const onSave = () => {
      proxy.$axios.post('/dolphinscheduler/projects/process-definition', {
        locations: 0,
        name: 0,
        projectCode: 0,
      }).then(({data}) => {
        ElMessage[data.code === 0 ? 'success': 'error'](data.msg)
      })
    }
    //上下线
    const onLine = () => {
      let releaseState = proxy.$route.queryreleaseState === '下线' ? 'OFFLINE' : 'ONLINE'
      proxy.$axios.post(`/dolphinscheduler/projects/process-definition/release/${state.code}`,{
        code: state.code,
        projectCode: state.projectCode,
        releaseState: releaseState,
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
    const onMonitior = () => {
      if(state.projectCode===0){
        router.push({path: 'workMonitor', query: {projectCode: state.code, code: null}})
      }else if(state.code&&state.projectCode){
        router.push({path: 'workMonitor', query: {projectCode: state.projectCode, code:state.code}})
      }else{
        ElMessage.error("请先选择左侧作业树节点")
      }
      // console.log(state.projectCode)
      // console.log(state.code);
    }
    //立即执行
    const onCommitConfig = () => {
      
    }
    //定时管理
    const onSetTime = () => {
      state.dialogFormVisible = true
    }
    //关闭弹框
    const closeModal = () => {
      state.dialogFormVisible = false
      state.dialogVisible = false
      //state.timeFormVisible = false
      // state.apiVisible = false
      // state.rulesVisible=false
      // getData()
    }
    return {
      state,
      getCode,
      onSave,
      onLine,
      onMonitior,
      onCommitConfig,
      onSetTime,
      closeModal,
    }
  },
});



</script>
<style lang="scss" scoped>

</style>