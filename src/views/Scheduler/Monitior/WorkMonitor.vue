<template>
  <!-- 作业监控 -->
  <div>
    <el-form :inline="true" ref="searchform" :model="searchObj">
      <el-form-item label="作业状态" prop="runStatus">
        <el-select filterable clearable v-model="searchObj.runStatus" placeholder="请选择">
          <el-option v-for="item in state.runStatusOptions" :key="item.key" :label="item.key" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="作业名称" prop="name">
        <el-input v-model="searchObj.name" clearable placeholder="作业名称" maxlength="50" class="mr-10" />
      </el-form-item>
      <el-form-item label="作业主题" prop="motif">
        <el-select filterable clearable v-model="searchObj.motif" placeholder="请选择">
          <el-option v-for="item in state.motifList" :key="item.key" :label="item.label" :value="item.label" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="fetchData()">查询</el-button>
        <!-- <el-button @click="reset">重置</el-button> -->
      </el-form-item>
    </el-form>
    <el-table v-loading="state.loading" border class="mt-20" :data="state.tableData" stripe @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="code" label="编号" show-overflow-tooltip/>
      <el-table-column prop="name" label="作业名称" show-overflow-tooltip>
        <template #default="{row}">
          <el-link @click="examRouter(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="releaseStateCN" label="状态" show-overflow-tooltip>
        <template #default="{row}">
          <el-tag
            :type="row.releaseStateCN === '上线' ? '' : 'danger'"
            disable-transitions
          >{{ row.releaseStateCN }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip/>
      <el-table-column prop="updateTime" label="更新时间" show-overflow-tooltip/>
      <el-table-column prop="description" label="描述" show-overflow-tooltip/>
      <el-table-column label="操作" width="210">
        <template #default="{ row }">
          <el-space wrap :size="10">
            <el-link type="primary" @click="onEdit(row)">编辑</el-link>
            <el-link :disabled="row.runStatus === 1" type="warning" @click="onDoWork()">立即执行</el-link>
            <el-dropdown @command="handleMore($event, row)">
              <span>更多<i class="el-icon-arrow-down el-icon--right"></i></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <template v-if="row.runStatus !== 1">
                    <el-dropdown-item command="onLine">上线</el-dropdown-item>
                  </template>
                  <el-dropdown-item v-else command="onDownLine">下线</el-dropdown-item>
                  <el-dropdown-item command="onDelete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- 表格底部分页显示 -->
  <pagination :pages="pageObj" @on-page-change="onPageChange()" />
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import { useRoute, useRouter } from 'vue-router'
import { Pagination } from '@/../common/constants'
import { cloneDeep } from 'lodash'
import { ElMessage } from 'element-plus'
import { Message } from '@/../common/utils/message'
import { DeleteConfirm } from '@/../common/utils/index.js';

export default defineComponent({
  name: "workMonitor",
  setup() {
    const { proxy } = getCurrentInstance();
    const pageObj = reactive(cloneDeep(Pagination))
    const router = useRouter()
    const route = useRoute()
    const searchObj = reactive({ // 声明查询信息
      runStatus: '',
      name: '',
      motif: '',
    })
    const state = reactive({
      loading: false,
      runStatusOptions: [
        {
          key: '下线',
          value: 0
        },
        {
          key: '上线',
          value: 1
        },
      ],
      motifList: [],
      id: '',
      tableData: [],
      projectCode: '',
      code: '',
      doMessage: {},
    })
    const getData = (row) => {
      searchObj.name = proxy.$route.query.name
      if(proxy.$route.query.name){

      }
      searchObj.motif = proxy.$route.query.motif
      //通过路由传参
      state.projectCode = proxy.$route.query.projectCode
      state.code = proxy.$route.query.code
      proxy.$axios.post(`/dolphinscheduler/projects/process-definition/query-definition-page`,{
        searchVal: searchObj.name,
        projectName: searchObj.motif,
        releaseState: searchObj.runStatus,
        current: pageObj.current,
        size: pageObj.size,
        projectCode: state.projectCode,
        code: state.code,
      })
      .then((res) => {
        let resq = res.data
        state.tableData = resq.totalList
        if(resq.code == 200){
          state.tableData = resq.data.totalList
          pageObj.total = resq.data.total
        }else{
          ElMessage.error(resq.msg)
        }
      });
    }
    onMounted(() => {
      getData()
      getMotif()
    });
    //分页
    const onPageChange = (data) => {
      getData()
    }
    //查询
    const fetchData = () => {
      getData()
    }
    //重置搜索表单
    // const reset = (searchform) => {
    //   proxy.$refs[searchform].resetFields()
    // }
    //编辑
    const onEdit = (row) => {
      proxy.$axios.put(`/dolphinscheduler/projects/process-definition/${row.code}`, {
        code: row.code,
        locations: null,
        name: row.name,
        projectCode: state.projectCode
      })
      router.push({path: 'workManage', query: {projectCode: row.projectCode, code: row.code, releaseState: row.releaseStateCN, name: row.name }})
    }
    const handleMore = (command, row) => {
      switch (command) {
        case 'onLine':
          onLine(row)
        break;
        case 'onDownLine' :
          onLine(row)
        break;
        case 'onDelete' :
        DeleteConfirm().then(() => {
          proxy.$axios.delete(`/dolphinscheduler/projects/process-definition/delete?code=${row.code}&projectCode=${row.projectCode}`,
          ).then((data) => {
            if(data.code = 200){
              ElMessage.success("删除成功")
              fetchData()
            }else {
              ElMessage.error(data.data.msg)
            }
          }).catch(e => {
            ElMessage.error('请求失败！请重试！')
            fetchData()
          })
          
        })
        break;
      }
    }
    //上下线
    const onLine = (row) => {
      let releaState = row.releaseStateCN === '下线' ? 'OFFLINE' : 'ONLINE'
      proxy.$axios.post(`/dolphinscheduler/projects/process-definition/release/${row.code}`,{
        code: row.code,
        projectCode: row.projectCode,
        releaseState: releaState,
      })
      .then((res) => {
        let resq = res.data
        if(resq.code == 200){
          ElMessage.success('操作成功')
          getData()
        }else if(resq.code == 400){
          ElMessageBox.alert(resq.msg, '提示', {
            confirmButtonText: '确定',
            type: 'warning'
          })
          .catch(() => {})
        }else{
          ElMessage.error(resq.msg)
        }
      });
    }
    //立即执行
    const onDoWork = () => {
       proxy.$axios.post('/dolphinscheduler/projects/executors/start-process-instance', {
        projectCode: state.projectCode,
      }).then(({data}) => {
        ElMessage[data.code === 0 ? 'success': 'error'](data.msg)
      })
    }
    //获取下拉列表主题名
    const getMotif = () => {
      proxy.$axios.get("/dolphinscheduler/projects/view-tree").then((res) => {
          state.motifList = res.data.data
        })
    }
    //获取批量选中值
    const handleSelectionChange = (val) => {
      let valList = val,arrList = [];
      valList.map((item) => {
        arrList.push(item.id)
      })
      state.multipleSelection = arrList
    }
    //下穿到实例监控
    const examRouter = (row) =>{
      if(route.query.code&&route.query.project){
        state.projectCode = proxy.$route.query.projectCode
        state.code = proxy.$route.query.code
      }else{
        state.projectCode = row.projectCode
        state.code = row.code
      }
      router.push({path: 'exampleMonitor',query: { id: state.id, projectCode: state.projectCode, code: state.code,workName: row.name }})
    }
    return {
      pageObj,
      searchObj,
      state,
      getData,
      onPageChange,
      fetchData,
      //reset,
      onDoWork,
      onEdit,
      handleMore,
      handleSelectionChange,
      examRouter,
    }
  },
});



</script>
<style lang="scss" scoped>

</style>