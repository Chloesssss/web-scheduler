<template>
  <el-drawer
    ref="drawer"
    v-model="dialogVisible"
    title="数据调度节点"
    :before-close="handleClose"
    direction="rtl"
    custom-class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <el-form :model="form" label-width="100px">
        <el-form-item label="节点名称" prop="name" >
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="超时失败" prop="timeoutFlag">
          <el-switch v-model="form.timeoutFlag"></el-switch>
        </el-form-item>
        <el-form-item label="汇聚作业" prop="taskParams">
          <el-input class="flex-1" v-model="form.taskParams"></el-input>
          <el-button class="flex-1" @click="chooseWork">选择</el-button>
        </el-form-item>
        <el-form-item label="源表" prop="originTable">
          <el-input v-model="form.originTable"></el-input>
        </el-form-item>
        <el-form-item label="目标表" targetTable>
          <el-input v-model="form.targetTable"></el-input>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="handleClose">取消</el-button>



        
        <el-button type="primary"  @click="onCommit">确定</el-button>
      </div>
    </div>
  </el-drawer>
  <work-convergence :dialog-table-visible="state.tableVisible" @close="closeModal" @give-code="getCode"/>
</template>

<script>
  import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from "vue";
  import { ElMessageBox } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import WorkConvergence from "./WorkConvergence.vue";

  export default defineComponent({
  components: { WorkConvergence },
    name: "cellFrom",
    props: {
      visible: {
        type: Boolean,
        default: false
      },
    },
    emits:['close'],
    setup(props, {emit}) {
      const { proxy } = getCurrentInstance();
      const { visible } = toRefs(props)
      const dialogVisible = ref(false)
      const  form = reactive({ // 声明查询信息
        name: null,
        description: null,
        timeoutFlag: null,
        taskParams: '',
        originTable: null,
        targetTable: null,
      })
      const state = reactive({
        drawer : false,
        projectCode: '',
        code: '',
        location: '',
        tableVisible: false,
      })
      const onCommit = () => {
        proxy.$axios.post(`/dolphinscheduler/projects/process-definition`,{
          code: state.code,
          projectCode: state.projectCode,
          name: form.name,
          location: state.location
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
      watch([visible],(newval,oldval) => {
        console.log(newval)
        dialogVisible.value = newval[0]
      })
      const getCode = (e,i,j) => {
        console.log(e);
        console.log(i);
        form.taskParams = e;
        form.originTable = i;
        form.targetTable = j;
      }
      const handleClose = () => {
        emit('close')
      }
      const chooseWork = () => {
        state.tableVisible = true
      }
      const closeModal = () => {
        state.tableVisible = false
      }
      return {
        form,
        state,
        dialogVisible,
        ...toRefs(state),
        handleClose,
        getCode,
        onCommit,
        chooseWork,
        closeModal,
      }
    }
  })
</script>

<style lang="scss" scoped>

</style>