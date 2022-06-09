<template>
  <div class="content">
    <div class="app-stencil" ref="stencilContainer"></div>
    <div class="app-content" id="flowContainer" ref="container"></div>
  </div>
  <!-- 执行策略配置 -->
  <config-cell ref="dialogCollect" :visible="state.dialogVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-collect="getCollect" :definition="state.currentDefinition" :id="state.dataId"/>
  <!-- 开发执行策略配置 -->
  <config-flink-cell ref="dialogFlink" :visible="state.flinkVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-flink="getFlink" :definition="state.currentDefinition" :id="state.dataId"/>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from 'vue'
import { Graph, Shape, Addon, FunctionExt } from "@antv/x6";
import ConfigCell from "./ConfigCell.vue";
import ConfigFlinkCell from './ConfigFlinkCell.vue';
import { ElMessageBox } from 'element-plus'
import { ElMessage } from 'element-plus';
import { BorderedImage } from '@antv/x6/lib/shape/standard';
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
  emits: ['giveState'],
  setup(props, {emit}) {
    const { proxy } = getCurrentInstance();
    const { code, projectCode, workName } = toRefs(props)
    const state = reactive({
      dataId: '', // 判断节点配置是否为编辑状态
      cell: '',
      view: false,
      code: '',
      projectCode: '',
      dialogVisible: false,
      flinkVisible: false,
      name: '',// 工作流作业名
      codeList: [],// 后端接口返回节点id数组
      taskCode: '',// 后端接口返回节点id字符串
      nodeDtos: [], //回显的节点数据
      linkDtos: [], //回显的边数据
      currentCode: '',// 当前节点id
      nodeId: '',// 当前节点id(传入表单)
      arrList:[],// 节点id数组（原）
      taskDefinition: [],// 节点配置表单信息
      taskRelation: [],// 节点关系
      setDocId: [],// 配置后的对应节点id数组
      postTaskCode: '',// 总是指向自己的节点id，用于匹配次级节点的pretaskcode
      preTaskCode: 0,//发出edge的节点id（若节点无输入桩的链接，则该id为0，即该节点为初始节点）
      postTaskVersion: 1,//指向的节点版本（指向1（指向自己））
      preTaskVersion: 1,//父节点为0，子节点为1
      workState: '',
      collectLabel: '数据采集',
      flinkLabel: '数据开发',
      params: {},
      //监听获取的数据存储
      watchCode: null,
      watchDefinition: [],
      label: '', // 节点名
      currentDefinition: {
        name: '',
        description: '',
        timeoutFlag: "",
        taskWork: '',
        originTable: '',
        targetTable: '',
        taskParams: '',
        taskType: "",
        projectCode: '',
        code: '',
        callTaskId: '',
        nodeId: '',
      },//当前节点的配置表单数据
    })
    let graph = null
    const eachNodeData = {}
    const nodeData = {
      // 节点
      nodes: [
      ],
      // 边
      edges: [
      ],
    };
    const init= () => {
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
            text: state.collectLabel,
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
        data: {},
        relation: {},
        ports: { ...ports },
      });
      const flink = new Rect({
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
            text: state.flinkLabel,
          },
        },
        data: {},
        relation: {},
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
        state.arrList.push(node.id)
        state.currentCode = node.id
        getNodeCode(1)
      })
      //双击节点打开节点配置
      graph.on("cell:dblclick", ({ node, cell }) => {
        let index = state.arrList.indexOf(node.id)
        state.currentCode = state.taskCode[index]
        console.log(state.taskCode);
        console.log(node.id);
        console.log(state.arrList);
        if (node.data.id) {
          state.currentCode = node.id
          state.dataId = node.data.id
          state.currentDefinition = node.data
          console.log(5555);
        } else {
          let index = state.arrList.indexOf(node.id)
          state.currentCode = state.taskCode[index]
          console.log(state.currentCode);
          state.dataId = null
          let obj =null
          obj =  state.taskDefinition.find((item)=>{
            return item.value.code== state.currentCode            
          })
          state.currentDefinition=obj?obj.value:null;
        }
        console.log(node.data);
        if (!state.projectCode) {
          if(node.getAttrs().label.text === "数据采集"){
            console.log("open");
            state.nodeId = state.currentCode ? state.currentCode : node.id
            state.dialogVisible = true;
          } else if(node.getAttrs().label.text === "数据开发"){
            state.nodeId = state.currentCode ? state.currentCode : node.id
            state.flinkVisible = true;
          }
        }else{
          if(node.data.taskType === "COLLECT"){
            console.log("open");
            state.nodeId = state.currentCode ? state.currentCode : node.id
            state.dialogVisible = true;
          } else if(node.data.taskType === "DLINK"){
            state.nodeId = state.currentCode ? state.currentCode : node.id
            state.flinkVisible = true;
          }
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
        let x = state.arrList.indexOf(node.id)
        state.currentCode = state.taskCode[x]
        if (!options.ui) {
          return;
        }
        let i = state.watchCode.indexOf(node.id)
        if (i > -1) {
          state.watchCode.splice(i,1)
          state.watchDefinition.splice(i,1)
        }
        let m = state.setDocId.indexOf(state.currentCode)
        let arr = state.taskDefinition.map(x => x.value.nodeId)
        console.log(arr);
        let a = arr.indexOf(state.currentCode)
        if (m > -1) {
          state.taskDefinition.splice(m,1)
        } else if(a >-1 ){
          state.taskDefinition.splice(a,1)
        }
        let index = state.arrList.indexOf(node.id)
        if(index > -1){
          state.arrList.splice(index, 1);
          state.codeList.splice(index,1);
          state.taskCode.splice(index,1);
        }	
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
        const cellId = edge.getTargetCellId()
        const target = graph.getCellById(cellId)
        target && target.setPortProp(target.id+ '_in', 'connected', false)
      });
      graph.on("edge:mouseleave", ({ edge }) => {
        // 鼠标移开时删除删除按钮
        edge.removeTools();
      });
      graph.on('node:change:data', ({node}) => {
        node.data = eachNodeData
      })
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
      state.collectLabel = i.name
      state.setDocId.push(i.nodeId)
      let arr = state.taskDefinition.map(x => x.value.nodeId)
      let index = arr.indexOf(i.nodeId)
      if (index > -1) {
        state.taskDefinition.splice(index,1)
      }
      let brr = state.watchDefinition.map(x => x.code.toString())
      let x = brr.indexOf(i.nodeId)
      if (x > -1) {
        state.watchDefinition.splice(x,1)
      }
      // let obj = []
      // console.log(state.taskDefinition.map(x => x.value.nodeId));
      // obj = state.taskDefinition.find((item)=>{
      //   console.log(item.value.nodeId);
      //   console.log(i.nodeId.toString());
      //   return item.value.nodeId == i.nodeId.toString()           
      // })
      // console.log(obj);
      // state.currentDefinition = obj
      state.taskDefinition.push({ value: JSON.parse(JSON.stringify(i)) })
    }
    //获取开发节点配置信息
    const getFlink = (j) => {
      state.flinkLabel = j.name
      state.setDocId.push(j.nodeId)
      let arr = state.taskDefinition.map(x => x.value.nodeId)
      let index = arr.indexOf(j.nodeId)
      if (index > -1) {
        state.taskDefinition.splice(index,1)
      }
      let brr = state.watchDefinition.map(x => x.code.toString())
      let x = brr.indexOf(j.nodeId)
      if (x > -1) {
        state.watchDefinition.splice(x,1)
      }
      state.taskDefinition.push({ value: JSON.parse(JSON.stringify(j)) })
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
      const taskRelation = graph.getEdges().map(y => ({
        id: 0,
        name: '',
        preTaskCode: state.taskCode[state.arrList.indexOf(y.getSource().cell)] ? state.taskCode[state.arrList.indexOf(y.getSource().cell)] : y.getSource().cell,
        postTaskCode: state.taskCode[state.arrList.indexOf(y.getTarget().cell)] ? state.taskCode[state.arrList.indexOf(y.getTarget().cell)] : y.getTarget().cell,
        processDefinitionCode: state.code,
        projectCode: state.projectCode,
        postTaskVersion: state.postTaskVersion,
        preTaskVersion: state.preTaskVersion,
      }))
      const allCollectTaskId = []
      taskRelation.forEach(x => {
        allCollectTaskId.push(x.id)
        allCollectTaskId.push(x.name)
        allCollectTaskId.push(x.preTaskCode)
        allCollectTaskId.push(x.postTaskCode)
        allCollectTaskId.push(x.processDefinitionCode)
        allCollectTaskId.push(x.projectCode)
        allCollectTaskId.push(x.postTaskVersion)
        allCollectTaskId.push(x.preTaskVersion)
      })
      let childNodes =[]
      childNodes = taskRelation.map(y => y.postTaskCode.toString())
      let taskCodes = ''
      taskCodes = !state.taskCode ? state.watchCode : (!state.watchCode ? state.taskCode : state.watchCode.concat(state.taskCode))
      let parentShip = [];
      for (var i = 0; i < taskCodes.length; i++) {
        if (childNodes.indexOf(taskCodes[i]) === -1) {
          parentShip.push(taskCodes[i])
        }
      }
      const sourceNodeship = parentShip.map(x =>({
        id:0,
        name: '',
        preTaskCode: '0',
        postTaskCode: x,
        processDefinitionCode: state.code,
        projectCode: state.projectCode,
        preTaskVersion: '0',
        postTaskVersion: state.postTaskVersion,
      }))
      state.taskRelation = sourceNodeship.concat(taskRelation)
    }
    //生成节点标识
    const getNodeCode = (flag) => {
      proxy.$axios.get(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/gen-task-codes`).then(({data}) => {
        state.codeList.push(data.data)
        state.taskCode = state.codeList.toString().split(",")
        if(flag===1){
          let index = state.arrList.indexOf(state.currentCode)
          state.currentCode = state.taskCode[index]
        }else{
          state.currentCode = ""
        }
      })
    }
    //将流程相关内容转化为JSON
    //保存画布配置
    const save = () => {
      setRelation()
      let taskDefinition = state.taskDefinition.map(x => x.value);
      const locations = graph.getNodes().map(x => ({// 节点位置
        x: x.position().x,
        y: x.position().y,
      }))
      let codeList = ''
      codeList = !state.taskCode ? state.watchCode : (!state.watchCode ? state.taskCode : state.watchCode.concat(state.taskCode))
      let taskDefinitionList = []
      if (nodeData.nodes) {
        taskDefinitionList = taskDefinition.concat(state.watchDefinition)
      }else{
        taskDefinitionList = taskDefinition
      }
      console.log(locations,codeList.toString(),state.taskRelation,taskDefinitionList);
      if(!graph.getNodes().length) {
        ElMessage.warning('请输入依赖项')
      }else if (taskDefinitionList.length != codeList.length) {
        ElMessage.warning('请配置节点信息')
      }else{
        console.log(locations,codeList.toString(),state.taskRelation,taskDefinitionList);
        proxy.$axios.put(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/${state.code}`, {
          code: state.code,
          name: state.name,
          projectCode: state.projectCode,
          coordinatesList: locations,
          taskCodes: codeList.toString(),
          taskRelation: state.taskRelation,
          taskDefinition: taskDefinitionList,
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
    }
    //监听树节点code获取画布节点位置信息
    watch([code, projectCode, workName],(newval,oldval) => {
      state.code = newval[0]
      state.projectCode = newval[1]
      state.name = newval[2]
      let mm = ''
      if (newval[0]!=oldval[0]) {
        state.taskDefinition = []
        state.watchDefinition = []
        state.arrList = []
        state.codeList = []
        state.taskCode = mm
        state.watchCode = null
      }
      if(state.projectCode){
        proxy.$axios.get(`/dolphinscheduler-api/dolphinscheduler/projects/process-definition/taskTree/${state.code}?code=${state.code}&projectCode=${state.projectCode}`)
        .then(({data}) => {
          if(data.code == 200 && data.data.taskDefinition != null){
            state.params = data.data
            let locations = JSON.parse(data.data.processPagingQueryVO.locations)
            let definition = data.data.taskDefinition
            let relation = data.data.taskRelation
            let label = definition.map(x => x.name)
            console.log(label);
            let taskType = definition.map(x => x.taskType)
            let code = definition.map(x => x.code)
            let taskCode = locations.map(x => x.taskCode)
            state.nodeDtos = locations.map(x => ({
              x: Number(x.x),
              y: Number(x.y),
              id: x.taskCode,
              width: 120,
              height: 60,
              data: definition[locations.indexOf(x)],
              relation: relation[locations.indexOf(x)],
              attrs: {
                body: {
                  fill: taskType[locations.indexOf(x)] === "COLLECT" ? "#EFF4FF": "#efdbff",
                  stroke: taskType[locations.indexOf(x)] === "COLLECT" ? "#5F95FF" : "#9254de",
                  color: "#333",
                  rx: 50,
                  ry: 20,
                },
                label: {
                  fontSize: 16,
                  fill: "#333",
                  fontWeight: 800,
                  text: label[locations.indexOf(x)],
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
              shape: 'rect',
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
              source: {cell: x.preTaskCode, port: x.preTaskCode + '_out'},
              target: {cell: x.postTaskCode, port: x.postTaskCode + '_in'},
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
            state.watchCode = taskCode
            state.watchDefinition = nodeData.nodes.map(x =>x.data)
            state.workState = data.data.processPagingQueryVO.releaseState
            emit("giveState", state.workState);
            let flinkForm = [];
            let collectForm = [];
            for (let p = definition.length-1; p >= 0; p --) {
              const formObj = definition[p];
              if (definition[p].taskType === "COLLECT") {
                definition.splice(formObj,1)
                flinkForm = definition
              } else if (definition[p].taskType === "DLINK") {
                definition.splice(formObj,1)
                collectForm = definition
              }
            }
          }else{
            nodeData.nodes = null
            graph.fromJSON([])
            ElMessage.warning('当前画布为空')
          }
        })
      } else {
      }
    })
    onMounted(() => {
      init()
    })
    return{
      state,
      init,
      setRelation,
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