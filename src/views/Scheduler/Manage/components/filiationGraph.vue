<template>
  <div class="content">
    <div class="app-stencil" ref="stencilContainer"></div>
    <div class="app-content" id="flowContainer" ref="container"></div>
  </div>
  <!-- 采集执行策略配置 -->
  <config-cell ref="dialogCollect" :visible="state.dialogVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-collect="getCollect" :definition="state.currentDefinition" :id="state.dataId" :current-id="state.currentId"/>
  <!-- 开发执行策略配置 -->
  <config-flink-cell ref="dialogFlink" :visible="state.flinkVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-flink="getFlink" :definition="state.currentDefinition" :id="state.dataId" :current-id="state.currentId"/>
  <!-- 标准执行策略配置 -->
  <config-stand-cell ref="dialogStander" :visible="state.standVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-stand="getStand" :definition="state.currentDefinition" :id="state.dataId" :current-id="state.currentId"/>
  <!-- 质控执行策略配置 -->
  <config-control-cell ref="dialogControl" :visible="state.controlVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-control="getControl" :definition="state.currentDefinition" :id="state.dataId" :current-id="state.currentId"/>
  <!-- 监控执行策略配置 -->
  <config-monitor-cell ref="dialogControl" :visible="state.monitorVisible" @close="closeModal" :code="state.code" :project-code="state.projectCode" :task-code="state.nodeId" :work-name="state.name" @get-Monitor="getMonitor" :definition="state.currentDefinition" :id="state.dataId" :current-id="state.currentId"/>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, onMounted, watch, getCurrentInstance } from 'vue'
import { Graph, Shape, Addon, FunctionExt } from "@antv/x6";
import ConfigCell from "../CollectConfig/ConfigCell.vue";
import ConfigFlinkCell from '../FlinkConfig/ConfigFlinkCell.vue';
import configStandCell from '../StanderConfig/ConfigStandCell.vue';
import configControlCell from '../ControlConfig/ConfigControlCell.vue';
import configMonitorCell from '../MonitorConfig/ConfigMonitorCell.vue';
import { ElMessageBox } from 'element-plus'
import { ElMessage } from 'element-plus';
import { BorderedImage } from '@antv/x6/lib/shape/standard';
// import { ApiConstant } from '@/constants/ApiConstant/index.js'
const { Stencil } = Addon;
const { Rect, Polygon } = Shape;

