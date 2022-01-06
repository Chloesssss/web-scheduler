<template>
  <!-- 添加token -->
    <el-dialog
      :title="定时管理"
      v-model="timeForm"
      :close-on-click-modal="false"
      :before-close="handleClose"
      :destroy-on-close="false"
      width="60%">
      <el-form :model="form" ref="formRef" :label-position="labelPosition" label-width="70px">
        <el-form-item label="起止时间" prop="validDate"
        :rules="[
          { required: true, message: '选择起止时间', trigger: 'blur' },
        ]">
          <el-date-picker
            style="width: 100%"
            v-model="from.validDate"
            range-separator="-"
            size="mini"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetimerange">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="执行规则" prop="executionRule">
          <el-input v-model="form.executionRule" maxlength="100" type="textarea" show-word-limit />
        </el-form-item>
        <el-form-item label="作业状态" prop="status">
          <el-switch v-model="form.status" inline-prompt active-text="上线" inactive-text="下线">
          </el-switch>
        </el-form-item>
        <el-form-item label="作业状态" prop="status">
          <el-switch v-model="form.status" inline-prompt active-text="上线" inactive-text="下线">
          </el-switch>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleClose">取 消</el-button>
          <el-button type="primary" @click="save">确 定</el-button>
        </span>
      </template>
    </el-dialog>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, toRefs, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
export default defineComponent ({
  name: 'tokenCreate',
  props: {
    timeFormVisible: {
      ype: Boolean,
      required: true,
      default: false
    },
     dataId: String
  },
  emits:['close', 'getData'],
  setup(props, { emit }){
    const { proxy } = getCurrentInstance();
    const { timeFormVisible,dataId } = toRefs(props)
    //设置初始弹框状态
    const timeForm = ref(false)
    //设置id初始值
    const newId = ref('')
    const form = reactive({ 
      token: '',
      note: '',
      expire: ''
    })
    //关闭弹窗
    const handleClose = () => {
      emit('close', false)
      emit('getData')
    }
    //设置可选中的有效期在当前日期之后
    const disabledDate = (time) => {
      return time.getTime() <= Date.now()
    }
    //转换选择器所选日期类型，将日期格式改为时间戳格式
    const getTimeString = () => {
      if(form.expire != null&&form.expire != ""){
        //form.expire = new Date()
        form.expire = typeof(form.expire) == 'number'?form.expire:String(form.expire.getTime())
      }
    }
    //生成TOKEN
    const createToken = () => {
      proxy.$axios.get("/dsink-server/dsToken/generate",form.token)
      .then((res) => {
        let resq = res.data
        if(resq.code == 200){
          proxy.form.token = resq.data
          ElMessage.success('成功生成token')
        }
        else{
          ElMessage.error(resq.msg)
        }
      })
    }
    //监听
    watch([timeFormVisible, dataId],(newValue,oldValue) => {   
      timeForm.value = newValue[0];
      newId.value = newValue[1];
      if(timeForm.value){
        if(newId.value){
          proxy.$axios.get(`/dsink-server/dsToken/${newId.value}`)
          .then((res) => {
            let resq = res.data
            if(resq.code == 200){
              console.log(resq.data);
              Object.assign(form, resq.data,{id: String(newId.value)})
            }else{
              ElMessage.error(resq.msg)
            }
          });
        }
      }else{
        Object.assign(form,{token: '',note: '',expire: '',id: ''})
      }
    },{deep:true})
    //提交表单
    const save = () => {
      proxy.$refs['formRef'].validate((valid) => {
        if(valid) {
          getTimeString()
          if(form.expire != null){
            form.expire = String(form.expire)
          }
          if(newId.value){
            //修改
            proxy.$axios.put("/dsink-server/dsToken",form)
            .then((res) => {
              let resq = res.data
              if(resq.code == 200){
                ElMessage.success('修改成功')
                handleClose()
                emit('getData')
                // proxy.$refs['form'].resetFields()
              }else{
                ElMessage.error(resq.msg)
                handleClose()
              }
            });
          }else{
            //新增
            proxy.$axios.post("/dsink-server/dsToken",form)
            .then((res) => {
              let resq = res.data
              if(resq.code == 200){
                ElMessage.success('添加成功')
                handleClose()
                // proxy.$refs['form'].resetFields()
              }else{
                ElMessage.error(resq.msg)
                handleClose()
              }
            });
          } 
        }
      })
    }
    return{
      timeForm,
      labelPosition: 'right',
      form,
      handleClose,
      save,
      disabledDate,
      createToken,
    }
  }
})
</script>