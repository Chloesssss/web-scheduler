<template>
  <el-drawer
    ref="drawer"
    v-model="dialogVisible"
    title="数据调度节点"
    :before-close="handleClose"
    direction="ltr"
    custom-class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <el-form :model="form">
        <el-form-item label="节点名称" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth">
          <el-input v-model="form.desc" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="超时失败">
          <el-switch v-model="form.overTime"></el-switch>
        </el-form-item>
        <el-form-item label="汇聚作业">
          <el-select v-model="form.work" clearable placeholder="请选择">
            <el-option v-for="item in state.workOptions" :key="item.key" :label="item.key" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="源表">
          <el-input v-model="form.originTable"></el-input>
        </el-form-item>
        <el-form-item label="目标表">
          <el-input v-model="form.targetTable"></el-input>
        </el-form-item>
      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="cancelForm">取消</el-button>
        <el-button type="primary" :loading="loading" @click="$refs.drawer.close()">{{ loading ? '提交中 ...' : '提交' }}</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
  import { defineComponent, reactive, toRefs, onMounted, getCurrentInstance } from "vue";
  import { ElMessageBox } from 'element-plus'

  export default defineComponent({
    name: "treeFrom",
    setup() {
      const { proxy } = getCurrentInstance();
      const state = reactive({
        drawer : false,
        dialogVisible: false,
        form: {
          name: '',
          desc: '',
          overTime: '',
          work: '',
          originTable: '',
          targetTable: '',
        },
      })
      const handleClose = (done) => {
        if (state.loading) {
          return
        }
        ElMessageBox.confirm('Do you want to submit?')
        .then(() => {
          state.loading = true
          state.timer = setTimeout(() => {
            done()
            // 动画关闭需要一定的时间
            setTimeout(() => {
              state.loading = false
            }, 400)
          }, 2000)
        })
        .catch(() => {
          // catch error
        })
      }
      const cancelForm = () => {
      state.loading = false
      state.dialog = false
      clearTimeout(state.timer)
      }
      return {
        ...toRefs(state),
        handleClose,
        cancelForm,
      }
    }
  })
</script>

<style lang="scss" scoped>

</style>