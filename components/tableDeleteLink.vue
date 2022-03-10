<template>
  <el-popconfirm icon="el-icon-info" iconColor="red" title="确定要删除吗？" @confirm="onDelete">
    <template #reference>
      <el-link type="danger">删除</el-link>
    </template>
  </el-popconfirm>
</template>

<script>
  export default {
    name: "dataRule",
    emits: ['onDelete'],
    setup(props, { emit }) {
      const onDelete = () => {
        emit('onDelete')
      }
      return {
        onDelete
      }
    },
  }
</script>

<style lang="scss" scoped>

</style>