<template>
  <el-form :inline="true" :model="state.searchObj">
    <template v-for="(searchObj, index) in (searchList && searchList.length > 0 ? searchList : state.tableHeadersTemp.filter(x => x.search))" :key="index">
      <!--输入框格式的搜索-->
      <el-form-item v-if="!searchObj.enumList" :label="searchObj.label">
        <el-input v-model="state.searchObj[searchObj.searchProp || searchObj.prop]" clearable :placeholder="searchObj.searchPlaceHolder ? searchObj.searchPlaceHolder : '请输入' + searchObj.label" maxlength="50" class="mr-10" />
      </el-form-item>
      <!--下拉框的搜索-->
      <el-form-item v-else :label="searchObj.label">
        <el-select v-model="state.searchObj[searchObj.prop]" :placeholder="searchObj.searchPlaceHolder ? searchObj.searchPlaceHolder : '请输入' + searchObj.label">
          <el-option v-for="(item, index) in searchObj.enumList" :key="index + 'select-search'" :label="item.to" :value="item.from" />
        </el-select>
      </el-form-item>
    </template>
    <el-form-item>
      <el-button type="primary" class="c-search-button" @click="fetchData(true)">
        查询
      </el-button>
    </el-form-item>
  </el-form>
  <div class="flex justify-content-between align-items-center mb-5">
    <div>
      <el-button v-if="showAddButton" class="c-add-button" @click="onAdd">
        新增
      </el-button>
      <el-button v-if="showPatchDeleteButton" class="c-delete-button" :disabled="state.tableSelection.length === 0" @click="onDelete()">
        删除
      </el-button>
    </div>
    <div class="flex">
<!--      <el-tooltip v-if="showDownloadBtn" effect="dark" content="下载当前页数据" placement="top">-->
<!--        <i class="el-icon-download green-color mr-10 cursor-pointer" @click="onDownLoadTableData" />-->
<!--      </el-tooltip>-->
      <!--      <el-tooltip effect="dark" content="打印当前页数据" placement="top">-->
      <!--        <i v-print="'#printCommon'" class="el-icon-printer green-color mr-10 cursor-pointer" />-->
      <!--      </el-tooltip>-->
      <el-tooltip v-if="showColumnConfig" effect="dark" content="展示列配置" placement="top">
        <div>
          <el-popover placement="bottom" trigger="click">
            <template #reference>
              <el-icon><tools /></el-icon>
            </template>
            <el-table ref="headerTableRef" :data="state.tableHeadersTemp" class="tableSetting" @selection-change="onHeaderSelectChange" @row-click="onHeaderRowClick">
              <el-table-column type="selection" width="40" />
              <el-table-column label="展示列配置" prop="label" show-overflow-tooltip />
            </el-table>
          </el-popover>
        </div>
      </el-tooltip>
    </div>
  </div>
  <el-table id="printCommon" border :data="state.tableData" stripe @selection-change="handleSelectionChange">
    <el-table-column v-if="showPatchDeleteButton" type="selection" width="40" />
    <template v-for="(header, index) in state.tableHeadersTemp" :key="index">
      <template v-if="!header.hide">
        <el-table-column
          v-if="!header.enumList"
          :prop="header.prop"
          :label="header.label"
          :min-width="header.label.length < 6 ? header.width: header.label.length * 20"
          show-overflow-tooltip
        />
        <el-table-column
          v-else
          v-slot="{ row }"
          :label="header.label"
          :min-width="header.label.length < 6 ? header.width: header.label.length * 20"
          show-overflow-tooltip
        >
          <el-tag :type="generateType(row, header)">
            {{ generateTypeTo(row, header) }}
          </el-tag>
        </el-table-column>
      </template>
    </template>
    <el-table-column label="操作" :width="operateWidth">
      <template #default="{row}">
        <div class="flex align-items-center">
          <el-link v-for="(operate, index) in operationList" :key="index" class="mr-10" :type="operate.type" @click="operateFunc(operate.func, row)">
            {{ operate.name }}
          </el-link>
          <el-link v-if="showEditButton" class="mr-10" type="primary" @click="onEdit(row)">
            编辑
          </el-link>
          <table-delete-link v-if="showDeleteButton" @onDelete="onDelete(row)" />
        </div>
      </template>
    </el-table-column>
  </el-table>
  <!--仅为下载服务，未在界面中显示， 取消了复选框和操作功能， 下载中的表格内容格式和下面的表格一致-->
  <el-table v-show="false" id="exampleCommonTable" border :data="state.tableData" stripe>
    <template v-for="(header, index) in state.tableHeadersTemp" :key="index">
      <template v-if="!header.hide">
        <el-table-column
          v-if="!header.enumList"
          :prop="header.prop"
          :label="header.label"
          :min-width="header.label.length < 6 ? header.width: header.label.length * 20"
          show-overflow-tooltip
        />
        <el-table-column
          v-else
          v-slot="{ row }"
          :label="header.label"
          :min-width="header.label.length < 6 ? header.width: header.label.length * 20"
          show-overflow-tooltip
        >
          <el-tag :type="generateType(row, header)">
            {{ generateTypeTo(row, header) }}
          </el-tag>
        </el-table-column>
      </template>
    </template>
  </el-table>
  <pagination ref="paginationRef" :pages="pageObj" @on-page-change="fetchData()" />
