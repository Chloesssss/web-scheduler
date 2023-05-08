<template>
  <div class=" flex" style="overflow: hidden;">
    <div class="overflow-auto mr-20" style="width: 100%;min-width: 250px ">
      <main class="flex">
        <doc-tree ref="mychild" @give-code="getCode" @on-edit="getWorkEdit" :edit-name="state.workMonitorName"/>
      </main>  
    </div>
    <div style="width: 100%">
      <div style="width: 100%,hight: 100%">
        <i @click="onSave" class="mr-10 cursor-pointer" style="width:120px; font-style:normal"><el-icon class="mr-5"><collection /></el-icon>保存  </i>
        <i @click="onLine" class="mr-10 cursor-pointer" style="width:100px; font-style:normal"><el-icon class="mr-5"><upload-filled /></el-icon>上线  </i>
        <i @click="onMonitior" class="mr-10 cursor-pointer" style="width:100px; font-style:normal"><el-icon class="mr-5"><data-line /></el-icon>前往监控  </i>
        <i @click="onCommitConfig" class="mr-10 cursor-pointer" style="width:100px; font-style:normal"><el-icon class="mr-5"><folder-checked /></el-icon>立即执行  </i>
        <i @click="onSetTime" class="mr-10 cursor-pointer" style="width:100px; font-style:normal"><el-icon class="mr-5"><video-pause /></el-icon>定时管理 </i>
      </div>
      <div style="width: 100%,hight: 100%">
        <filiation-graph :code="state.code" :project-code="state.projectCode" :work-name="state.workName" @give-state="getState" ref="filiateGraph"/>
      </div>
    </div>
  </div>
  <!-- 定时管理弹窗 -->
  <index :visible="state.visible" @close="closeModal" :project-code="state.projectCode" :code="state.code"/>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from 'vue-router'
import DocTree from "../Manage/components/DocTree.vue";
import { ElMessage } from 'element-plus'
import FiliationGraph from "./components/filiationGraph.vue";
import Index from "./components/index.vue";
import { Collection, UploadFilled, DataLine, FolderChecked, VideoPause } from '@element-plus/icons-vue'

export default defineComponent({
  components: { DocTree, FiliationGraph, Index, UploadFilled, Collection, DataLine, FolderChecked, VideoPause },
  name: "WorkManage",
  setup() { 
    const { proxy } = getCurrentInstance()
    const router = useRouter()
    const route = useRoute()
    const state = reactive({
      code: '',
      projectCode: '',
      releaseState: '',
      visible: false,
      taskDefinition: [],
      taskRelation: [],
      workName: '',
      motif: '',
      workCode: '',
      workProjectCode: '',
      workMonitorName: '',
      releaseState: '',
    })
    //获取节点树节点编码，作业名、主题名
    const getCode = (e,i,j,k) => {
      state.code = e;
      state.projectCode = i;
      state.workName = j;
      state.motif = k;
    }
    //保存
    const onSave = () => {
      proxy.$refs.filiateGraph.save()
    }
    //获取当前选中节点作业状态
    const getState = (i) => {
      state.releaseState = i
    }
    //上下线
    const onLine = () => {
      let releaseState = ''
      if(route.query.releaseState){
        releaseState = proxy.$route.query.releaseState
      } else {
        releaseState = state.releaseState
      }
      let status = ''
      if(releaseState == 'OFFLINE') {
        status = 'ONLINE'
      } else if(releaseState == 'ONLINE'){
        status = 'OFFLINE'
      }
      //proxy.$axios.post(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/release/${state.code}`,{
      //   code: state.code,
      //   projectCode: state.projectCode,
      //   releaseState: status,
      // })
      // .then((res) => {
      //   let resq = res.data
      //   if(resq.code == 200){
      //     ElMessage.success('修改状态成功')
      //   }else if(resq.code == 400){
      //     ElMessageBox.alert(resq.msg, '提示', {
      //       confirmButtonText: '确定',
      //       type: 'warning'
      //     })
      //     .catch(() => {})
      //   }else{
      //     ElMessage.error(resq.msg)
      //   }
      // });
    }
    //前往监控
    const onMonitior = () => {
      if(state.projectCode===0){
        router.push({path: 'workMonitor', query: {projectCode: state.code, code: null, motif: state.motif}})
      }else if(state.code&&state.projectCode){
        router.push({path: 'workMonitor', query: {projectCode: state.projectCode, code: state.code, name: state.workName, motif: state.motif }})
      }else{
        ElMessage.warning("请先选择左侧作业树节点")
      }
    }
    //立即执行
    const onCommitConfig = () => {
      //proxy.$axios.post('/dolphinscheduler-api/dolphinscheduler/projects/executors/start-process-instance', {
      //   projectCode: state.projectCode,
      //   processDefinitionCode: state.code,
      // }).then(({data}) => {
      //   ElMessage[data.code === 200 ? 'success': 'error'](data.msg)
      // })
    }
    //定时管理
    const onSetTime = () => {
      state.visible = state.projectCode?true:false; 
    }
    //关闭弹框
    const closeModal = () => {
      state.visible = false
      // getData()
    }
    //作业监控编辑跳转
    const getWorkEdit = () => {
      state.workCode = proxy.$route.query.code
      state.workProjectCode = proxy.$route.query.projectCode
      state.workMonitorName = proxy.$route.query.name
    }
    onMounted(() => {
      getState()
    })
    return {
      state,
      getCode,
      onSave,
      onLine,
      onMonitior,
      onCommitConfig,
      onSetTime,
      closeModal,
      getWorkEdit,
      getState,
    }
  },
});



</script>
<style lang="scss" scoped>

</style>