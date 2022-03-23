<template>
  <div class="app-stencil" ref="stencilContainer"></div>
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
    runStatus: '',
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const { code, projectCode, runStatus } = toRefs(props)
    const state = reactive({
      code: '',
      projectCode: '',
      runStatus: '',
      nodeData: [],
      taskType: '',
    })
    const generateImag = () => {
      const nodeData = {
        // 节点
        nodes: [
          {
            id: 'node1', // String，可选，节点的唯一标识
            x: -160,       // Number，必选，节点位置的 x 值
            y: -180,       // Number，必选，节点位置的 y 值
            width: 80,   // Number，可选，节点大小的 width 值
            height: 40,  // Number，可选，节点大小的 height 值
            label: '我是长方形', // String，节点标签
          },
          {
            shape: 'polygon',
            id: 'node2', // String，节点的唯一标识
            x: -50,      // Number，必选，节点位置的 x 值
            y: -70,      // Number，必选，节点位置的 y 值
            width: 80,   // Number，可选，节点大小的 width 值
            height: 40,  // Number，可选，节点大小的 height 值
            label: '我是菱形', // String，节点标签
            // 使用 points 属性指定多边形的顶点数组
            points: [
              [0, 10],
              [10, 0],
              [20, 10],
              [10, 20],
            ],
            attrs: {
              body: {
                fill: '#efdbff',
                stroke: '#9254de',
              },
            },
          },
        ],
        // 边
        edges: [
          {
            source: 'node1', // String，必须，起始节点 id
            target: 'node2', // String，必须，目标节点 id
          },
        ],
      };
      const collect = new Shape.Rect({
        x: 40+100,
        y: 40,
        width: 160,
        height: 60,
        attrs: {
          body: {
            fill: "#EFF4FF",
            stroke: "#5F95FF",
            color: "#333",
            rx: 50,
            ry: 20,
          },
          label: {
            fontSize: 16,
            fill: "#333",
            fontWeight: 800,
            text: "我是弧形的方",
          },
        },
        text: {
          fontSize: 12,
          fill: "rgba(0,0,0,0.85)",
          textWrap: {
            text: "",
            width: -10,
          },
        },
      })
      const flink = new Shape.Circle({
        x: 280+80,
        y: 200,
        width: 100,
        height: 100,
        attrs: {
          body: {
            fill: "#EFF4FF",
            stroke: "#5F95FF",
            color: "#333",
            rx: 50,
            ry: 20,
          },
          label: {
            fontSize: 16,
            fill: "#333",
            fontWeight: 800,
            text: "我很圆",
          },
        },
        text: {
          fontSize: 12,
          fill: "rgba(0,0,0,0.85)",
          textWrap: {
            text: "",
            width: -10,
          },
        },
      })
      const edge = new Shape.Edge({
        id: 'edge1',
        source: collect,
        target: flink,
        zIndex: 1,
        attrs: {
          line: {
            strokeDasharray: '5 5',
            stroke: '#808080',
            strokeWidth: 1,
            targetMarker: {
              name: 'block',
              args: {
                size: '6',
              },
            },
          },
        },
      })
      const graph = new Graph({
        container: document.getElementById('containered'),
        height: 700,
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
      graph.fromJSON(nodeData)
      graph.addNode(collect)
      graph.addNode(flink)
      graph.addEdge(edge)
      console.log(graph.toJSON() );
      graph.addNode({
        shape: 'image',
        x: 320,
        y: 120,
        width: 94,
        height: 28,
        imageUrl:
        'https://gw.alipayobjects.com/os/s/prod/antv/assets/image/logo-with-text-73b8a.svg',
    })
    }
    const onCancel = () => {
      emit('close', '')
    }
    // watch([code, projectCode, runStatus],(newval,oldval) => {//获取
    //   state.code = code
    //   state.projectCode = projectCode
    //   state.runStatus = runStatus
    //   if(state.projectCode){
    //     proxy.$axios.get(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/taskTree/${state.code}?code=${state.code}&projectCode=${state.projectCode}`)
    //     .then(({data}) => {
    //       if(data.code == 200){
    //         state.taskType = data.data.taskDefinition[0].taskType
    //         state.nodeData = data.data.processPagingQueryVO.locations
    //         console.log(state.nodeData);
    //         console.log(state.taskType);
    //         state.nodeData = data.data.processPagingQueryVO.locations.map(x => ({
    //           x: Number(x.leftPos),
    //           y: Number(x.topPos),
    //           taskId: x.taskId,
    //           name: state.menuObj.find(y => y.taskId === x.taskId).name,
    //         }))
    //       }else{
    //         // ElMessage.error(data.msg)
    //       }
    //     })
    //   } else {
    //     //ElMessage.warning('请选择作业树子节点')
    //   }
    // })
    onMounted(() => {
      generateImag()
    })
    return {
      state,
      onCancel,
    }
  }
})

</script>