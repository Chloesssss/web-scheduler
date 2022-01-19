<template>
  <!-- 作业监控 -->
  <div>
    <el-form :inline="true" ref="searchform" :model="searchObj">
      <el-form-item label="作业状态">
        <el-select filterable clearable v-model="searchObj.runStatus" placeholder="请选择">
          <el-option v-for="item in state.runStatusOptions" :key="item.key" :label="item.key" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="作业名称">
        <el-input v-model="searchObj.name" clearable placeholder="作业名称" maxlength="50" class="mr-10" />
      </el-form-item>
      <el-form-item label="作业主题">
        <el-select filterable clearable v-model="searchObj.motif" placeholder="请选择">
          <el-option v-for="item in state.motif" :key="item.key" :label="item.key" :value="item.value" />
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
          <el-link @click="examRouter(row.id)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column prop="releaseState" label="状态" show-overflow-tooltip>
        <template #default="{row}">
          <el-tag
            :type="row.releaseState === '上线' ? '' : 'danger'"
            disable-transitions
          >{{ row.releaseState }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip/>
      <el-table-column prop="updateTime" label="更新时间" show-overflow-tooltip/>
      <el-table-column prop="description" label="描述" show-overflow-tooltip/>
      <el-table-column label="操作" width="210">
        <template #default="{ row }">
          <el-space wrap :size="10">
            <el-link type="primary" @click.stop.prevent="onEdit(row)">编辑</el-link>
            <el-link :disabled="row.runStatus === 1" type="warning" @click.stop.prevent="onDetail(row)">立即执行</el-link>
            <el-dropdown @command="handleMore($event, row)">
              <span>更多<i class="el-icon-arrow-down el-icon--right"></i></span>
              <template #dropdown>
                <el-dropdown-menu>
                  <template v-if="row.runStatus !== 1">
                    <el-dropdown-item command="onLine">上线</el-dropdown-item>
                  </template>
                  <el-dropdown-item v-else command="onDownLine">下线</el-dropdown-item>
                  <el-dropdown-item command="onDelete(row.id)">删除</el-dropdown-item>
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
import { useRouter } from 'vue-router'
import { Pagination } from '@/../common/constants'
import { cloneDeep } from 'lodash'
import { ElMessage } from 'element-plus'
import { Message } from '@/../common/utils/message'
export default defineComponent({
  name: "workMonitor",
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
      motif: [
        {
          key: '下线',
          value: 0
        },
        {
          key: '上线',
          value: 1
        },
      ],
      tableData: [],
      projectCode: 464931792847104,
    })
    const getData = () => {
      proxy.$axios.post(`/dolphinscheduler/projects/process-definition/query-definition-page`,{
        ...searchObj,
        current: pageObj.current,
        size: pageObj.size,
        projectCode: state.projectCode
      })
      .then((res) => {
        let resq = res.data
        state.tableData = resq.totalList
        console.log(resq.totalList)
        if(resq.code == 200){
          state.tableData = resq.data.totalList
        }else{
          ElMessage.error(resq.msg)
        }
      });
    }
    onMounted(() => {
      getData()
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
    //获取批量选中值
    const handleSelectionChange = (val) => {
      let valList = val,arrList = [];
      valList.map((item) => {
        arrList.push(item.id)
      })
      state.multipleSelection = arrList
    }
    //实例监控
    const examRouter = (val) =>{
      router.push({path: 'exampleMonitor',query:{id:val}})
    }
    return {
      pageObj,
      searchObj,
      state,
      getData,
      onPageChange,
      fetchData,
      //reset,
      handleSelectionChange,
      examRouter,
    }
  },
});



</script>
<style lang="scss" scoped>

</style>