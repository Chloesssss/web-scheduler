<template>
  <div>
    <main class="flex">
      <doc-tree />
    </main>
    

  </div>
</template>

<script>
import { defineComponent, getCurrentInstance, ref, onMounted, reactive } from "vue";
import DocTree from "../Manage/components/DocTree.vue";


export default defineComponent({
  components: { DocTree },
  name: "WorkManage",
  setup() {
   
   

    
    

    return {
     
    }
  },
});



</script>
<style lang="scss" scoped>

</style>