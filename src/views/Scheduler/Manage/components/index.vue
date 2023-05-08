<template style="width:700">
  <el-dialog :title="state.flagCode?'更新定时管理':'定时管理配置'" v-model="timeVisible" @close="onCancel" width="700px" :append-to-body='true'>
    <div class="flex justify-content-center">
      <el-form ref="Form" :rules="state.rules" :model="formObj" label-width="100px">
        <div class="flex">
        <el-form-item label="开始时间" class="flex-1" prop="startTime">
          <el-date-picker
            v-model="formObj.startTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
            :disabled-date="disabledTime"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" class="flex-1"  prop="endTime">
          <el-date-picker
            class="date_picker"
            v-model="formObj.endTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
            :disabled-date="disabledDate"
          >
          </el-date-picker>
        </el-form-item>
        </div>
        <el-form-item label="失败重试" prop="failureStrategy">
          <el-radio-group v-model="formObj.status" size="small">
            <el-radio-button label="0">启用</el-radio-button>
            <el-radio-button label="1">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <!-- <div class="flex" v-if="formObj.retry">
          <el-form-item class="flex-1" label="重试次数" prop="retryTimes">
            <el-input-number class="width-a-hundred-percent" v-model="formObj.retryTimes" controls-position="right"
                             :min="0" :max="99999" :step-strictly="true" :step="1"/>
          </el-form-item>
          <el-form-item class="flex-1" label="重试间隔" prop="retryInterval">
            <el-input-number class="width-a-hundred-percent" v-model="formObj.retryInterval" controls-position="right"
                             :min="5" :max="99999" :step-strictly="true" :step="1"/>
          </el-form-item>
        </div> -->
        <div class="flex">
          <el-form-item class="flex-1" label="cron表达式" prop="cronExpression">
            <el-popover v-model:visible="state.cronPopover" width="700px" trigger="manual" placement="top">
              <vue3Cron
                @change="changeCron"
                @close="togglePopover(false)"
                max-height="400px"
                i18n="cn"
              ></vue3Cron>
              <template #reference>
                <el-input
                  @focus="togglePopover(true)"
                  maxlength="50"
                  v-model="formObj.cronExpression"
                  placeholder="* * * * * ? *"
                ></el-input>
              </template>
            </el-popover>
          </el-form-item>
        </div>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">取 消</el-button>
        <el-button type="primary" @click="onCommit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
  import {reactive, getCurrentInstance, watch, onMounted, toRefs, ref } from 'vue'
  import { vue3Cron } from 'vue3-cron'
  import { cloneDeep } from 'lodash'
  import { ElMessage } from 'element-plus'

  export default {
    name: "index",
    components: { vue3Cron },
    emits: ['close', 'onOk'],
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      projectCode: [String, Number],
      code: [String, Number],
    },
    setup(props, {emit}) {
      const {proxy} = getCurrentInstance()
      const { visible, projectCode, code } = toRefs(props)
      const timeVisible = ref(false)
      const state = reactive({
        rules: {
          cronExpression: [{required: true, message: '请输入', trigger: 'change'}],
          // validDate: [{required: false, message: '请选择', trigger: 'change'}],
        },
        projectCode,
        code,
        menuList: [],
        cronPopover: false,
        options: [],
        clusterList: [],
        menuObj: [],
        flagCode:''
      })
      const formObj = reactive({
        cronExpression: '',
        failureStrategy: '',
        startTime:'',
        endTime:'',
        status: 0,
      })
      const onCancel = () => {
        state.cronPopover = false
        proxy.$refs.Form.resetFields()
        emit('close', '')
      }
      const changeCron = (val) => {
        if(typeof(val) !== 'string') return false
        formObj.cronExpression = val
      }
      const togglePopover = (bol) => {
        state.cronPopover = bol
      }
      // const getClusterList = () => {
      //  proxy.$axios.get('/dlink/dlink-admin/cluster').then(({data}) => {
      //     state.clusterList = data
      //     state.clusterList.unshift({
      //       id: 0,
      //       type: 'Local',
      //       name: '本地环境'
      //     })
      //   })
      // }
      //状态
      const onStatus = () => {
        if (formObj.status == '0') {
          formObj.failureStrategy = 'CONTINUE'
        }else if (formObj.status == '1') {
          formObj.failureStrategy = 'END'
        }
      }
      //设置可选中的有效期在当前日期之后
      const disabledDate = (time) => {
        return formObj.startTime ? time.getTime() <= new Date(formObj.startTime).getTime() : false ;
      }
      const disabledTime = (time) => {
        return formObj.endTime ? time.getTime() >= new Date(formObj.endTime).getTime() : false ;
      }
      //提交表单
      const onCommit = () => {
        onStatus()
        proxy.$refs.Form.validate(valid => {
          if(valid) {
            if(state.flagCode){
              // 修改定时调度
              // proxy.$axios.put(`/dolphinscheduler-api/dolphinscheduler/projects/schedules/${state.flagCode}`, {
              //   id: state.flagCode,
              //   projectCode: state.projectCode,
              //   processDefinitionCode: state.code,
              //   startTime: formObj.startTime,
              //   endTime: formObj.endTime,
              //   crontab: formObj.cronExpression,
              //   failureStrategy: formObj.failureStrategy
              // }).then(({data}) => {
              //   if(data.code === 200) {
              //     ElMessage.success('保存成功')
              //     proxy.$refs.Form.resetFields()
              //     emit('onOk', 'close')
              //     onCancel()
              //   } else {
              //     ElMessage.error(data.msg)
              //     onCancel()
              //   }
              // }).catch(e => {
              //   ElMessage.error('保存失败请重试！')
              //   onCancel()
              // })
            } else {
              // 新增定时调度
              // proxy.$axios.post(`/dolphinscheduler-api/dolphinscheduler/projects/schedules`, {
              //   projectCode: state.projectCode,
              //   processDefinitionCode: state.code,
              //   startTime: formObj.startTime,
              //   endTime: formObj.endTime,
              //   crontab: formObj.cronExpression,
              //   failureStrategy: formObj.failureStrategy,
              //   warningType: "NONE",
              // }).then(({data}) => {
              //   if(data.code === 200) {
              //     ElMessage.success('保存成功')
              //     proxy.$refs.Form.resetFields()
              //     emit('onOk', 'close')
              //     onCancel()
              //   } else {
              //     ElMessage.error(data.msg)
              //     onCancel()
              //   }
              // }).catch(e => {
              //   ElMessage.error('保存失败请重试！')
              //   onCancel()
              // })
            }
          }
        })
      }
      //监听
      watch([visible, code, projectCode],(newValue,oldValue) => {
        timeVisible.value = newValue[0];
        if(timeVisible.value){
          // proxy.$axios.post(`/dolphinscheduler-api/dolphinscheduler/projects/schedules/query-schedules-page?current=1&size=1&projectCode=${state.projectCode}&processDefinitionCode=${state.code}`)
          // .then((data) => {
          //   let resq =data.data
          //   if(resq.code == 200){
          //     state.flagCode=resq.data.totalList[0].id
          //     formObj.startTime = resq.data.totalList[0].startTime,
          //     formObj.endTime = resq.data.totalList[0].endTime,
          //     formObj.cronExpression = resq.data.totalList[0].crontab
          //     if(state.flagCode) {
          //       formObj.failureStrategy = resq.data.totalList[0].failureStrategy,
          //       formObj.status = formObj.failureStrategy == "CONTINUE" ? 0 : 1
          //     }else {
          //       onStatus()
          //     }
          //   }else{
          //     ElMessage.error(data.msg)
          //   }
          // });
        }else{
          Object.assign(formObj,{ startTime: '', endTime: '', failureStrategy: '', crontab: '' })
        }
      },{deep:true})
      onMounted(() => {
        state.projectCode = projectCode
        state.code = code
        // getClusterList()
      })
      return {
        state,
        formObj,
        timeVisible,
        onCancel,
        onCommit,
        disabledTime,
        disabledDate,
        togglePopover,
        changeCron,
      }
    }
  }
</script>

<style lang="scss" scoped>
</style>
<style>
  .dispatch-left-tree-container .el-tree-node__expand-icon {
    margin-bottom: 10px;
  }
  .dispatch-left-tree-container .el-tree-node__content:hover {
    background: none;
  }
  .el-picker-panel__footer .el-button--text.el-picker-panel__link-btn {
    display: none;
  }
  .el-dialog__header { 
    padding: 10px;
    background-color: #1D77DE;
    align-items: center;
    justify-content: space-around;
    width: 96%;
  }

</style>
