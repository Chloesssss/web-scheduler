<template>
  <el-pagination
    class="text-align-right mt-10"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    v-model:current-page="pages.current"
    :page-sizes="[15, 30, 40, 50]"
    :page-size="pages.size"
    :layout="layout ? layout : 'total, sizes, prev, pager, next, jumper'"
    :total="pages.total"
  >
  </el-pagination>
</template>

<script>
import {defineComponent, reactive, toRefs} from 'vue';
export default defineComponent({
  props: {
    layout: String,
    pages: {
      type: Object,
      default() {
        return {
          current: 1, // 当前页
          size: 15, // 每页条数
          total: 0, // 总数
        }
      }
    }
  },
  setup(props, { emit }) {
    const propsConst = reactive(props.pages)
    const handleSizeChange = (size) => {
      propsConst.size = size
      emit('onPageChange', {...propsConst})
    }
    const handleCurrentChange = (current) => {
      propsConst.current = current
      emit('onPageChange', {...propsConst})
    }
    const resetFirstPage = () => {
      propsConst.current = 1
    }
    return {
      handleSizeChange,
      handleCurrentChange,
      resetFirstPage
    }
  },
  })
</script>

<style lang="scss" scoped>

</style>