</template>

<script setup>
  import { reactive, getCurrentInstance, onMounted } from "vue";
  import { cloneDeep, isEqual } from "lodash";
  import { Pagination as paginationObj } from '@/../common/constants'
  import { Tools } from "@element-plus/icons-vue"
  // import FileSave from 'file-saver'
  // import XLSX from "xlsx";
  import { ElMessage } from 'element-plus'
  const { proxy } = getCurrentInstance()
  const pageObj = reactive(cloneDeep(paginationObj))
  const emit = defineEmits(['onAdd', 'onDelete'])
  const props = defineProps({
    /**
     * 用法： tableHeaders: [
     //  prop为列表中的绑定字典， label为列表的表头展示名称， search： 是否添加当前字段的搜索（true为添加， false为不添加）， searchPlaceHolder为搜索框的pleaseholder,默认为请输入 + ${label}
     { prop: 'name', label: '名称', hide: false, search: true, searchPlaceHolder: '请输入用户名称'},
     // enumList 枚举列表，其中from中的值为 tabledata中需要转换的原值， to为需要转换后的值, type 为tag的显示的类型，具体的类型参考elementPlus的el-tag
     // searchDefault 为搜索下拉框的默认值， 如果需要在下拉框中设置默认值则需要设置
     { prop: 'type', label: '数据源类型', hide: false, search: true, searchDefault: 'MYSQL', enumList: [{from: '', to: '全部类型', type: 'warning'}, {from: 'MYSQL', to: 'mysql翻译', type: 'warning'}, {from: 'ORACLE', to: 'ORACLE翻译', type: 'info'}, {from: 'CLICKHOUSE', to: 'CLICKHOUSE翻译', type: 'danger'}] },
     { prop: 'dbVersion', label: '版本号', hide: false },
     ],
     * **/
    tableHeaders: { // 列表的表头集合
      type: Array,
      default() {
        return []
      }
    },
    /**
     *用法：
     *operationList: [
     {
        name: '上线', // 操作的显示按钮名称
        type: 'warning', // 操作按钮的样式类型： ‘warning’, ‘success’
        func: (row, callback) => {
          console.log('执行上线操作接口', row)
          setTimeout(() => {
            callback() // 调用回调函数执行刷新列表的操作
          }, 2000)
        }, // 点击操作按钮之后的方法
      },{
        name: '下线', // 操作的显示按钮名称
        type: 'success', // 操作按钮的样式类型： ‘warning’, ‘success’， ‘info’, ''....
        func: (row, callback) => {
          console.log('执行下线操作接口', row)
          setTimeout(() => {
            callback()
          }, 2000)
        }, // 点击操作按钮之后的方法
      },
     ],
     * **/
    operationList: { // 列表的操作集合
      type: Array,
      default() {
        return []
      }
    },
    url: {
      type: String,
      default: ''
    }, //获取数据的URL
    showAddButton: {
      type: Boolean,
      default: true, // 是否显示添加按钮
    },
    showPatchDeleteButton: {
      type: Boolean,
      default: true, // 是否显示批量删除按钮
    },
    showEditButton: {
      type: Boolean,
      default: true, // 是否显示修改按钮
    },
    showDeleteButton: {
      type: Boolean,
      default: true, // 是否显示删除按钮
    },
    operateWidth: {
      type: String,
      default: '180px', // 表格操作框的宽度
    },
    otherSearchParams: { // 其他的查询参数
      type: Object,
      default() {
        return {}
      }
    },
    /** 例如：
     *  const searchList = [{
    label: '指标类型',
    prop: 'type',
    enumList: [{
      to: '全部类型',
      from: ''
    }, {
      to: '直接取值',
      from: '直接取值'
    }, {
      to: '码值映射',
      from: '码值映射'
    }, {
      to: '派生',
      from: '派生'
    }, {
      to: '统计',
      from: '统计'
    }]
     *
     * */
    searchList: { // 查询条件的列表
      type: Array,
      default() {
        return []
      }
    },
    getTableDate: { // 是否返回参数是records格式的
      type: Function,
      default() {
        return () => {
          return []
        }
      }
    },
    exportFileName: { // 导出的文件名称
      type: String,
      default: new Date().getTime().toString()
    },
    notInitData: { // 是否在加载的时候不自动加载数据。 默认是FALSE（加载）
      type: Boolean,
      default: false
    },
    showDownloadBtn: {
      type: Boolean,
      default: false
    },
    showColumnConfig: { // 是否展示配置表格的配置按钮
      type: Boolean,
      default: false,
    }
  })
  const state = reactive({
    searchObj: {},// 搜索条件字段
    showHeaderList: [], // 勾选的需要展示的header的集合
    tableData: [],
    tableHeadersTemp: [], // tableHeaders的备份
    tableSelection: [], // 表格的选择内容
  })
  state.showHeaderList = cloneDeep(props.tableHeaders) // 默认全选
  // state.tableHeadersTemp = cloneDeep(props.tableHeaders)
  // console.log('state.tableHeadersTemp', state.tableHeadersTemp)
  const fetchData = (page) => {
    page && proxy.$refs.paginationRef.resetFirstPage() //当点击查询的时候需要定位到第一页
    const params = cloneDeep(state.searchObj)
    Object.keys(state.searchObj).forEach(x => {
      !params[x] && (delete params[x])
    })
    const handleError = () => {
      state.tableData = [];
      state.tableHeadersTemp = [];
      pageObj.total = 0;
    }
    proxy.$axios.get(props.url, { params: { current: pageObj.current, size: pageObj.size, ...params, ...props.otherSearchParams } }).then(({ data: { data } }) => {
      if(data) {
        state.tableData = (data && data.table && data.table.bodies) ? data.table.bodies : (props.getTableDate(data)) || [];
        if(props.tableHeaders && props.tableHeaders.length) {
          state.tableHeadersTemp = props.tableHeaders
        } else {
          if (!isEqual(data.table.headers.map(x => Object.assign(x, { prop: x.name, label: x.title })).map(x => x.label), state.tableHeadersTemp.map(x => x.label))) { // 防止重复赋值
            data.table && data.table.headers && (state.tableHeadersTemp = data.table.headers.map(x => Object.assign(x, { prop: x.name, label: x.title })))
          }
        }
        pageObj.total = data.total
      } else {
        handleError()
        ElMessage.error('请求失败')
      }
    }).catch(x => {
      handleError()
      ElMessage.error(x.data ? x.data.message : '请求失败')
    })
  }
  const onHeaderRowClick = (row) => { // 当列配置中的行被点击时，将复选框选中
    proxy.$refs.headerTableRef.toggleRowSelection(row, !state.showHeaderList.map(x => x.prop).includes(row.prop))
  }
  const onHeaderSelectChange = (selection) => {
    state.showHeaderList = cloneDeep(selection)
    state.tableHeadersTemp.forEach(x => {
      x.hide = !selection.map(y => y.prop).includes(x.prop) // 实现列表字段的隐藏
    })
  }
  const onAdd = () => {
    emit('onAdd')
  }
  const onDelete = (row) => {
    // 点击删除之后会将需要删除的字段的id以集合的形式返回， 如果是批量删除，则列表里是所有需要删除的字段id
    const deleteParamsId = 'id'
    emit('onDelete', row ? [row[deleteParamsId]] : state.tableSelection.map(x => x[deleteParamsId]))
  }
  const onEdit = (row) => {
    emit('onEdit', row)
  }
  const generateType = (row, header) => {
    const headerObj = header.enumList.find((x) => x.from === row[header.prop])
    return headerObj ? headerObj.type : ''
  }
  const generateTypeTo = (row, header) => {
    const headerObj = header.enumList.find((x) => x.from === row[header.prop])
    return headerObj ? headerObj.to : ''
  }
  const handleSelectionChange = (selection) => {
    state.tableSelection = selection
  }
  const operateFunc = (func, row) => {
    func(row, () => {
      fetchData()
    })
  }
  const onDownLoadTableData = () => {
    // //下载数据至Excel
    // let et = XLSX.utils.table_to_book(document.getElementById("exampleCommonTable")); //此处传入table的DOM节点
    // let etout = XLSX.write(et, {
    //   bookType: "xlsx",
    //   bookSST: true,
    //   type: "array"
    // });
    // try {
    //   FileSave.saveAs(
    //     new Blob([etout], {
    //       type: "application/octet-stream"
    //     }),
    //     `${ props.exportFileName }.xlsx`
    //   ); //导出的文件名
    // } catch (e) {
    //   console.log(e, etout);
    // }
    // return etout;
  }
  onMounted(() => {
    !props.notInitData && fetchData()
    // //  开始加载的时候默认所有字段全部显示
    setTimeout(() => {
      proxy.$refs.headerTableRef && proxy.$refs.headerTableRef.toggleAllSelection();
    }, 1500)
    // 设置搜索下拉框的默认值
    state.tableHeadersTemp.filter(x => x.searchDefault).forEach(y => {
      state.searchObj[y.prop] = y.searchDefault
    })
  })
  defineExpose({
    fetchData
  })
</script>

<style lang="scss" scoped>
  .el-checkbox.is-bordered+.el-checkbox.is-bordered {
    margin-left: 0px !important;
  }
  .c-add-button {
    font-family: "PingFang SC-Medium, PingFang SC";
    color: #4A6CC1;
    border: 1px solid #4A6CC1;
  }
  .c-add-button:hover {
    background-color: #4A6CC1;
    color: white;
  }
  .c-delete-button:hover {
    background-color: #D9555D;
    color: white;
  }
  .c-delete-button {
    font-family: "PingFang SC-Medium, PingFang SC";
    color: #D9555D;
    border: 1px solid #D9555D;
  }
  .c-search-button {
    background: linear-gradient(270deg, #4B6CBC 0%, #1B4ABE 100%);
  }
  .c-search-button:hover {
    background: linear-gradient(270deg, #7285b3 0%, #5072c5 100%);
  }
  .c-delete-button.is-disabled, .c-delete-button.is-disabled:hover {
    background-color: #fab6b6 !important;
    border-color: #fab6b6 !important;
    cursor: not-allowed;
    color: white !important;
  }
  .tableSetting {
    :deep(.el-table__cell) {
      padding: 0 !important;
    }
  }
</style>
