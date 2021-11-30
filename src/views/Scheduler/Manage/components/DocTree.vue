<template>
  <div class="pr-10" style="border-right: 1px solid rgb(220, 223, 230);">
    <div style="width:280px;">
      <div>
        <i class="el-icon-circle-plus-outline"></i>
        <i class="el-icon-s-fold"></i>
      </div>
      <el-input v-model="searchInput" placeholder="请输入">
        <template #suffix>
          <el-icon class="el-icon-search"></el-icon>
        </template>
      </el-input>
      

    </div>
  </div>
  
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive, toRefs } from "vue";


export default defineComponent({
  name: "DocTree",
  setup() {
    const state = reactive({
      searchInput:''
    })
   

    
    

    return {
      ...toRefs(state)
    }
  },
});



</script>
<style lang="scss" scoped>

</style>