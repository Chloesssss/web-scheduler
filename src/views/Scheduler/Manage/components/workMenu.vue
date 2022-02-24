<template>
  <el-dialog :title="id ? '编辑作业' : '新增作业'" @close="onCancel" v-model="visible" width="500px">
    <el-form ref="Form" :rules="rules" :model="formObj" label-width="60px">
      <el-form-item label="名称" prop="name">
        <el-input v-model="formObj.name"></el-input>
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
  name: 'WorkMenu',
  emits: ['cancel', 'onOk'],
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    name: String,
    id: [String, Number],
    parentId: [String, Number]
  },
  setup(props, {emit}) {
    const {proxy} = getCurrentInstance()
    const rules = {
      name: [{required: true, message: '请输入', trigger: 'change'}],
      alias: [{required: true, message: '请输入', trigger: 'change'}],
    }
    const formObj = reactive({
      code: '',
      name: '',
      projectCode: '',
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
            formObjTemp.projectCode = props.parentId
            formObjTemp.timeout = 0
            delete formObjTemp.id
            proxy.$axios.post('/dolphinscheduler/projects/process-definition', formObjTemp).then(({ data }) => {
              if (data.code = 200) { // 0成功 1失败
                ElMessage.success('保存成功')
                proxy.$refs.Form.resetFields()
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
            formObjTemp.projectCode = props.parentId
            delete formObjTemp.parentId
            delete formObjTemp.isLeaf
            proxy.$axios.put('/dolphinscheduler/projects/process-definition/name', formObjTemp).then(({ data }) => {
              if (data.code) { // 0成功 1失败
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
          formObj.name = props.name
        } else {
          formObj.name = ''
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
