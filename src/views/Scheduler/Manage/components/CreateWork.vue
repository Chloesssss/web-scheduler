<template>
  <el-dialog :title="id ? '重命名' : '新增目录'" v-model="visible" @close="onCancel" width="500px">
    <el-form ref="Form" :rules="rules" :model="formObj" label-width="60px">
      <el-form-item label="名称" prop="projectName">
        <el-input v-model="formObj.projectName"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">取 消</el-button>
        <el-button type="primary" @click="onCommit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import {reactive, getCurrentInstance, watch} from 'vue'
import {cloneDeep} from 'lodash'
import { ElMessage } from 'element-plus'

export default {
  name: 'CreateWork',
  emits: ['cancel', 'onOk'],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    id: [String, Number],
    name: String,
    parentId: [String, Number]
  },
  setup(props, {emit}) {
    const {proxy} = getCurrentInstance()
    const rules = {
      projectName: [{required: true, message: '请输入', trigger: 'change'}],
    }
    const formObj = reactive({
      code: '',
      projectName: '',
      description: '',
      isLeaf: false
    })
    const onCancel = () => {
      proxy.$refs.Form.resetFields()
      emit('cancel')
    }
    const onCommit = () => {
      proxy.$refs.Form.validate(valid => {
        if (valid) {
          if(!props.id) { // 新增
            const formObjTemp = cloneDeep(formObj)
            formObjTemp.parentId = props.parentId
            delete formObjTemp.id
            proxy.$axios.post('/dolphinscheduler/projects',formObjTemp).then(({ data }) => {
              console.log(data.code);
              if (data.code === 200) {
                ElMessage.success(data.msg)
                emit('onOk')
              } else {
                ElMessage.error(data.msg)
                proxy.$refs.Form.resetFields()
                emit('onOk')
              }
            }).catch(e=> {
              ElMessage.error('请求失败！请重试！')
            })
          } else { // 修改
            const formObjTemp = cloneDeep(formObj)
            formObjTemp.code = props.id
            delete formObjTemp.parentId
            delete formObjTemp.isLeaf
            proxy.$axios.put(`/dolphinscheduler/projects/${formObjTemp.code}`,formObjTemp).then(({ data }) => {
              if (data.code === 200) {
                ElMessage.success(data.msg)
                emit('onOk')
              } else {
                ElMessage.error(data.msg)
                proxy.$refs.Form.resetFields()
                emit('onOk')
              }
            }).catch(e=> {
              ElMessage.error('请求失败！请重试！')
            })
          }
        }
      })
    }
    watch(() => {
      return props.visible
    }, (newVal) => {
      if (newVal) {
        if (props.id) { // 修改
          formObj.projectName = props.name
        } else {
          formObj.projectName = ''
        }
      }
    })
    return {
      rules,
      formObj,
      onCancel,
      onCommit,
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
