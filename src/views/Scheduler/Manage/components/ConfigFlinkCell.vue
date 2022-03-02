<template>
  <el-drawer
    ref="drawer"
    v-model="flinkVisible"
    title="数据开发调度节点"
    :before-close="handleClose"
    direction="rtl"
    custom-class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <el-form :model="taskDefinition" label-width="100px" ref="form">
        <el-form-item label="节点名称" prop="name" >
          <el-input v-model="taskDefinition.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="taskDefinition.description" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="超时失败" prop="timeoutFlag">
           <el-radio-group v-model="taskDefinition.status" size="mini">
            <el-radio-button label="0">启用</el-radio-button>
            <el-radio-button label="1">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="汇聚作业" prop="taskWork">
          <el-input class="flex-1" v-model="taskDefinition.taskWork" disabled></el-input>
          <el-button class="flex-1" @click="chooseWork">选择</el-button>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary"  @click="onCommit">确定</el-button>
      </div>
    </div>
  </el-drawer>
  <flink-convergence :dialog-table-visible="state.tableVisible" @close="closeModal" @give-code="getCode" />
</template>

<script>
  import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from "vue";
  import { ElMessageBox } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import FlinkConvergence from "./FlinkConvergence.vue";

  export default defineComponent({
  components: { FlinkConvergence },
    name: "cellFrom",
    props: {
        visible: {
        type: Boolean,
        default: false
      },
      code: [Number, String],
      projectCode: [Number, String],
      workName: '',
      taskCode: [Number, String],
    },
    emits:['close', 'onCommit'],
    setup(props, {emit}) {
      const { proxy } = getCurrentInstance();
      const { visible, code, projectCode, workName, taskCode } = toRefs(props)
      const flinkVisible = ref(false)
      const  taskDefinition = reactive({ // 声明表单信息
        name: '',
        description: '',
        status: 0,
        timeoutFlag: '',
        taskWork: '',
        taskParams: '',
        taskType: "DLINK",
        projectCode: '',
        code: '',
        callTaskId: '',
        id: ''
      })
      const state = reactive({
        drawer : false,
        projectCode: '',
        code: '',
        location: '',
        tableVisible: false,
        name: ''
      })
      //超时失败
      const onStatus = () => {
        if (taskDefinition.status == '0') {
          taskDefinition.timeoutFlag = 'OPEN'
        }else if (taskDefinition.status == '1') {
          taskDefinition.timeoutFlag = 'CLOSE'
        }
      }
      const onCommit = () => {
        onStatus()
        watch()
        emit("onCommit", taskDefinition );
        emit('close')
      }
      onMounted(() => {
      });
      watch([visible, code, projectCode, workName, taskCode],(newval,oldval) => {
        state.code = code
        state.projectCode = projectCode
        taskDefinition.code = code
        taskDefinition.projectCode = projectCode
        taskDefinition.id = taskCode
        console.log(taskDefinition.id);
        state.name = workName
        flinkVisible.value = newval[0]
        if(flinkVisible.value == true && state.projectCode){
          proxy.$axios.get(`/dolphinscheduler/projects/process-definition/taskTree/${state.code}?code=${state.code}&projectCode=${state.projectCode}`)
          .then(({data}) => {
            if(data.code == 200){
              Object.assign(taskDefinition, data.data.taskDefinition)
            }else{
              ElMessage.error(data.msg)
            }
          })
        }
      })
      const getCode = (e, k, x) => {
        var m = JSON.stringify(k)
        taskDefinition.taskWork = e;
        taskDefinition.taskParams = m;
        taskDefinition.callTaskId = x;
      }
      const handleClose = () => {
        proxy.$refs.form.resetFields()
        emit('close')
      }
      const chooseWork = () => {
        state.tableVisible = true
      }
      const closeModal = () => {
        proxy.$refs.form.resetFields()
        state.tableVisible = false
      }
      return {
        taskDefinition,
        state,
        flinkVisible,
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