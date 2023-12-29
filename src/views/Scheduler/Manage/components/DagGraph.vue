<template>
  <div class="graph-content" id="containered" ref="containered" />
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from 'vue'
import { Graph, Shape } from '@antv/x6';
import { GridLayout, DagreLayout } from '@antv/layout'
import { JsonData } from '@/constants'
import '@antv/x6-vue-shape'

export default defineComponent({
  components: { JsonData },
  props: {
    code: [String, Number],
    projectCode: [String, Number],
    status: '',
    docName: '',
    total: 0,
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const { code, projectCode, status, docName } = toRefs(props)
    const state = reactive({
      code: '',
      projectCode: '',
      runStatus: '',
      taskType: '',
      label: '',
      status: '',
    })
    let graph = null
    const nodeData = {
      // 节点
      nodes: [
      ],
      // 边
      edges: [
      ],
    };
    const imageShapes = [
      {
        body: {
          fill: "rgba(102, 153, 204, 0.05)",
          stroke: "rgb(102, 153, 204)",
        },
        label: {
          text: state.collectLabel,
          fill: 'rgb(102, 153, 204)',
        },
        image: require('/src/assets/Scheduler/DataCollect.svg'),
      },
      {
        body: {
          fill: "rgba(185, 147, 214, 0.05)",
          stroke: "rgb(185, 147, 214)",
        },
        label: {
          text: state.flinkLabel,
          fill: 'rgb(185, 147, 214)',
          },
        image: require('/src/assets/Scheduler/DataFlink.svg'),
      },
      {
        body: {
          fill: "rgba(154, 184, 122, 0.05)",
          stroke: "rgb(154, 184, 122)",
        },
        label: {
          text: state.controlLabel,
          fill: 'rgb(154, 184, 122)',
          },
        image: require('/src/assets/Scheduler/DataQc.svg'),
      },
      {
        body: {
          fill: "rgba(247, 178, 103, 0.05)",
          stroke: "rgb(247, 178, 103)",
        },
        label: {
          text: state.monitorLabel,
          fill: 'rgb(247, 178, 103)',
          },
        image: require('/src/assets/Scheduler/DataWatch.svg'),
      },
      {
        body: {
          fill: "rgba(219, 127, 142, 0.05)",
          stroke: "rgb(219, 127, 142)",
        },
        label: {
          text: state.standerLabel,
          fill: 'rgb(219, 127, 142)',
          },
        image: require('/src/assets/Scheduler/DataStandred.svg'),
      },
    ]
    const generateImag = () => {
      // 定义边
      Graph.registerConnector(
        'algo-edge',
        (source, target) => {
          const offset = 4
          const control = 80
          const v1 = { x: source.x, y: source.y + offset + control }
          const v2 = { x: target.x, y: target.y - offset - control }

          return `M ${source.x} ${source.y}
                  L ${source.x} ${source.y + offset}
                  C ${v1.x} ${v1.y} ${v2.x} ${v2.y} ${target.x} ${target.y - offset}
                  L ${target.x} ${target.y}`
        },
        true,
      )
      graph = new Graph({ // 新建画布
        container: document.getElementById('containered'),
        grid: true,
        scroller: {
          enabled: true,
          pageVisible: false,
          pageBreak: false,
        },
        snapline: {
          enabled: true,
          sharp: true,
        },
        mousewheel: {
          enabled: true,
          modifiers: ["ctrl", "meta"],
          minScale: 0.5,
          maxScale: 2,
        },
        // 画布调整
        selecting: {
          enabled: true,
          multiple: true,
          rubberband: true,
          movable: true,
          showNodeSelectionBox: true,
        },
        // 连线规则
        connecting: {
          snap: true,  // 当 snap 设置为 true 时连线的过程中距离节点或者连接桩 50px 时会触发自动吸附
          allowBlank: false,  // 是否允许连接到画布空白位置的点，默认为 true
          allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，默认为 true
          allowMulti: false, // 当设置为 false 时，在起始和终止节点之间只允许创建一条边
          highlight: true,  // 拖动边时，是否高亮显示所有可用的连接桩或节点，默认值为 false。
          sourceAnchor: {  // 当连接到节点时，通过 sourceAnchor 来指定源节点的锚点。
            name: 'bottom',
            args: {
              dx: 0,
            },
          },
          targetAnchor: {  // 当连接到节点时，通过 targetAnchor 来指定目标节点的锚点。
            name: 'top',
            args: {
              dx: 0,
            },
          },
          connectionPoint: 'anchor',  // 指定连接点，默认值为 boundary。
          connector: 'algo-edge',  // 连接器将起点、路由返回的点、终点加工为 元素的 d 属性，决定了边渲染到画布后的样式，默认值为 normal。
          createEdge() {
            return graph.createEdge({
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
          },
          validateMagnet({ magnet }) {
            return magnet.getAttribute('port-group') !== 'in'
          },
          validateConnection({
            sourceView,
            targetView,
            sourceMagnet,
            targetMagnet
          }) {
            if (sourceView === targetView) {
              return false;
            }
            if (!sourceMagnet) {
              return false;
            }
            // 只能连接到输入链接桩
            if (
              !targetMagnet ||
              targetMagnet.getAttribute("port-group") !== "in"
            ) {
              return false;
            }
            return true;
          },
          // 当停止拖动边的时候根据 validateEdge 返回值来判断边是否生效，如果返回 false, 该边会被清除。
          validateEdge({ edge }) {
            const { source, target } = edge
            return true
          }
        },
      });
      // graph.isPannable() // 画布是否可以平移
      // graph.enablePanning() // 启用画布平移
      graph.centerContent();
      Graph.registerNode(
        'custom-node',
        {
          inherit: 'rect',
          width: 140,
          height: 76,
          attrs: {
            body: {
              strokeWidth: 1,
              rx: 30,
              ry: 30,
            },
            image: {
              width: 20,
              height: 20,
              x: 12,
              y: 3,
            },
            logo: {
              'xlink:href': 'https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ',
              width: 30,
              height: 30,
              x: 110,
              y: 0,
            },
            text: {
              refX: 40,
              refY: 15,
              fontSize: 15,
              'text-anchor': 'start',
            },
            label: {
              text: 'Please nominate this node',
              id: 0,
              data: {},
              refX: 10,
              refY: 30,
              fontSize: 12,
              fill: 'rgba(0,0,0,0.6)',
              'text-anchor': 'start',
              textWrap: {
                width: -10,      // 宽度减少 10px
                height: '70%',   // 高度为参照元素高度的一半
                ellipsis: true,  // 文本超出显示范围时，自动添加省略号
                breakWord: true, // 是否截断单词
              }
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
              tagName: 'text',
              selector: 'text',
            },
            {
              tagName: 'image',
              selector: 'logo',
            },
            {
              tagName: 'text',
              selector: 'label',
            },
          ],
          data: {},
          relation: {},
        },
        true,
      )
    }
    const registerGraph = () => {
      // proxy.$axios.get(`?code=${state.code}&projectCode=${state.projectCode}`)
      // .then(({ data }) => {
      let workData = JsonData.COMMON_WORK_DATA
      workData.map(item => {
        if (state.code == item.processPagingQueryVO.code && state.projectCode == item.processPagingQueryVO.projectCode) {
          state.code = data.data.processPagingQueryVO.code
          state.projectCode = data.data.processPagingQueryVO.projectCode
          state.name = data.data.processPagingQueryVO.name
          state.params = data.data
          let locations = JSON.parse(data.data.processPagingQueryVO.locations)
          let definition = data.data.taskDefinition
          let relation = data.data.taskRelation
          let label = definition.map(x => x.name)
          let taskType = definition.map(x => x.taskType)
          let msg = definition.map(x => x)
          state.nodeDtos = locations.map(x => ({
            x: Number(x.x),
            y: Number(x.y),
            id: x.taskCode,
            data: definition[locations.indexOf(x)],
            relation: relation[locations.indexOf(x)],
            attrs: {
              body: {
                fill: taskType[locations.indexOf(x)] === "COLLECT" ? "rgba(102, 153, 204, 0.05)" : (taskType[locations.indexOf(x)] === "DMDM" ? 'rgba(219, 127, 142, 0.05)' : (taskType[locations.indexOf(x)] === "DLINK" ? 'rgba(185, 147, 214, 0.05)' : (taskType[locations.indexOf(x)] === "MONITOR" ? 'rgba(247, 178, 103, 0.05)' : 'rgba(154, 184, 122, 0.05)' ) )),
                stroke: locations.indexOf(x) > props.total-1 ? "#A4A9AD" : (locations.indexOf(x) < props.total-1 ? "#9CEC5B" :(props.status == "成功"? "#9CEC5B" : "#D80032")),
                strokeWidth: 1,
              },
              label: {
                id: x.taskCode,
                text: label[locations.indexOf(x)],
                data: msg.filter((item) => x.taskCode === String(item.code))[0]
              },
              text: {
                text: taskType[locations.indexOf(x)] === "COLLECT" ? "数据采集" : (taskType[locations.indexOf(x)] === "DMDM" ? "数据标准" : (taskType[locations.indexOf(x)] === "DLINK" ? "数据开发" : (taskType[locations.indexOf(x)] === "MONITOR" ? "数据质量监控" : "数据质控" ) )),
                fill: taskType[locations.indexOf(x)] === "COLLECT" ? 'rgb(102, 153, 204)' : (taskType[locations.indexOf(x)] === "DMDM" ? 'rgb(219, 127, 142)' : (taskType[locations.indexOf(x)] === "DLINK" ? 'rgb(185, 147, 214)' : (taskType[locations.indexOf(x)] === "MONITOR" ? 'rgb(247, 178, 103)' : 'rgb(154, 184, 122)' ) )),
              },
              // image: {'xlink:href': taskType[locations.indexOf(x)] === "COLLECT" ? imageShapes[0].image : (taskType[locations.indexOf(x)] === "DMDM"? imageShapes[2].image : (taskType[locations.indexOf(x)] === "DLINK"?imageShapes[1].image: imageShapes[3].image)) }
              image: {'xlink:href': taskType[locations.indexOf(x)] === "COLLECT" ? imageShapes[0].image : (taskType[locations.indexOf(x)] === "DLINK"?imageShapes[1].image: (taskType[locations.indexOf(x)] === "DQUALITY"?imageShapes[2].image: (taskType[locations.indexOf(x)] === "MONITOR"?imageShapes[3].image: imageShapes[4].image)))},
              logo: {'xlink:href': locations.indexOf(x) > props.total-1 ? "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*t8fURKfgSOgAAAAAAAAAAAAAARQnAQ" : (locations.indexOf(x) < props.total-1 ? "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ" : (props.status == "成功"? "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*6l60T6h8TTQAAAAAAAAAAAAAARQnAQ" : "https://gw.alipayobjects.com/mdn/rms_43231b/afts/img/A*SEISQ6My-HoAAAAAAAAAAAAAARQnAQ"))}
            },
            shape: 'custom-node',
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
                  id: x.taskCode + '_in',
                  group: 'in',
                },
                {
                  id: x.taskCode + '_out',
                  group: 'out',
                },
              ],
            }
          }))
          let edges = data.data.taskRelation
          for (let index = edges.length-1; index >= 0; index--) {
            const element = edges[index];
            if (edges[index].preTaskCode === 0) {
              edges.splice(element,1)
            }
          }
          state.linkDtos = edges.map(x => ({
            source: { cell: x.preTaskCode, port: x.preTaskCode + '_out' },
            target: { cell: x.postTaskCode, port: x.postTaskCode + '_in' },
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
            shape: 'edge',
          }))
          nodeData.nodes = state.nodeDtos;
          nodeData.edges = state.linkDtos
          graph.fromJSON(nodeData)
          state.workState = data.data.processPagingQueryVO.releaseState
        }else{
          nodeData.nodes = null
          graph.fromJSON([])
          ElMessage.warning('当前画布为空')
        }
      })
      // })
    }
    watch([code, projectCode, status,docName],(newval,oldval) => {//获取
      state.code = newval[0]
      state.projectCode = newval[1]
      state.runStatus = newval[2]
      state.label=newval[3]
      if(state.projectCode){
        registerGraph()
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
      registerGraph,
    }
  }
})
</script>
<style scoped>
.graph-content {
  flex: 1;
  height: 500px;
  margin-left: 8px;
  margin-right: 8px;
  box-shadow: 0 0 10px 1px #e9e9e9;
}
</style>