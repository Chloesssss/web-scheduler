<template>
  <div class="content">
    <div class="app-stencil" ref="stencilContainer"></div>
    <div class="app-content" id="flowContainer" ref="container"></div>
  </div>
  <!-- 执行策略配置 -->
  <config-cell :visible="state.dialogVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.currentCode" :work-name="state.name" @get-collect="getCollect"/>
  <!-- 开发执行策略配置 -->
  <config-flink-cell :visible="state.flinkVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.currentCode" :work-name="state.name" @get-flink="getFlink"/>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from 'vue'
import { Graph, Shape, Addon, FunctionExt } from "@antv/x6";
import ConfigCell from "./ConfigCell.vue";
import ConfigFlinkCell from './ConfigFlinkCell.vue';
import { ElMessageBox } from 'element-plus'
import { ElMessage } from 'element-plus';
const { Stencil } = Addon;
const { Rect, Polygon } = Shape;

export default defineComponent({
  components: { ConfigCell, ConfigFlinkCell },
  name: "filiationGraph",
  props: {
    code: [String, Number],
    projectCode: [String, Number],
    workName: '',
  },
  setup(props, {emit}) {
    const { proxy } = getCurrentInstance();
    const { code, projectCode, workName } = toRefs(props)
    const state = reactive({
      cell: '',
      view: false,
      code: '',
      projectCode: '',
      dialogVisible: false,
      flinkVisible: false,
      name: '',// 工作流作业名
      length: '',// 画布上的节点个数
      codeList: [],// 后端接口返回节点id数组
      taskCode: '',// 后端接口返回节点id字符串
      nodeDtos: [],
      currentCode: '',// 当前节点id
      arrList:[],// 节点id数组（原）
      taskDefinition: [],// 节点配置表单信息
      taskRelation: [],// 节点关系
      setDocId: [],// 配置后的对应节点id数组
      postTaskCode: '',// edge指向的节点id（若节点无节点关系指向，则指向它自己的id，则该节点为末端节点）
      preTaskCode: '',//发出edge的节点id（若节点无输入桩的链接，则该id为0，即该节点为初始节点）
      postTaskVersion: 0,//指向的节点版本（有指向为后置节点版本号，无指向1（指向自己））
      preTaskVersion: 0,//指向自己的节点版本（有前置节点1，无前置节点0）
    })
    let graph = null
    const init= () => {
      const nodeData = {
        // 节点
        nodes: [
        ],
        // 边
        edges: [
        ],
      };
      // 修改的时候回显数据
      if(state.nodeDtos.length) { // 回显节点
        state.nodeDtos.forEach(x => {
          nodeData.nodes.push(generateNewNodeObj(x))
        })
      }
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
        container: document.getElementById('flowContainer'),
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
          snap: true,
          allowBlank: false,
          allowLoop: false,
          highlight: true,
          sourceAnchor: {
            name: 'bottom',
            args: {
              dx: 0,
            },
          },
          targetAnchor: {
            name: 'center',
            args: {
              dx: 0,
            },
          },
          connectionPoint: 'anchor',
          connector: 'algo-edge',
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
          validateConnection({ sourceView, targetView, sourceMagnet, targetMagnet }) {
            // 只能从输出链接桩创建连接
            if (!sourceMagnet || sourceMagnet.getAttribute('port-group') === 'in') {
              return false
            }

            // 只能连接到输入链接桩
            if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'in') {
              return false
            }

            // 判断目标链接桩是否可连接
            const portId = targetMagnet.getAttribute('port')
            const node = targetView.cell
            const port = node.getPort(portId)
            if (port && port.connected) {
              return false
            }
            return true
          },
        },
      });
      Shape.Rect.config({
        width: 120,
        height: 60,
        markup: [
          {
            tagName: "rect",
            selector: "body",
          },
          {
            tagName: "text",
            selector: "label",
          },
        ],
        attrs: {
          body: {
            fill: "#fff",
            stroke: "#000",
            strokeWidth: 2,
          },
          label: {
            fontSize: 14,
            fill: "#333",
            fontFamily: "Arial, helvetica, sans-serif",
            textAnchor: "middle",
            textVerticalAnchor: "middle",
          },
        },
      });
      // graph.isPannable() // 画布是否可以平移
      // graph.enablePanning() // 启用画布平移

      graph.centerContent();

      /******************************** 左侧模型栏 ****************************/
      const stencil = new Stencil({
        title: "数据集成",
        target: graph,
        search: false, // 搜索
        collapsable: true,
        stencilGraphWidth: 250,
        stencilGraphHeight: 400,
        groups: [
          {
            name: "processLibrary",
            title: "dataSource",
          },
        ],
        layoutOptions: {
          columns: 1,
          columnWidth: 130,
          rowHeight: 70,
        },
      });
      proxy.$refs.stencilContainer.appendChild(stencil.container)
      // 初始化图形
      const ports = {
        groups: {
          in: {
            position: 'top',
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: '#108ee9',
                strokeWidth: 2,
                fill: '#fff',
                style: {
                  visibility: "hidden",
                },
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
                fill: '#fff',
                style: {
                  visibility: "hidden",
                },
              }
            }
          }
        },
        items: [
          {
            id: state.currentCode + '_in',
            group: 'in',
          },
          {
            id: state.currentCode + '_out',
            group: 'out',
          },
        ],
      }
      //设计画布左侧节点样式
      const collect = new Rect({
        id: state.currentCode,
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
        ports: { ...ports },
      });
      const flink = new Rect({
        id: state.currentCode,
        attrs: {
          body: {
            fill: "#efdbff",
            stroke: "#9254de",
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
        ports: { ...ports },
      });
      stencil.load(
        [collect, flink],
        "processLibrary"
      );
      graph.toJSON()
      //绑定事件
      // 拖拽
      graph.on('node:added', ({ node }) => {
        console.log(graph.getEdges().length);
        state.length = graph.getNodes().length
        state.arrList.push(node.id)
        getNodeCode(1)
        state.currentCode=node.id
      })
      //回显边
      graph.on('edge:added', ({ edge }) => {
        
      })
      //双击节点打开节点配置
      graph.on("cell:dblclick", ({ node }) => {
        let index = state.arrList.indexOf(node.id)
        state.currentCode=state.taskCode[index]
        if(node.getAttrs().label.text === "数据采集"){
          showModal()
        } else if(node.getAttrs().label.text === "数据开发"){
          showflink()
        }
      });
      // 节点删除操作
      graph.on("node:mouseenter", ({ node }) => {
        // 鼠标 Hover 时添加删除按钮
        node.addTools({
          name: "button-remove",
          args: {
            x: 0,
            y: 0,
            offset: { x: 10, y: 10 },
          },
        });
      });
      graph.on("node:removed", ({ node, options }) => {
        if (!options.ui) {
          return;
        }
        let index = state.arrList.indexOf(node.id)
        if(index > -1){
          state.arrList.splice(index, 1);
          state.taskCode.splice(index,1);
          state.codeList.splice(index,1);
          state.taskDefinition.splice(index,1)
        }	
        state.length = graph.getNodes().length
      });
      graph.on("node:mouseleave", ({ node }) => {
        // 鼠标移开时删除删除按钮
        node.removeTools();
      });
      // 线删除操作
      graph.on("edge:mouseenter", ({ edge }) => {
        // 鼠标 Hover 时添加删除按钮
        edge.addTools([
          "target-arrowhead",
          {
            name: "button-remove",
            args: {
              distance: -30,
            },
          },
        ]);
      });
      graph.on("edge:removed", ({ edge, options }) => {
        if (!options.ui) {
          return;
        }
      });
      graph.on("edge:mouseleave", ({ edge }) => {
        // 鼠标移开时删除删除按钮
        edge.removeTools();
      });
      graph.on("node:contextmenu", ({ cell, view }) => {
        const oldText = cell.attr("text/textWrap/text");
        const elem = view.container.querySelector(".x6-edit-text");
        if (elem == null) {
          return;
        }
        cell.attr("text/style/display", "none");
        if (elem) {
          elem.style.display = "";
          elem.contentEditable = "true";
          elem.innerText = oldText;
          elem.focus();
        }
        const onBlur = () => {
          cell.attr("text/textWrap/text", elem.innerText);
          cell.attr("text/style/display", "");
          elem.style.display = "none";
          elem.contentEditable = "false";
        };
        elem.addEventListener("blur", () => {
          onBlur();
          elem.removeEventListener("blur", onBlur);
        });
      });
      const container = document.getElementById("flowContainer");
      graph.on(
        "node:mouseenter",
        FunctionExt.debounce(() => {
          const ports = container.querySelectorAll(".x6-port-body");
          showPorts(ports, true);
        }),
        500
      );
      graph.on("node:mouseleave", () => {
        const ports = container.querySelectorAll(".x6-port-body");
        showPorts(ports, false);
      });
      graph.bindKey("backspace", () => {
        const cells = graph.getSelectedCells();
        if (cells.length) {
          graph.removeCells(cells);
        }
      });
    }
    //获取采集节点配置信息
    const getCollect = (i) => {
      state.setDocId.push(i.nodeId)
      state.taskDefinition.push({ value: JSON.parse(JSON.stringify(i)) })
    }
    //获取开发节点配置信息
    const getFlink = (j) => {
      state.setDocId.push(j.nodeId)
      state.taskDefinition.push({ value: JSON.parse(JSON.stringify(j)) })
    }
    const showModal = () => {// 节点配置抽屉弹出
      state.dialogVisible = true;
    }
    const showflink = () => {
      state.flinkVisible = true;
    }
    const closeModal = () => {//节点配置抽屉关闭
      state.dialogVisible = false;
      state.flinkVisible = false;
    }
    // 控制连接桩显示/隐藏
    const showPorts = (ports, show) => {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? "visible" : "hidden";
      }
    }
    //节点关系配置
    const setRelation = () => {
      if ( graph.getNodes().length == 1 ) {
        state.preTaskCode = 0
        state.postTaskCode = state.currentCode
        state.postTaskVersion = 1
        state.preTaskVersion = 0
      } else if ( graph.getNodes().length > 1 && graph.getEdges().length == 0 ) {
        state.preTaskCode = 0
        state.postTaskCode = state.currentCode
        state.postTaskVersion = 1
        state.preTaskVersion = 0
      } else {
        let index = state.taskCode.indexOf(state.currentCode)
        state.preTaskCode = state.taskCode[index-1]
        state.postTaskCode = state.taskCode[index]
        state.postTaskVersion = 1
        state.preTaskVersion = 1
      }
      const taskRelation = ({// 节点关系
        id: 0,
        name: '',
        preTaskCode: state.preTaskCode,
        postTaskCode: state.postTaskCode,
        processDefinitionCode: state.code,
        projectCode: state.projectCode,
        postTaskVersion: state.postTaskVersion,
        preTaskVersion: state.preTaskVersion,
      })
      for (let i = 0, len = graph.getNodes().length; i < len; i++ ){
        let index = state.setDocId.indexOf(state.currentCode)
        state.setDocId[index]
        state.taskRelation.push(taskRelation)
      }
      console.log(state.taskRelation);
    }
    //生成节点标识
    const getNodeCode = (flag) => {
      proxy.$axios.get(`/dolphinscheduler/projects/process-definition/gen-task-codes?genNum=1`).then(({data}) => {
        if(data.code === 200) {
          state.codeList.push(data.data)
          state.taskCode = state.codeList.toString().split(",")
          if(flag===1){
            let index = state.arrList.indexOf(state.currentCode)
            state.currentCode=state.taskCode[index]
          }else{
            state.currentCode=""
          }
        } else {
        }
      }).catch(e => {
        ElMessage.error('保存失败请重试！')
      })
    }
    //将流程相关内容转化为JSON
    //保存画布配置
    const save = () => {
      setRelation()
      console.log(state.taskRelation)
      let taskDefinition = state.taskDefinition.map(x => x.value);
      console.log(taskDefinition);
      let index = state.arrList.indexOf(graph.getNodes().map(x => x.id))//根据下标获取节点id
      state.currentCode=state.taskCode[index]
      const locations = graph.getNodes().map(x => ({// 节点位置
        x: x.position().x,
        y: x.position().y,
      }))
      proxy.$axios.put(`/dolphinscheduler/projects/process-definition/${state.code}`, {
        code: state.code,
        name: state.name,
        projectCode: state.projectCode,
        coordinatesList: locations,
        taskCodes: state.taskCode.toString(),
        taskRelation: state.taskRelation,
        taskDefinition: taskDefinition,
        description: '',
        timeout: 0,
        globalParams: '',
      }).then(({data}) => {
        if(data.code === 200) {
          ElMessage.success('保存成功')
        } else {
          ElMessage.error(data.msg)
        }
      }).catch(e => {
        ElMessage.error('保存失败请重试！')
      })
    }
    //监听树节点code获取画布节点位置信息
    watch([code, projectCode, workName],(newval,oldval) => {
      state.code = code
      state.projectCode = projectCode
      state.name = workName
      if(state.projectCode){
        proxy.$axios.get(`/dolphinscheduler/projects/process-definition/taskTree/${state.code}?code=${state.code}&projectCode=${state.projectCode}`)
        .then(({data}) => {
          if(data.code == 200){
            ElMessage.success(data.msg)
            // state.locations = data.data.processPagingQueryVO.locations
          }else{
            // ElMessage.error(data.msg)
          }
        })
      } else {
        //ElMessage.warning('请选择作业树子节点')
      }
    })
    onMounted(() => {
      init()
    })
    return{
      state,
      init,
      setRelation,
      showModal,
      showflink,
      closeModal,
      showPorts,
      save,
      getCollect,
      getFlink,
    }
  },
});
</script>

<style scoped>
.content {
  width: 100vw;
  height: 100vh;
  font-family: sans-serif;
  display: flex;
}
.app-stencil {
  width: 160px;
  border: 1px solid #ffffff;
  position: relative;
}
.app-content {
  flex: 1;
  height: 100%;
  margin-left: 8px;
  margin-right: 8px;
  box-shadow: 0 0 10px 1px #e9e9e9;
}
.x6-graph-scroller {
  border: 1px solid #fffcfc;
  margin-left: -1px;
}
</style>