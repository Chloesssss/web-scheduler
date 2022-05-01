<template>
  <el-popconfirm :icon="InfoFilled" icon-color="red" title="确定要删除吗？" @confirm="onDelete">
    <template #reference>
      <el-link type="danger">删除</el-link>
    </template>
  </el-popconfirm>
</template>

<script>
  import { InfoFilled } from '@element-plus/icons-vue'
  export default {
    name: "dataRule",
    emits: ['onDelete'],
    setup(props, { emit }) {
      const onDelete = () => {
        emit('onDelete')
      }
      return {
        onDelete,
        InfoFilled
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>
