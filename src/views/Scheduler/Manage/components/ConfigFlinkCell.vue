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
          <el-switch v-model="taskDefinition.timeoutFlag" active-text="启用" @change="onStatus" inactive-text="禁用" active-value="OPEN" inactive-value="CLOSE">
          </el-switch>
        </el-form-item>
        <el-form-item label="汇聚作业" prop="taskWork">
          <el-input class="flex-1" v-model="taskDefinition.taskWork" disabled></el-input>
          <el-button type="primary" class="flex ml-20" @click="chooseWork">选择</el-button>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary"  @click="onCommit">确定</el-button>
      </div>
    </div>
  </el-drawer>
  <flink-convergence :dialog-table-visible="state.tableVisible" @close="closeModal" @give-code="getCode" :table-name="taskDefinition.taskWork"/>
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
      definition: [Object, String, null, Array, []],
    },
    emits:['close', 'getFlink'],
    setup(props, {emit}) {
      const { proxy } = getCurrentInstance();
      const { visible, code, projectCode, workName, taskCode, definition } = toRefs(props)
      const flinkVisible = ref(false)
      const  taskDefinition = reactive({ // 声明表单信息
        name: '',
        description: '',
        timeoutFlag: "CLOSE",
        taskWork: '',
        taskParams: '',
        taskType: "DLINK",
        projectCode: '',
        code: '',
        callTaskId: '',
        nodeId: [],
      })
      const state = reactive({
        drawer : false,
        projectCode: '',
        code: '',
        location: '',
        tableVisible: false,
        name: '',
        definition: [],
      })
      //获取作业名、选中的整条数据、id
      const getCode = (e, k, x) => {
        var m = JSON.stringify(k)
        taskDefinition.taskWork = e;
        taskDefinition.taskParams = m;
        taskDefinition.callTaskId = x;
        console.log(taskDefinition.taskWork);
      }
      //超时失败
      const onStatus = () => {
        if (taskDefinition.timeoutFlag == "OPEN") {
          taskDefinition.timeoutNotifyStrategy = "WARN"
        }else if (taskDefinition.timeoutFlag == "CLOSE") {
          taskDefinition.timeoutNotifyStrategy = "FAILED"
        }
      }
      onMounted(() => {
        watch
      });
      watch([visible, code, projectCode, workName, taskCode, definition],(newval,oldval) => {
        state.code = newval[1]
        state.projectCode = newval[2]
        taskDefinition.code = newval[4]
        taskDefinition.projectCode = newval[2]
        taskDefinition.nodeId = newval[4]
        state.name = newval[3]
        flinkVisible.value = newval[0]
        state.definition = newval[5].taskParams
        console.log(state.definition);
        const arr = []
        for (let i in state.definition) {
          let o = '';
          o = state.definition[i];
          arr.push(o)
        }
        Object.assign(taskDefinition, newval[5],{taskWork: arr[13], taskParams: state.definition})
      })
      //提交
      const onCommit = () => {
        emit("getFlink", taskDefinition);
        emit('close')
        console.log(taskDefinition);
      }
      const handleClose = () => {
        proxy.$refs.form.resetFields()
        emit('close')
      }
      const chooseWork = () => {
        state.tableVisible = true
      }
      const closeModal = () => {
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
        onStatus,
      }
    }
  })
</script>

<style lang="scss" scoped>

</style>