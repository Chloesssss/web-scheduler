<template>
  <div class=" flex" style="overflow: hidden;">
    <div class="overflow-auto mr-20" style="width: 100%;min-width: 250px ">
      <main class="flex">
        <doc-tree ref="mychild" @give-code="getCode" @onEdit="getWorkEdit"/>
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
        <filiation-graph :code="state.code" :project-code="state.projectCode" :work-name="state.workName" ref="filiateGraph"/>
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

export default defineComponent({
  components: { DocTree, FiliationGraph, Index },
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
    //上下线
    const onLine = () => {
      let releaseState = ''
      if(route.query.releaseState){
        releaseState = proxy.$route.query.releaseState
      } else {
        releaseState = state.releaseState
      }
      proxy.$axios.post(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/release/${state.code}`,{
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
        router.push({path: 'workMonitor', query: {projectCode: state.code, code: null, motif: state.motif}})
      }else if(state.code&&state.projectCode){
        router.push({path: 'workMonitor', query: {projectCode: state.projectCode, code: state.code, name: state.workName, motif: state.motif }})
      }else{
        ElMessage.warning("请先选择左侧作业树节点")
      }
    }
    //立即执行
    const onCommitConfig = () => {
      proxy.$axios.post('/dolphinscheduler-api/dolphinscheduler/projects/executors/start-process-instance', {
        projectCode: state.projectCode,
        processDefinitionCode: state.code,
      }).then(({data}) => {
        ElMessage[data.code === 200 ? 'success': 'error'](data.msg)
      })
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
      getWorkEdit()
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
    }
  },
});



</script>
<style lang="scss" scoped>

</style>