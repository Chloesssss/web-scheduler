<template>
  <el-drawer
    ref="drawer"
    v-model="controlVisible"
    title="数据质控调度节点"
    :before-close="onCancel"
    :show-close="false"
    direction="rtl"
    custom-class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <el-form :model="taskDefinition" label-width="100px" ref="Form" :rules="state.rules">
        <el-form-item label="节点名称" prop="name">
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
  <control-convergence :dialog-table-visible="state.tableVisible" @close="closeModal" @give-code="getCode" :table-name="taskDefinition.taskWork"/>
</template>

<script>
  import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from "vue";
  import { ElMessageBox } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import ControlConvergence from "./ControlConvergence.vue";

  export default defineComponent({
  components: { ControlConvergence },
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
      id: [Number, String],
    },
    emits:['close', 'getControl'],
    setup(props, {emit}) {
      const { proxy } = getCurrentInstance();
      const { visible, code, projectCode, workName, taskCode, definition, id } = toRefs(props)
      const controlVisible = ref(false)
      const  taskDefinition = reactive({ // 声明表单信息
        name: '',
        description: '',
        timeoutFlag: "CLOSE",
        taskWork: '',
        taskParams: '',
        taskType: "DQUALITY",
        projectCode: '',
        code: '',
        callTaskId: '',
        nodeId: '',
      })
      const state = reactive({
        drawer : false,
        projectCode: '',
        code: '',
        location: '',
        tableVisible: false,
        name: '',
        definition: [],
        rules: {
          name: [{required: true, message: '请输入节点名称', trigger: 'change'}],
          taskWork: [{required: true, message: '请点击选择按钮配置作业', trigger: 'change'}],
        },
      })
      //获取作业名、选中的整条数据、id
      const getCode = (e, k, x) => {
        var m = JSON.stringify(k)
        taskDefinition.taskWork = e;
        taskDefinition.name = e;
        taskDefinition.taskParams = m;
        taskDefinition.callTaskId = x;
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
      });
      watch([visible, code, projectCode, workName, taskCode, definition, id],(newval,oldval) => {
        controlVisible.value = newval[0]
        state.code = newval[1]
        state.projectCode = newval[2]
        state.name = newval[3]
        taskDefinition.code = newval[4]
        taskDefinition.projectCode = newval[2]
        taskDefinition.nodeId = newval[4]
        let ong = {
          name: '',
          description: '',
          timeoutFlag: "CLOSE",
          taskWork: '',
          taskParams: '',
          taskType: "DQUALITY",
          callTaskId: '',
        }
         let obj = newval[5]?1:0
        if (newval[0]) {
          if (!props.id) {
            console.log(obj);
            if (!obj) {
              Object.assign(taskDefinition,ong)
            }else{
              Object.assign(taskDefinition, newval[5])
            }             
          }else{
            state.definition = newval[5].taskParams
            const arr = []
            for (let i in state.definition) {
              let o = '';
              o = state.definition[i];
              arr.push(o)
            }
            console.log(arr);
            Object.assign(taskDefinition, newval[5],{taskWork: arr[1], taskParams: state.definition})
          }
        }
      })
      //提交
      const onCommit = () => {
        proxy.$refs.Form.validate(valid => {
          if(valid) {
            emit("getControl", taskDefinition);
            proxy.$refs['Form'].resetFields()
            emit('close')
          }
        })
      }
      const handleClose = () => {
        proxy.$refs['Form'].resetFields()
        emit('close')
      }
      const onCancel = (done) => {
        ElMessageBox.confirm('是否需要提交配置内容？')
        .then(() => {
          onCommit()
        })
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
        controlVisible,
        ...toRefs(state),
        onCancel,
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