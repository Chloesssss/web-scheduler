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
          <el-switch v-model="taskDefinition.timeoutFlag"></el-switch>
        </el-form-item>
        <el-form-item label="汇聚作业" prop="taskParams">
          <el-input class="flex-1" v-model="taskDefinition.taskParams" disabled></el-input>
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
      name: String,
    },
    emits:['close'],
    setup(props, {emit}) {
      const { proxy } = getCurrentInstance();
      const { visible, code, projectCode, name } = toRefs(props)
      const flinkVisible = ref(false)
      const  taskDefinition = reactive({ // 声明查询信息
        name: null,
        description: null,
        timeoutFlag: null,
        taskParams: '',
      })
      const state = reactive({
        drawer : false,
        projectCode: '',
        code: '',
        location: '',
        tableVisible: false,
        name: ''
      })
      const onCommit = () => {
        proxy.$axios.put(`/dolphinscheduler/projects/process-definition/${state.code}`,{
          code: state.code,
          projectCode: state.projectCode,
          name: state.name,
          location: state.location,
          taskType: DLINK
        }).then(({ data }) => {
          if (data.code = 200) {
            ElMessage.success('保存成功')
            proxy.$refs.form.resetFields()
            emit('close')
          } else {
            ElMessage.error(data.msg)
            proxy.$refs.form.resetFields()
            emit('close')
          }
        }).catch(e=> {
          ElMessage.error('请求失败！请重试！')
        });
      }
      onMounted(() => {
        watch()
      });
      watch([visible, code, projectCode, name],(newval,oldval) => {
        state.code = code
        state.projectCode = projectCode
        state.name = name
        console.log(newval)
        flinkVisible.value = newval[0]
      })
      const getCode = (e) => {
        console.log(e);
        taskDefinition.taskParams = e;
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
      }
    }
  })
</script>

<style lang="scss" scoped>

</style>