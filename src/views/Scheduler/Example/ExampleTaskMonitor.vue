<template>
  <!-- 实例任务 -->
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/exampleTaskMonitor' }">实例监控</el-breadcrumb-item>
    <el-breadcrumb-item>实例任务</el-breadcrumb-item>
  </el-breadcrumb>
  <div>
    <i aria-label="作业名称">{{}}</i>
  </div>
  <div>
    <el-form :inline="true" :model="searchObj">
      <el-form-item label="作业名称">
        <el-input v-model="searchObj.jobName" clearable placeholder="作业名称" maxlength="50" class="mr-10" />
      </el-form-item>
      <el-form-item label="实例名称">
        <el-input v-model="searchObj.logName" clearable placeholder="实例名称" maxlength="50" class="mr-10" />
      </el-form-item>
      <el-form-item label="实例状态">
        <el-select class="mb-10" v-model="searchObj.status" clearable placeholder="请选择">
          <el-option v-for="item in state.statusOptions" :key="item.key" :label="item.key" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="state.workTimeRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          :clearable="false"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchData()">查询</el-button>
        <!-- <el-button @click="reset">重置</el-button> -->
      </el-form-item>
    </el-form>
    <el-table v-loading="state.loading" border class="mt-20" :data="state.tableData" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="taskCode" label="编号" show-overflow-tooltip/>
      <el-table-column prop="name" label="节点名称" show-overflow-tooltip/>
      <el-table-column prop="taskType" label="节点类型" show-overflow-tooltip/>
      <el-table-column prop="state" label="状态" show-overflow-tooltip>
        <template #default="{row}">
          <el-tag
            :type="row.state === '完成' ? '' : 'danger'"
            disable-transitions
          >{{ row.state }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" show-overflow-tooltip/>
      <el-table-column prop="endTime" label="结束时间" show-overflow-tooltip/>
      <el-table-column prop="host" label="host" show-overflow-tooltip/>
      <el-table-column prop="submitTime" label="运行时长" show-overflow-tooltip/>
      <el-table-column prop="maxRetryTimes" label="重试次数" show-overflow-tooltip/>
      <el-table-column label="操作" width="210">
        <template #default="{ row }">
          <el-space wrap :size="10">
            <el-link type="warning" @click="onDetail(row)">查看日志</el-link>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- 表格底部分页显示 -->
  <pagination :pages="pageObj" @on-page-change="onPageChange()"/>
  <el-dialog title="日志详情" v-model="state.dialogVisible" destroy-on-close width="1200px" top="25px">
    <el-scrollbar height="580px">
        <pre style="font-size: 13px;">
            {{state.log}}
        </pre>
    </el-scrollbar>
  </el-dialog>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import { useRouter } from 'vue-router'
import { Pagination } from '@/../common/constants'
import { cloneDeep } from 'lodash'
import { ElMessage } from 'element-plus'
import { Message } from '@/../common/utils/message';
export default defineComponent({
  name: "ExampleManage",
  setup() {
    const { proxy } = getCurrentInstance();
    const pageObj = reactive(cloneDeep(Pagination))
    const router = useRouter()
    const searchObj = reactive({ // 声明查询信息
      runStatus: null,
      name: null,
      motif: null,
    })
    const state = reactive({
      loading: false,
      statusOptions: [
        {
          key: '失败',
          value: 0
        },
        {
          key: '运行',
          value: 1
        },
        {
          key: '完成',
          value: 2
        },
      ],
      fromOptions: [],
      tableData: [],
      projectCode: 464931792847104,
      log: '',
      dialogVisible: false,
    })
    const getData = (page) => {
      page && (pageObj.current = page.current)
      proxy.$axios.post('/dolphinscheduler/projects/task-instances/query-definition-page', { 
        current: page ? page.current : pageObj.current,
        size: pageObj.size,
        projectCode: state.projectCode,
      }).then(({data}) => {
        state.tableData = data.data.totalList
        pageObj.total = data.data.total
      })
    }
    //分页
    const onPageChange = (data) => {
      getData()
    }
    //查询
    const fetchData = () => {
      getData()
    }
    onMounted(() => {
      getData()
    });
    //获取批量选中值
    const handleSelectionChange = (val) => {
      let valList = val,arrList = [];
      valList.map((item) => {
        arrList.push(item.id)
      })
      state.multipleSelection = arrList
    }
    const onDetail = (row) => {
      state.dialogVisible = true
      console.log(row.id)
      proxy.$axios.get(`/dolphinscheduler/log/detail?taskInstanceId=${row.id}`).then((res) =>{
        state.log = res.data.data
      })
    }
    return {
      pageObj,
      searchObj,
      state,
      onPageChange,
      fetchData,
      //reset,
      handleSelectionChange,
      onDetail,
    }
  },
});

</script>
<style lang="scss" scoped>

</style>