<template>
  <el-dialog :title="state.title" v-model="state.visible" @closed="close()" :width="width">
    <slot>功能开发中...</slot>
    <template #footer>
      <span class="dialog-footer">
        <el-button v-if="!hideCloseBtn" @click="close()">取 消</el-button>
        <el-button type="primary" v-if="!hideSubmitBtn" @click="onCommit">确 定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
  import { reactive } from 'vue';
  const emit = defineEmits(['commit'])
  const props = defineProps({
    hideSubmitBtn: { // 是否显示确定按钮
      type: Boolean,
      default: false,
    },
    hideCloseBtn: { // 是否显示关闭按钮
      type: Boolean,
      default: false,
    },
    width: { // 弹框的宽度
      type: String,
      default: '500px'
    }
  })
  const state = reactive({
    visible: false, // 是否显示弹框
    title: '', // 弹框的标题
  });
  const open = (title) => {
    state.title = title; // 弹框的标题
    state.visible = true;
  };
  const close = () => {
    state.visible = false;
  };
  const onCommit = () => {
    emit('commit')
  }
  defineExpose({
    close,
    open
  })
</script>

<style lang="scss" scoped>

</style>