<template>
  <el-dialog
    :title="dataId ? '编辑API分组' : '定时管理'"
    v-model="dialogForm"
    :before-close="cancelFun"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    width="800px"
  >
    <el-form ref="groupForm" :model="formObj" label-width="100px">
      <el-form-item
        label="起止时间"
        prop="validDate"
        :rules="rules.validDateSort"
      >
        <el-date-picker
          style="width: 100%"
          v-model="formObj.validDate"
          range-separator="-"
          size="mini"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="执行规则" prop="executionRule">
        <!-- <el-popover
          v-model:visible="state.cronPopover"
          width="700px"
          trigger="manual"
          placement="top"
        >
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
              v-model="formObj.executionRule"
              placeholder="* * * * * ? *"
            ></el-input>
          </template>
        </el-popover> -->
        <el-space>
          每<el-input v-model="formObj.executionRule" style="width: 250px">
            <template #append>
              <el-select v-model="formObj.select" style="width: 80px">
                <el-option label="秒" value="1"></el-option>
                <el-option label="分钟" value="2"></el-option>
              </el-select>
            </template> </el-input
          >执行一次
          <el-button @click="previewTime">时间预览</el-button>
        </el-space>
      </el-form-item>
      <el-form-item label="作业状态" prop="status">
        <el-switch
          v-model="formObj.status"
          inline-prompt
          active-text="上线"
          inactive-text="下线"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="失败策略" prop="failStrategy">
        <el-radio-group v-model="formObj.failStrategy">
          <el-radio label="继续"></el-radio>
          <el-radio label="结束"></el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelFun">取 消</el-button>
        <el-button type="primary" @click="onOkClick">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import {
  defineComponent,
  getCurrentInstance,
  ref,
  toRefs,
  reactive,
  watch,
} from "vue";
import { vue3Cron } from "vue3-cron";
import { ElMessage } from "element-plus";
export default defineComponent({
  name: "timeControl",
  components: { vue3Cron },
  props: {
    dialogFormVisible: Boolean,
    dataId: String,
  },
  emits: ["close", "getData"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const { dialogFormVisible, dataId } = toRefs(props);
    //设置初始弹框状态
    const dialogForm = ref(false);
    //设置id初始值
    const newId = ref("");
    //初始表单数据
    let formObj = reactive({
      executionRule: "",
      status: "",
      validDate: [],
      failStrategy: "",
      select: "2",
    });
    const state = reactive({
      cronPopover: false,
    });
    //校验规则
    const rules = reactive({
      validDateSort: [
        { required: false, message: "请选择起止时间", trigger: "change" },
      ],
    });
    //关闭弹框
    const cancelFun = () => {
      //state.cronPopover = false
      emit("close");
    };
    //监听
    watch(
      [dialogFormVisible, dataId],
      (newValue, oldValue) => {
        dialogForm.value = newValue[0];
        newId.value = newValue[1];
        if (dialogForm.value) {
          if (newId.value) {
          } else {
          }
        }
      },
      { deep: true }
    );
    //提交表单
    const onOkClick = () => {
      proxy.$refs["groupForm"].validate((valid) => {
        if (valid) {
          if (newId.value) {
            proxy.$axios.post(`/dolphinscheduler/projects/schedules`, {
              projectCode: state.projectCode,
            }).then(({ data }) => {
              proxy.$refs.Form.resetFields();
              emit("onOk", "");
              ElMessage.success("保存成功");
              formObj = null;
            })
            .catch(({ data }) => {
              ElMessage.error(data.msg);
            });
          }
        }
      });
    };
    //cron
    // const changeCron = (val) => {
    //   if (typeof val !== "string") return false;
    //   formObj.executionRule = val;
    // };
    // const togglePopover = (bol) => {
    //   state.cronPopover = bol;
    // };
    return {
      formObj,
      cancelFun,
      dialogForm,
      onOkClick,
      rules,
      // changeCron,
      // togglePopover,
    };
  },
});
</script>