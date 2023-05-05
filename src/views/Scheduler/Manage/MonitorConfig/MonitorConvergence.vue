<template>
  <!-- 汇聚作业选择列表 -->
  <el-dialog v-model="tableVisible" title="汇聚作业选择列表" width="1448px" @close="onCancel">
    <div>
      <el-form ref="searchform" :inline="true" :model="searchObj">
        <!-- <el-form-item label="作业状态">
          <el-select filterable clearable v-model="searchObj.runStatus" placeholder="请选择" >
            <el-option  v-for="item in state.runStatusOptions" :key="item.key" :label="item.key" :value="item.value" />
          </el-select>
        </el-form-item> -->
        <el-form-item label="作业名称">
          <el-input v-model="searchObj.name" clearable placeholder="作业名称" maxlength="50" class="mr-10" />
        </el-form-item>
        <el-form-item label="作业主题">
          <el-input v-model="searchObj.theme" clearable placeholder="作业名称" maxlength="50" class="mr-10" />
        </el-form-item>
        <!-- <el-form-item label="作业主题">
          <el-select filterable clearable v-model="searchObj.motif" placeholder="请选择" >
            <el-option v-for="item in state.motifList" :key="item.key" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <c-button type="search" @click="fetchData()" />
          <!-- <el-button @click="reset">重置</el-button> -->
        </el-form-item>
      </el-form>
      <el-table
        ref="multipleTable"
        v-loading="state.loading"
        border
        class="mt-20"
        :data="state.tableData"
        stripe
        @selection-change="selectChoose"
      >
        <el-table-column type="selection" width="55" />
        <!-- <el-table-column prop="cronExpression" label="cron表达式" show-overflow-tooltip/> -->
        <el-table-column prop="jobId" label="编号" show-overflow-tooltip />
        <el-table-column prop="jobName" label="任务名称" show-overflow-tooltip />
        <!-- <el-table-column prop="status" label="状态" show-overflow-tooltip>
          <template #default="{row}">
            <el-tag
              :type="row.status === 'running' ? '' : 'danger'"
              disable-transitions
            >{{ row.status === 'running' ? '运行中' : '下线' }}</el-tag>
          </template>
        </el-table-column> -->
        <el-table-column prop="jobTheme" label="主题" show-overflow-tooltip />
        <el-table-column prop="strategy" label="策略" show-overflow-tooltip/>
      </el-table>
    </div>
    <!-- 表格底部分页显示 -->
    <c-pagination :pages="pageObj" @on-page-change="onPageChange()" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onCancel">取 消</el-button>
        <el-button type="primary" @click="onCommit()">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, toRefs, onMounted, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import { Pagination } from "@/../common/constants";
import { cloneDeep } from "lodash";
import { ElMessage } from "element-plus";
import { Message } from "@/../common/utils/message";
import { DeleteConfirm } from "@/../common/utils/index.js";
// import { ApiConstant } from '@/constants/ApiConstant/index.js'

export default defineComponent({
  name: "WorkConver",
  props: {
    dialogTableVisible: {
      type: Boolean,
      default: false
    },
    tableName: String,
  },
  emits:['close', 'giveCode'],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const pageObj = reactive(cloneDeep(Pagination));
    const { dialogTableVisible, tableName } = toRefs(props)
    const tableVisible = ref(false)
    const router = useRouter();
    const searchObj = reactive({
      // 声明查询信息
      // runStatus: "",
      name: "",
      theme: "",
      // motif: "",
    });
    const state = reactive({
      valList: [],
      loading: false,
      // runStatusOptions: [
      //   {
      //     key: "下线",
      //     value: 0,
      //   },
      //   {
      //     key: "上线",
      //     value: 1,
      //   },
      //   {
      //     key: '未运行',
      //     value: 2
      //   },
      // ],
      // motifList: [],
      tableData: [],
      doMessage: {},
      selectVal: '',
      selectData: '',
      tableName: ''
    });
    const getData = (row) => {
      proxy.$axios.post(``, {
        // runStatus: searchObj.runStatus,
        current: pageObj.current,
        size: pageObj.size,
        jobName: searchObj.name,
        jobTheme: searchObj.theme,
      }).then(({ data: { data } }) => {
        state.tableData = data.records
        pageObj.total = data.total;
      });
    };
    onMounted(() => {
      getData();
      // getMotif();
    });
    //分页
    const onPageChange = (data) => {
      getData();
    };
    //查询
    const fetchData = () => {
      getData();
    };
    //获取下拉列表主题名
    // const getMotif = () => {
    //   proxy.$axios.get(``).then((res) => {
    //     state.motifList = res.data.data;
    //   });
    // };
    //获取选中值
    const selectChoose = (val,row) => {
      state.valList = val
      if (val.length > 1) {
        proxy.$refs.multipleTable.clearSelection();
        proxy.$refs.multipleTable.toggleRowSelection(val.pop());
      }
    }
    const toggleSelection = (rows) => {
      rows.forEach(row => {
        if (row.jobName === state.tableName) {
        // toggleRowSelection  这个方法是用来选中某一行（打勾）
        // row 是要选中的那一行
        // true 是为选中
          proxy.$refs.multipleTable.toggleRowSelection(row, true)
        }
      })
    }
    const onCancel = () => {
      state.valList = []
      proxy.$refs.multipleTable.clearSelection()
      emit('close')
    }
    const onCommit = () => {
      state.valList.map((row) => {
        emit("giveCode", row.jobName, row, row.jobId);
      })
      emit('close')
    }
    watch([dialogTableVisible, tableName],(newval,oldval) => {
      tableVisible.value = newval[0]
      state.tableName = newval[1]
      proxy.$nextTick(() => {
        toggleSelection(state.tableData)
      })
    })
    return {
      tableVisible,
      pageObj,
      searchObj,
      state,
      getData,
      onPageChange,
      fetchData,
      selectChoose,
      toggleSelection,
      onCancel,
      onCommit,
    };
  },
});
</script>
<style lang="scss" scoped>

</style>
