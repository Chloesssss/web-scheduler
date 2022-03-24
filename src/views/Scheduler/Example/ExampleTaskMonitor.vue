<template>
  <!-- 实例任务 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/exampleTaskMonitor' }">实例监控</el-breadcrumb-item>
    <el-breadcrumb-item>实例任务</el-breadcrumb-item>
  </el-breadcrumb>
  <el-main>
    <div style="width:90%" >
      <div style="width=100%;height:25%">作业名称：{{ state.workName }}</div>
        <el-descriptions :column="2" style="margin-top:15px">
          <el-descriptions-item label="实例名称：">{{ state.name }}</el-descriptions-item>
          <el-descriptions-item label="运行状态：">{{ state.runState === 'SUCCESS' ? '成功' : (state.runState === 'FAILURE' ? '失败' : '运行中') }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div style="width:100% ">
        <dag-graph :code="state.deCode" :projectCode="state.projectCode" :runStatus="state.runState"/>
      </div>
    <div>
      <el-table v-loading="state.loading" border class="mt-20" :data="state.tableData" stripe >
        <el-table-column prop="taskCode" label="编号" show-overflow-tooltip/>
        <el-table-column prop="name" label="节点名称" show-overflow-tooltip/>
        <el-table-column prop="taskType" label="节点类型" show-overflow-tooltip/>
        <el-table-column prop="state" label="状态" show-overflow-tooltip>
          <template #default="{row}">
            <el-tag
              :type="row.state === 'SUCCESS' && 'SUBMITTED_SUCCESS' ? 'success' : (row.state === 'FAILURE' && 'KILL' ? 'danger' : '' )"
              disable-transitions
            >{{ row.stateCN }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" show-overflow-tooltip/>
        <el-table-column prop="endTime" label="结束时间" show-overflow-tooltip/>
        <el-table-column prop="host" label="host" show-overflow-tooltip/>
        <!-- <el-table-column prop="retryInterval" label="运行时长" show-overflow-tooltip/>
        <el-table-column prop="maxRetryTimes" label="重试次数" show-overflow-tooltip/> -->
        <el-table-column label="操作" width="210">
          <template #default="{ row }">
            <el-space wrap :size="10">
              <el-link type="warning" @click="onDetail(row)">查看日志</el-link>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-main>
  <!-- 表格底部分页显示 -->
  <pagination :pages="pageObj" @on-page-change="onPageChange()"/>
  <el-dialog title="日志详情" v-model="state.dialogVisible" destroy-on-close width="960px" top="25px">
    <el-scrollbar height="480px">
        <pre style="font-size: 13px;">
            {{state.log}}
        </pre>
    </el-scrollbar>
  </el-dialog>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import { useRoute } from 'vue-router'
import { Pagination } from '@/../common/constants'
import { cloneDeep } from 'lodash'
import { ElMessage } from 'element-plus'
import { Message } from '@/../common/utils/message';
import DagGraph from "../Manage/components/DagGraph.vue";
export default defineComponent({
  components: { DagGraph },
  name: "ExampleManage",
  setup() {
    const { proxy } = getCurrentInstance();
    const pageObj = reactive(cloneDeep(Pagination))
    const route = useRoute()
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
      workName: '',
      name: '',
      runState: '',
      fromOptions: [],
      tableData: [],
      projectCode: '',
      code: '',
      log: '',
      dialogVisible: false,
      deCode: '',// 工作流定义id
    })
    //获取节点数据
    const getData = (page) => {
      page && (pageObj.current = page.current)
      proxy.$axios.post('/dolphinscheduler-api/dolphinscheduler/projects/task-instances/query-definition-page', {
        current: page ? page.current : pageObj.current,
        size: pageObj.size,
        projectCode: state.projectCode,
        processInstanceId: state.code,
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
      state.workName = proxy.$route.query.workName
      state.name = proxy.$route.query.processInstanceName
      state.runState = proxy.$route.query.state
      state.projectCode = proxy.$route.query.projectCode
      state.code = proxy.$route.query.id
      state.deCode = proxy.$route.query.code
      getData()
    });
    const onDetail = (row) => {
      state.dialogVisible = true
      proxy.$axios.get(`/dolphinscheduler-api/dolphinscheduler/log/task-log?taskInstanceId=${row.id}`).then((res) =>{
        state.log = res.data.data
      })
    }
    return {
      pageObj,
      searchObj,
      state,
      onPageChange,
      fetchData,
      onDetail,
    }
  },
});

</script>
<style lang="scss" scoped>

</style>