export default defineComponent({
  components: { ConfigCell, ConfigFlinkCell, configStandCell, configControlCell, configMonitorCell },
  name: "FiliationGraph",
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
      standVisible: false,
      controlVisible: false,
      monitorVisible: false,
      name: '',// 工作流作业名
      codeList: [],// 后端接口返回节点id数组
      taskCode: '',// 后端接口返回节点id字符串
      nodeDtos: [], //回显的节点数据
      linkDtos: [], //回显的边数据
      currentCode: '',// 当前节点id
      sysCode: '', //接口给予的当前节点id
      nodeId: '',// 当前节点id(传入表单)
      arrList:[],// 节点id数组（原）
      taskDefinition: [],// 节点配置表单信息
      taskRelation: [],// 节点关系
      postTaskCode: '',// 总是指向自己的节点id，用于匹配次级节点的pretaskcode
      preTaskCode: 0,//发出edge的节点id（若节点无输入桩的链接，则该id为0，即该节点为初始节点）
      postTaskVersion: 1,//指向的节点版本（指向1（指向自己））
      preTaskVersion: 1,//父节点为0，子节点为1
      workState: '',
      collectLabel: '数据采集',
      flinkLabel: '数据开发',
      standerLabel: '数据标准',
      controlLabel: '数据质控',
      monitorLabel: '数据质量监控',
      params: {},
      //监听获取的数据存储
      watchCode: null,
      watchDefinition: [],
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
      // graph.isPannable() // 画布是否可以平移
      // graph.enablePanning() // 启用画布平移
      graph.centerContent();

      /******************************** 左侧模型栏 ****************************/
      const stencil = new Stencil({
        title: "数据集成",
        name: "processLibrary",
        target: graph,
        search: false, // 搜索
        collapsable: true,
        stencilGraphWidth: 300,
        stencilGraphHeight: 600,
        groups: [
          {
            name: "processLibrary",
            title: "dataSource",
          },
        ],
        layoutOptions: {
          dx: 30,
          dy: 20,
          columns: 1,
          columnWidth: 130,
          rowHeight: 100,
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
            id: state.currentCode+ '_in',
            group: 'in',
          },
          {
            id: state.currentCode + '_out',
            group: 'out',
          },
        ],
      }
      //设计画布左侧节点样式
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
              tagName: 'text',
              selector: 'label',
            },
          ],
          data: {},
          relation: {},
          ports: { ...ports },
        },
        true,
      )
      const imageNodes = imageShapes.map((item) =>
        graph.createNode({
          shape: 'custom-node',
          attrs: {
            image: {
              'xlink:href': item.image,
            },
            body: item.body,
            text: item.label,
          },
        }),
      )
      stencil.load(
        imageNodes,
        "processLibrary"
      );
      graph.toJSON()
      //绑定事件
      graph.on('node:added', ({ node, cell }) => {
        state.currentCode = node.id
        getNodeCode(1, node.id)
      })
      //双击节点打开节点配置
      graph.on("cell:dblclick", ({ node, cell }) => {
        state.currentCode = node.attrs.label.id
        if (node.data.id) {
          state.currentCode = node.id
          state.dataId = node.data.id
          state.currentDefinition = node.attrs.label.data
        } else {
          state.currentCode = node.attrs.label.id
          state.dataId = null
          state.currentDefinition = node.attrs.label.data ? node.attrs.label.data : null;
        }
        state.currentId = node.id
        if(node.getAttrs().text.text == "数据采集"){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.dialogVisible = true;
        } else if(node.getAttrs().text.text == "数据开发"){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.flinkVisible = true;
        }else if(node.getAttrs().text.text == "数据标准"){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.standVisible = true;
        }else if(node.getAttrs().text.text == "数据质控"){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.controlVisible = true;
        }else if(node.getAttrs().text.text == "数据质量监控"){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.monitorVisible = true;
        }
        if(node.data.taskType == 'COLLECT'){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.dialogVisible = true;
        } else if(node.data.taskType == 'DLINK'){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.flinkVisible = true;
        } else if(node.data.taskType == 'DMDM'){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.standVisible = true;
        } else if(node.data.taskType == 'DQUALITY'){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.controlVisible = true;
        } else if(node.data.taskType == 'MONITOR'){
          state.nodeId = state.currentCode ? state.currentCode : node.id
          state.monitorVisible = true;
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
            markup: [
              {
                tagName: 'circle',
                selector: 'button',
                attrs: {
                  r: 8,
                  stroke: '#F25C54',
                  strokeWidth: 1,
                  fill: 'rgba(214, 40, 40, 0.25)',
                  cursor: 'pointer',
                },
              },
              {
                tagName: 'text',
                textContent: '✕',
                selector: 'icon',
                attrs: {
                  fill: '#F25C54',
                  fontSize: 7,
                  textAnchor: 'middle',
                  pointerEvents: 'none',
                  y: '0.3em',
                },
              },
            ],
          },
        });
      });
      graph.on("node:removed", ({ node, options }) => {
        console.log(node);
        if (!options.ui) {
          return;
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
              distance: 50,
              markup: [
                {
                  tagName: 'circle',
                  selector: 'button',
                  attrs: {
                    r: 8,
                    stroke: '#F25C54',
                    strokeWidth: 1,
                    fill: 'rgba(214, 40, 40, 0.25)',
                    cursor: 'pointer',
                  },
                },
                {
                  tagName: 'text',
                  textContent: '✕',
                  selector: 'icon',
                  attrs: {
                    fill: '#F25C54',
                    fontSize: 7,
                    textAnchor: 'middle',
                    pointerEvents: 'none',
                    y: '0.3em',
                  },
                },
              ],
            },
          },
        ]);
      });
      graph.on("edge:removed", ({ edge, options }) => {
        if (!options.ui) {
          return;
        }
        console.log(edge.getTargetCellId());
        const cellId = edge.getTargetCellId()
        const target = graph.getCellById(cellId)
        console.log(target);
        if (target) {
          const id = target.ports.items[0].id
          target && target.setPortProp(id, 'connected', false)
        }else{
          target && target.setPortProp(cellId+'_in', 'connected', false)
        }
      });
      graph.on("edge:mouseleave", ({ edge }) => {
        // 鼠标移开时删除删除按钮
        edge.removeTools();
      });
      graph.on('node:change:data', ({ node }) => {
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
      let cell = graph.getCellById(i.currentId)
      if (!cell || !cell.isNode()) {
        return
      }
      //设置指定路径上的属性值cell.attr('text/text', value)  其中label/text为自定义标题
      cell.attr('label/text', state.collectLabel)
      cell.attr('label/data', i)
    }
    //获取开发节点配置信息
    const getFlink = (j) => {
      state.flinkLabel = j.name
      let cell = graph.getCellById(j.currentId) // 通过id获取当前节点
      if (!cell || !cell.isNode()) {
        return
      }
      //设置指定路径上的属性值cell.attr('text/text', value)  其中label/text为自定义标题
      cell.attr('label/text', state.flinkLabel)
      cell.attr('label/data', j)
    }
    //获取标准节点配置信息
    const getStand = (k) => {
      state.standerLabel = k.name
      let cell = graph.getCellById(k.currentId) // 通过id获取当前节点
      if (!cell || !cell.isNode()) {
        return
      }
      //设置指定路径上的属性值cell.attr('text/text', value)  其中label/text为自定义标题
      cell.attr('label/text', state.standerLabel)
      cell.attr('label/data', k)
    }
    //获取质控节点配置信息
    const getControl = (l) => {
      state.controlLabel = l.name
      let cell = graph.getCellById(l.currentId) // 通过id获取当前节点
      if (!cell || !cell.isNode()) {
        return
      }
      //设置指定路径上的属性值cell.attr('text/text', value)  其中label/text为自定义标题
      cell.attr('label/text', state.controlLabel)
      cell.attr('label/data', l)
    }
    const getMonitor = (m) => {
      state.monitorLabel = m.name
      let cell = graph.getCellById(m.currentId) // 通过id获取当前节点
      if (!cell || !cell.isNode()) {
        return
      }
      //设置指定路径上的属性值cell.attr('text/text', value)  其中label/text为自定义标题
      cell.attr('label/text', state.monitorLabel)
      cell.attr('label/data', m)
    }
    const closeModal = () => {//节点配置抽屉关闭
      state.dialogVisible = false;
      state.flinkVisible = false;
      state.controlVisible = false;
      state.standVisible = false;
      state.monitorVisible = false
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
        preTaskCode: graph.getNodes().filter((item) => y.getSource().cell === item.id)[0] ? graph.getNodes().filter((item) => y.getSource().cell === item.id)[0].attrs.label.id : y.getSource().cell,
        postTaskCode: graph.getNodes().filter((item) => y.getTarget().cell === item.id)[0] ? graph.getNodes().filter((item) => y.getTarget().cell === item.id)[0].attrs.label.id : y.getTarget().cell,
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
      let parentShip = [];
      let taskCodes = []
      taskCodes = graph.getNodes().map(x => x.attrs.label.id)
      for (var i = 0; i < taskCodes.length; i++) {
        if (childNodes.indexOf(taskCodes[i]) === -1) {
          parentShip.push(taskCodes[i])
        }
      }
      const sourceNodeship = parentShip.map(x => ({
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
    const getNodeCode = (flag, id) => {
      proxy.$axios.get().then(({ data }) => {
        state.sysCode = data.data
        let cell = graph.getCellById(id)
        if (!cell || !cell.isNode()) {
          return
        }
        cell.attr('label/id', String(state.sysCode))
        if(flag===1){
          state.currentCode = String(state.sysCode)
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
      const locations = graph.getNodes().map(x => ({ // 节点位置
        x: x.position().x,
        y: x.position().y,
      }))
      let codeList = ''
      codeList = graph.getNodes().map(x => x.attrs.label.id)
      let taskDefinitionList = []
      taskDefinitionList = graph.getNodes().map(x => x.attrs.label.data)
      if(!graph.getNodes().length) {
        ElMessage.warning('请输入依赖项')
      }else if (taskDefinitionList.length != codeList.length) {
        ElMessage.warning('请配置节点信息')
      }else{
        proxy.$axios.put({}, {
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
        }).then(({ data }) => {
          if(data.code === 200) {
            ElMessage.success('保存成功')
            reSet()
          } else {
            ElMessage.error(data.msg);
          }
        }).catch(e => {
          ElMessage.error('保存失败请重试！')
        })
      }
    }
    const reSet = () => {
      proxy.$axios.get(``)
      .then(({ data }) => {
        if(data.code == 200 && data.data.taskDefinition != null){
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
                stroke: taskType[locations.indexOf(x)] === "COLLECT" ? 'rgb(102, 153, 204)' : (taskType[locations.indexOf(x)] === "DMDM" ? 'rgb(219, 127, 142)' : (taskType[locations.indexOf(x)] === "DLINK" ? 'rgb(185, 147, 214)' : (taskType[locations.indexOf(x)] === "MONITOR" ? 'rgb(247, 178, 103)' : 'rgb(154, 184, 122)' ) )),
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
              image: {'xlink:href': taskType[locations.indexOf(x)] === "COLLECT" ? imageShapes[0].image : (taskType[locations.indexOf(x)] === "DLINK"?imageShapes[1].image: (taskType[locations.indexOf(x)] === "DQUALITY"?imageShapes[2].image: (taskType[locations.indexOf(x)] === "MONITOR"?imageShapes[3].image: imageShapes[4].image)))}
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
          emit("giveState", state.workState)
        }else{
          nodeData.nodes = null
          graph.fromJSON([])
          ElMessage.warning('当前画布为空')
        }
      })
    }
    //监听树节点code获取画布节点位置信息
    watch([code, projectCode, workName],(newval,oldval) => {
      state.code = newval[0]
      state.projectCode = newval[1]
      state.name = newval[2]
      let mm = ''
      if(state.projectCode){
        reSet()
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
      reSet,
      getCollect,
      getFlink,
      getStand,
      getControl,
      getMonitor,
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
  width: 200px;
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
