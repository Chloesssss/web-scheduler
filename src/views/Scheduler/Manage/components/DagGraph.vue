<template>
  <div id="containered" ref="containered" >
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from 'vue'
import { Graph, Shape } from '@antv/x6';
import { GridLayout, DagreLayout } from '@antv/layout'
import '@antv/x6-vue-shape'

export default defineComponent({
  props: {
    code: [String, Number],
    projectCode: [String, Number],
    status: '',
    docName: '',
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const { code, projectCode, status, docName } = toRefs(props)
    const state = reactive({
      code: '',
      projectCode: '',
      runStatus: '',
      nodeData: [],
      taskType: '',
      label: '',
      status: '',
    })
    const generateImag = () => {
      Graph.registerNode( //成功时回显的节点
        'custom-success',
        {
          width: 200,
          height: 60,
          attrs: {
            body: {
              stroke: '#5DA165',
              strokeWidth: 2,
              fill: 'rgba(95,149,255,0.05)',
              fillOpacity: 0.2,
            },
            image: {
              'xlink:href':
                'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ',
              width: 16,
              height: 16,
              x: 12,
              y: 12,
            },
            logo: {
              'xlink:href':
                'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*evDjT5vjkX0AAAAAAAAAAAAAARQnAQ',
              width: 30,
              height: 30,
              x: 120,
              y: 20,
            },
            title: {
              text:state.label,
              refX: 40,
              refY: 14,
              fill: 'rgba(0,0,0,0.85)',
              fontSize: 12,
              'text-anchor': 'start',
            },
            text: {
              text: '状态：'+ props.status,
              refX: 40,
              refY: 38,
              fontSize: 12,
              fill: 'green',
              'text-anchor': 'start',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'body',
            },
            {
              tagName: 'image',
              selector: 'image',
            },
            {
              tagName: 'image',
              selector: 'logo',
            },
            {
              tagName: 'text',
              selector: 'title',
            },
            {
              tagName: 'text',
              selector: 'text',
            },
          ],
        },
        true,
      )
      Graph.registerNode( //失败时回显的节点
        'custom-fail',
        {
          width: 200,
          height: 60,
          attrs: {
            body: {
              stroke: 'red',
              strokeWidth: 2,
              fill: 'rgba(95,149,255,0.05)',
              fillOpacity: 0.2,
            },
            image: {
              'xlink:href':
                'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SEISQ6My-HoAAAAAAAAAAAAAARQnAQ',
              width: 16,
              height: 16,
              x: 12,
              y: 12,
            },
            logo: {
              'xlink:href':
                'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*evDjT5vjkX0AAAAAAAAAAAAAARQnAQ',
              width: 30,
              height: 30,
              x: 120,
              y: 20,
            },
             title: {
              text: state.label,
              refX: 40,
              refY: 14,
              fill: 'rgba(0,0,0,0.85)',
              fontSize: 12,
              'text-anchor': 'start',
            },
            text: {
              text: '状态：'+ props.status,
              refX: 40,
              refY: 38,
              fontSize: 12,
              fill: 'red',
              'text-anchor': 'start',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'body',
            },
            {
              tagName: 'image',
              selector: 'image',
            },
            {
              tagName: 'image',
              selector: 'logo',
            },
            {
              tagName: 'text',
              selector: 'title',
            },
            {
              tagName: 'text',
              selector: 'text',
            },
          ],
        },
        true,
      )
      Graph.registerNode( //运行中回显的节点
        'custom-normal',
        {
          width: 200,
          height: 60,
          attrs: {
            body: {
              stroke: 'blue',
              strokeWidth: 2,
              fill: 'rgba(95,149,255,0.05)',
              fillOpacity: 0.2,
            },
            image: {
              'xlink:href':
                'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*t8fURKfgSOgAAAAAAAAAAAAAARQnAQ',
              width: 16,
              height: 16,
              x: 12,
              y: 12,
            },
            logo: {
              'xlink:href':
                'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*evDjT5vjkX0AAAAAAAAAAAAAARQnAQ',
              width: 30,
              height: 30,
              x: 120,
              y: 20,
            },
             title: {
              text:state.label,
              refX: 40,
              refY: 14,
              fill: 'rgba(0,0,0,0.85)',
              fontSize: 12,
              'text-anchor': 'start',
            },
            text: {
              text: '状态：'+ props.status,
              refX: 40,
              refY: 38,
              fontSize: 12,
              fill: 'blue',
              'text-anchor': 'start',
            },
          },
          markup: [
            {
              tagName: 'rect',
              selector: 'body',
            },
            {
              tagName: 'image',
              selector: 'image',
            },
            {
              tagName: 'image',
              selector: 'logo',
            },
            {
              tagName: 'text',
              selector: 'title',
            },
            {
              tagName: 'text',
              selector: 'text',
            },
          ],
        },
        true,
      )
      const graph = new Graph({
        container: document.getElementById('containered'),
        height: 300,
        background: {
          color: '#fffbe6', // 设置画布背景颜色
        },
        grid: {
          size: 10,      // 网格大小 10px
          visible: true, // 渲染网格背景
        },
        // autoResize: true,
      });
      graph.centerContent()
      if (props.status == "成功") {
        graph.addNode({
          x: -10,
          y: -20,
          shape: 'custom-success',
        })
      } else if (props.status == "失败") {
        graph.addNode({
          x: -10,
          y: -20,
          shape: 'custom-fail',
        })
      } else {
        graph.addNode({
          x: -10,
          y: -20,
          shape: 'custom-normal',
        })
      }

    }
    watch([code, projectCode, status,docName],(newval,oldval) => {//获取
      state.code = newval[0]
      state.projectCode = newval[1]
      state.runStatus = newval[2]
      state.label=newval[3]
      generateImag()
      if(state.projectCode){
        //proxy.$axios.get(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/taskTree/${state.code}?code=${state.code}&projectCode=${state.projectCode}`)
        // .then(({data}) => {
        //   if(data.code == 200){

        //   }else{
        //     // ElMessage.error(data.msg)
        //   }
        // })
      } else {
        //ElMessage.warning('请选择作业树子节点')
      }
    })
    onMounted(() => {
      generateImag()
    })
    return {
      state,
      generateImag,
    }
  }
})

</script>