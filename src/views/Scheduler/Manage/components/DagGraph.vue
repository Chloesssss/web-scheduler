<template>
  <div id="containered" ref="containered" />
</template>

<script lang="ts" setup>
/*eslint-disable */
import { ref, computed, onMounted } from 'vue'
import { Graph, Shape } from '@antv/x6';

const graph = ref<any>({}) // 流程图
const containered = ref<HTMLElement>() // 流程图挂载dom节点

const init = () => {
  graph.value = new Graph({
    container: containered.value,
    height: 300,
    background: {
      color: '#fffbe6', // 设置画布背景颜色
    },
    grid: {
      size: 10,      // 网格大小 10px
      visible: true, // 渲染网格背景
    },
    snapline: { // 对齐线
    enabled: true,
    sharp: true, // 是否显示截断的对齐线-对齐线变短
    },
    selecting: { // 点选/框选，默认禁用。
      enabled: true,
      // rubberband: true, // 框选
      // 是否显示节点的选择框，默认为 false，建议使用下面的样式定制方法去定制自己的选择框样式。
      // showNodeSelectionBox: true // 节点的选择框
    },
    keyboard: { // 键盘事件可用于绑定快捷键
      enabled: true
    },
    // 开启撤销/重做
    history: {
      enabled: true,
      ignoreChange: true
    },
    // 剪切板用于复制/粘贴节点和边，并支持跨画布的复制/粘贴，创建画布时通过以下配置启用。
    clipboard: {
      enabled: true
      // useLocalStorage: true // 保存到 localStorage
    },
    // panning: true, // 普通画布(未开启 scroller 模式)通过开启 panning 选项来支持拖拽平移。
    // 使画布具备滚动、平移、居中、缩放等能力
    scroller: {
      enabled: true,
      pageVisible: false, // 是否分页，默认为 false。
      pageBreak: false, // 是否显示分页符，默认为 false。
      pannable: true // 启用画布平移
    },
    mousewheel: { // 鼠标滚轮缩放
      enabled: true,
      // 是否为全局事件，设置为 true 时滚轮事件绑定在 document 上，否则绑定在画布容器上。默认为 false。
      global: true,
      modifiers: ['ctrl', 'meta']
    },
    highlighting: {
      // 连线过程中，节点可以被链接时被使用
      // nodeAvailable: {},
      // 拖动节点进行嵌入操作过程中，节点可以被嵌入时被使用
      embedding: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#fff',
            stroke: '#47C769',
          },
        },
      },
      // 连线过程中，链接桩可以被链接时被使用
      magnetAvailable: { // 高亮
        name: 'stroke',
        args: {
          attrs: {
            fill: '#fff',
            stroke: '#47C769',
          },
        },
      },
      // 连线过程中，自动吸附到链接桩时被使用
      magnetAdsorbed: {
        name: 'stroke',
        args: {
          attrs: {
            fill: '#fff',
            stroke: '#31d0c6',
          },
        },
      },
    },
    // 连线规则
    connecting: {
      snap: true, // 当 snap 设置为 true 时连线的过程中距离节点或者连接桩 50px 时会触发自动吸附
      allowBlank: false, // 是否允许连接到画布空白位置的点，默认为 true
      allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点，默认为 true
      allowMulti: false, // 当设置为 false 时，在起始和终止节点之间只允许创建一条边
      highlight: true, // 拖动边时，是否高亮显示所有可用的连接桩或节点，默认值为 false。
      sourceAnchor: { // 当连接到节点时，通过 sourceAnchor 来指定源节点的锚点。
        name: 'center'
      },
      targetAnchor: 'center', // 当连接到节点时，通过 targetAnchor 来指定目标节点的锚点。
      connector: 'rounded', // 连接器将起点、路由返回的点、终点加工为 元素的 d 属性，决定了边渲染到画布后的样式，默认值为 normal。
      connectionPoint: 'boundary', // 指定连接点，默认值为 boundary。
      router: { // 实体关系路由，由 Z 字形的斜角线段组成。
        name: 'er',
        args: {
          direction: 'T',
        },
      },
      validateMagnet({ magnet, cell }) {
        // 表示被点击的链接桩
        // console.log('magnet', e, magnet, view, cell);
        // if (magnet.getAttribute('port-group') === 'in') { //前置节点不能作为起点
        //   return false
        // }
        return true
      },
      createEdge() { // 连接的过程中创建新的边
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#136fff',
              strokeWidth: 1,
              targetMarker: {
                name: 'classic',
                size: 7
              }
            }
          }
        })
      },
      // 在移动边的时候判断连接是否有效，
      // 如果返回 false，当鼠标放开的时候，不会连接到当前元素，
      // 否则会连接到当前元素。
      // 可以连接的节点，链接桩会变色
      validateConnection({ sourceMagnet, targetMagnet, sourceCell, targetCell  }: any) {
        // 只能从输出链接桩创建连接
        if (!sourceMagnet || sourceMagnet.getAttribute('port-group') === 'in') {
          return false
        }
        // 只能连接到输入链接桩
        if (!targetMagnet || targetMagnet.getAttribute('port-group') !== 'in') {
          return false
        }
        return true
      },
      // 当停止拖动边的时候根据 validateEdge 返回值来判断边是否生效，如果返回 false, 该边会被清除。
      validateEdge({ edge }) {
        const { source, target } = edge
        
        return true
      }
    },
  });
  const node1 = new Shape.Rect({
    width: 130,
    height: 70,
    attrs: {
      text: { text: "数据采集" },
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
  const node2 = new Shape.Rect({
    width: 130,
    height: 70,
    attrs: {
      text: { text: "数据开发", fill: "end" },
      body: {
        fill: "#efdbff",
        stroke: "#9254de",
        rx: 50,
        ry: 20,
      },
      label: {
        fontSize: 16,
        fill: "red",
        fontWeight: 800,
      },
    },
  })

  const edge = new Shape.Edge({
    id: 'edge1',
    source: node1,
    target: node2,
    zIndex: 1,
    attrs: {
      line: {
        stroke: '#136fff',
        strokeWidth: 1,
        targetMarker: {
          name: 'classic',
          size: 7
        }
      }
    }
  })

  graph.value.addNode(node1)
  graph.value.addNode(node2)
  graph.value.addEdge(edge)
}

onMounted(() => {
  init()
})


</script>