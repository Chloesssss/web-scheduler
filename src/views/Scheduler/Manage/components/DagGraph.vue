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
    const generateNewNodeObj = (newNodeObj) => {
      const node = {
        id: newNodeObj.taskId, // String，可选，节点的唯一标识
        x: newNodeObj.leftPos - state.currentDragObj.offsetX,       // Number，必选，节点位置的 x 值
        y: newNodeObj.topPos - state.currentDragObj.offsetY,       // Number，必选，节点位置的 y 值
        width: 160,   // Number，可选，节点大小的 width 值
        height: 30,  // Number，可选，节点大小的 height 值
        label: newNodeObj.name, // String，节点标签
        shape: 'vue-shape', // 使用 rect 渲染    
        ports: {
          groups: {
            in: {
              position: 'top',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#108ee9',
                  strokeWidth: 2,
                  fill: '#fff'
                }
              }
            },
            out: {
              position: 'bottom',
              attrs: {
                circle: {
                  r: 4,
                  magnet: true,
                  stroke: '#31d0c6',
                  strokeWidth: 2,
                  fill: '#fff'
                }
              }
            }
          },
          items: [
            {
              id: newNodeObj.taskId + '_in',
              group: 'in',
            },
            {
              id: newNodeObj.taskId + '_out',
              group: 'out',
            },
          ],
        }
      }
      return node
    }
    const generateImag = () => {
      const nodeData = {
        // 节点
        nodes: [
        ],
        // 边
        edges: [
        ],
      };
      const collect = new Shape.Rect({
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
            text: "数据采集",
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
      const flink = new Shape.Rect({
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
            text: "数据开发",
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
      // 回显实例节点和状态
      // if(state.taskType == "COLLECT"){
      //   graph.addNode(collect)
      // } else if(state.taskType == "DLINK"){
      //   graph.addNode(flink)
      // }
      nodeData.nodes.push(state.nodeData)
      console.log(nodeData);
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
      graph.fromJSON(nodeData)
    }
    const onCancel = () => {
      emit('close', '')
    }
    watch([code, projectCode, runStatus],(newval,oldval) => {//获取
      state.code = code
      state.projectCode = projectCode
      state.runStatus = runStatus
      if(state.projectCode){
        proxy.$axios.get(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/taskTree/${state.code}?code=${state.code}&projectCode=${state.projectCode}`)
        .then(({data}) => {
          if(data.code == 200){
            state.taskType = data.data.taskDefinition[0].taskType
            state.nodeData = data.data.processPagingQueryVO.locations
            console.log(state.nodeData);
            console.log(state.taskType);
            state.nodeData = data.data.processPagingQueryVO.locations.map(x => ({
              x: Number(x.leftPos),
              y: Number(x.topPos),
              taskId: x.taskId,
              name: state.menuObj.find(y => y.taskId === x.taskId).name,
            }))
          }else{
            // ElMessage.error(data.msg)
          }
        })
      } else {
        //ElMessage.warning('请选择作业树子节点')
      }
    })
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