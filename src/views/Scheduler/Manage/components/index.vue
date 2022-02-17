<template>
  <el-dialog title="定时管理配置" v-model="visible" @close="onCancel" width="900px" :append-to-body='true'>
    <div class="flex justify-content-center">
      <el-form style="width: 700px;height: 420px" ref="Form" :rules="state.rules" :model="formObj" label-width="100px">
        <div class="flex">
        <el-form-item label="开始时间" class="flex-1" prop="startTime">
          <el-date-picker
            v-model="formObj.startTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
          >
          </el-date-picker>
        </el-form-item>
        <span class="flex-1">-</span>
        <el-form-item label="结束时间" class="flex-1"  prop="endTime">
          <el-date-picker
            v-model="formObj.endTime"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="datetime"
          >
          </el-date-picker>
        </el-form-item>
        </div>
        <el-form-item label="失败重试" prop="retry">
          <el-switch :active-value="0" :inactive-value="1" v-model="formObj.retry" @change="onFailTryChange" />
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
  import {reactive, getCurrentInstance, watch, onMounted, toRefs, onBeforeUnmount } from 'vue'
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
      id: [Number, String],
      historyObj: Object,
      projectCode: [String, Number],
      code: [String, Number],
    },
    setup(props, {emit}) {
      const {proxy} = getCurrentInstance()
      const { visible, projectCode, code } = toRefs(props)
      const state = reactive({
        rules: {
          clusterId: [{required: true, message: '请输入', trigger: 'change'}],
          cronExpression: [{required: true, message: '请输入', trigger: 'change'}],
          retryTimes: [{required: false, message: '请输入', trigger: 'change'}],
          retryInterval: [{required: true, message: '请输入', trigger: 'change'}],
          // validDate: [{required: false, message: '请选择', trigger: 'change'}],
        },
        projectCode,
        code,
        menuList: [],
        cronPopover: false,
        options: [],
        clusterList: [],
        menuObj: [],
      })
      const formObj = reactive({
        cronExpression: '',
        noRetry: 'END',
        keepRetry: 'CONTINUE',
        startTime:'',
        endTime:'',
        retry: 1,
        linkDtos: [
        ],
        nodeDtos: [
        ]
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
      //   proxy.$axios.get('/dlink/dlink-admin/cluster').then(({data}) => {
      //     state.clusterList = data
      //     state.clusterList.unshift({
      //       id: 0,
      //       type: 'Local',
      //       name: '本地环境'
      //     })
      //   })
      // }
      const onCommit = () => {
        console.log(formObj.retry);
        let s = formObj.retry
        if(formObj.retry == 0) {
          s = formObj.keepRetry
        } else {
          s = formObj.noRetry
        }
        proxy.$refs.Form.validate(valid => {
          if(valid) {
            proxy.$axios.post('/dolphinscheduler/projects/schedules', {
              projectCode: state.projectCode,
              processDefinitionCode: state.code,
              startTime: formObj.startTime,
              endTime: formObj.endTime,
              crontab: formObj.cronExpression,
              failureStrategy: s
            }).then(({data}) => {
              if(data.code === 200) {
                ElMessage.success('保存成功')
                proxy.$refs.Form.resetFields()
                emit('onOk', 'close')
                onCancel()
              } else {
                ElMessage.error(data.msg)
                onCancel()
              }
            }).catch(e => {
              ElMessage.error('保存失败请重试！')
              onCancel()
            })
          }
        })
      }
      onMounted(() => {
        state.projectCode = projectCode
        state.code = code
        // getClusterList()
      })
      return {
        state,
        formObj,
        visible,
        onCancel,
        onCommit,
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
</style>
