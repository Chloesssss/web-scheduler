<template>
  <div class="content">
    <div class="app-stencil" ref="stencilContainer"></div>
    <div class="app-content" id="flowContainer" ref="container"></div>
  </div>
  <!-- 执行策略配置 -->
  <config-cell :visible="dialogVisible" @close="closeModal" />
</template>

<script>
import { Graph, Shape, Addon, FunctionExt } from "@antv/x6";
import ConfigCell from "./ConfigCell.vue";
const { Stencil } = Addon;
const { Rect, Polygon } = Shape;

export default {
  components: { ConfigCell },
  name: "index",
  mounted() {
    this.init();
  },
  data() {
    return {
      dialogVisible: false,
      cell: null, // graph context.cell
      view: null, // graph context.view
    };
  },
  methods: {
    init() {
      const graph = new Graph({
        container: this.$refs.container,
        width: "100%",
        height: "100%",
        grid: {
          size: 10,
          visible: true,
          type: "doubleMesh",
          args: [
            {
              color: "#f5f5f5",
              thickness: 1,
            },
            {
              color: "#f8f8f8",
              thickness: 1,
              factor: 4,
            },
          ],
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
        connecting: {
          anchor: "center",
          connectionPoint: "anchor",
          allowBlank: false,
          highlight: true,
          snap: true,
          createEdge() {
            return new Shape.Edge({
              attrs: {
                line: {
                  stroke: "#A2B1C3",
                  strokeWidth: 1,
                  targetMarker: {
                    name: "classic",
                    size: 7,
                  },
                },
              },
            });
          },
          validateConnection({
            sourceView,
            targetView,
            sourceMagnet,
            targetMagnet,
          }) {
            if (sourceView === targetView) {
              return false;
            }
            if (!sourceMagnet) {
              return false;
            }
            if (!targetMagnet) {
              return false;
            }
            return true;
          },
        },
        highlighting: {
          magnetAvailable: {
            name: "stroke",
            args: {
              padding: 4,
              attrs: {
                strokeWidth: 4,
                stroke: "rgba(223,234,255)",
              },
            },
          },
        },
        snapline: true,
        history: true,
        clipboard: {
          enabled: true,
        },
        keyboard: {
          enabled: true,
        },
        embedding: {
          enabled: true,
          findParent({ node }) {
            const bbox = node.getBBox();
            return this.getNodes().filter((node) => {
              // 只有 data.parent 为 true 的节点才是父节点
              const data = node.getData();
              if (data && data.parent) {
                const targetBBox = node.getBBox();
                return bbox.isIntersectWithRect(targetBBox);
              }
              return false;
            });
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
            title: "包含数据采集和数据开发",
          },
        ],
        layoutOptions: {
          columns: 1,
          columnWidth: 130,
          rowHeight: 70,
        },
      });
      this.$refs.stencilContainer.appendChild(stencil.container);
      // 初始化图形
      const ports = {
        groups: {
          top: {
            position: "top",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 2,
                fill: "#fff",
                style: {
                  visibility: "hidden",
                },
              },
            },
          },
          right: {
            position: "right",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 2,
                fill: "#fff",
                style: {
                  visibility: "hidden",
                },
              },
            },
          },
          bottom: {
            position: "bottom",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 2,
                fill: "#fff",
                style: {
                  visibility: "hidden",
                },
              },
            },
          },
          left: {
            position: "left",
            attrs: {
              circle: {
                r: 4,
                magnet: true,
                stroke: "#5F95FF",
                strokeWidth: 2,
                fill: "#fff",
                style: {
                  visibility: "hidden",
                },
              },
            },
          },
        },
        items: [
          {
            group: "top",
          },
          {
            group: "right",
          },
          {
            group: "bottom",
          },
          {
            group: "left",
          },
        ],
      };
      //设计画布左侧节点样式
      const collect = new Rect({
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
        "edit-text": {
          contenteditable: "false",
          class: "x6-edit-text",
          style: {
            width: "100%",
            textAlign: "center",
            fontSize: 12,
            color: "rgba(0,0,0,0.85)",
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
            fill: "#333",
            fontWeight: 800,
          },
        },
        ports: { ...ports },
      });
      // const service = new Rect({
      //   attrs: {
      //     text: { text: "数据服务" },
      //     body: {
      //       fill: "#E6A23C",
      //       stroke: "#E6A23C",
      //       color: "#333",
      //     },
      //     label: {
      //       fontSize: 16,
      //       fill: "#333",
      //       fontWeight: 800,
      //     },
      //   },
      //   "edit-text": {
      //     contenteditable: "false",
      //     class: "x6-edit-text",
      //     style: {
      //       width: "100%",
      //       textAlign: "center",
      //       fontSize: 12,
      //       color: "rgba(0,0,0,0.85)",
      //     },
      //   },
      //   text: {
      //     fontSize: 12,
      //     fill: "rgba(0,0,0,0.85)",
      //     textWrap: {
      //       text: "",
      //       width: -10,
      //     },
      //   },
      //   ports: { ...ports },
      // });
      // const security = new Rect({
      //   attrs: {
      //     text: { text: "数据安全" },
      //     body: {
      //       fill: "#409EF6",
      //       stroke: "#409EF6",
      //       color: "#333",
      //     },
      //     label: {
      //       fontSize: 16,
      //       fill: "#333",
      //       fontWeight: 800,
      //     },
      //   },
      //   "edit-text": {
      //     contenteditable: "false",
      //     class: "x6-edit-text",
      //     style: {
      //       width: "100%",
      //       textAlign: "center",
      //       fontSize: 12,
      //       color: "rgba(0,0,0,0.85)",
      //     },
      //   },
      //   text: {
      //     fontSize: 12,
      //     fill: "rgba(0,0,0,0.85)",
      //     textWrap: {
      //       text: "",
      //       width: -10,
      //     },
      //   },
      //   ports: { ...ports },
      // });
      // const indexCenter = new Rect({
      //   attrs: {
      //     text: { text: "指标中心" },
      //     body: {
      //       fill: "#A2F6FC",
      //       stroke: "#A2F6FC",
      //       color: "#333",
      //     },
      //     label: {
      //       fontSize: 16,
      //       fill: "#333",
      //       fontWeight: 800,
      //     },
      //   },
      //   "edit-text": {
      //     contenteditable: "false",
      //     class: "x6-edit-text",
      //     style: {
      //       width: "100%",
      //       textAlign: "center",
      //       fontSize: 12,
      //       color: "rgba(0,0,0,0.85)",
      //     },
      //   },
      //   text: {
      //     fontSize: 12,
      //     fill: "rgba(0,0,0,0.85)",
      //     textWrap: {
      //       text: "",
      //       width: -10,
      //     },
      //   },
      //   ports: { ...ports },
      // });
      stencil.load(
        [collect, flink],
        // [collect, flink, service, security, indexCenter],
        "processLibrary"
      );
      // stencil.load([c2, r2, r3, c3], 'staffPool')
      console.log(graph.toJSON());
      //绑定事件
      //双击节点打开节点配置
      graph.on("cell:dblclick", ({ cell, view }) => {// cell 基类对象 view 视图对象
        // 目标数据logic
        this.showModal(cell, view); // 显示子组件，顺便传递过去cell view，保持graph context
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
        const cellId = node.getTargetCellId();
        const target = graph.getCellById(cellId);
        target && target.setPortProp(target.id + "_in", "connected", false);
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
        const cellId = edge.getTargetCellId();
        const target = graph.getCellById(cellId);
        target && target.setPortProp(target.id + "_in", "connected", false);
      });
      graph.on("edge:mouseleave", ({ edge }) => {
        // 鼠标移开时删除删除按钮
        edge.removeTools();
      });
      graph.on("node:contextmenu", ({ cell, view }) => {
        console.log("contextmenu", cell, view);
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
          console.log("mouseenter");
          const ports = container.querySelectorAll(".x6-port-body");
          this.showPorts(ports, true);
        }),
        500
      );
      graph.on("node:mouseleave", () => {
        console.log("mouseleave");
        const ports = container.querySelectorAll(".x6-port-body");
        this.showPorts(ports, false);
      });
      graph.bindKey("backspace", () => {
        console.log("backspace");
        const cells = graph.getSelectedCells();
        if (cells.length) {
          graph.removeCells(cells);
        }
      });
    },
    showModal(cell, view) {
      this.cell = cell;
      this.view = view;
      this.dialogVisible = true;
    },
    closeModal(){
      this.dialogVisible = false;
    },
    showPorts(ports, show) {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? "visible" : "hidden";
      }
    },
  },
};
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