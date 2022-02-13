<template>
  <div class="content">
    <div class="app-stencil" ref="stencilContainer"></div>
    <div class="app-content" id="flowContainer" ref="container"></div>
  </div>
</template>

<script>
import { Graph, Shape, Addon, FunctionExt } from "@antv/x6";
const { Stencil } = Addon;
const { Rect, Polygon } = Shape;

export default {
  name: "index",
  mounted() {
    this.init();
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
                  stroke: "#5F95FF",
                  strokeWidth: 2,
                  targetMarker: {
                    name: "classic",
                    size: 8,
                  },
                },
              },
              router: {
                name: "manhattan",
              },
              zIndex: 0,
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
        title: "Components",
        target: graph,
        search: false, // 搜索
        collapsable: false,
        stencilGraphWidth: 250,
        stencilGraphHeight: 300,
        groups: [
          {
            name: "processLibrary",
            title: "数据集成",
          },
          // {
          //     name: 'staffPool',
          //     title: '人员库',
          // },
          // {
          //     name: 'modelLibrary',
          //     title: '模型仓库',
          // },
        ],
      });
      this.$refs.stencilContainer.appendChild(stencil.container);
      const collect = new Rect({
        width: 70,
        height: 70,
        attrs: {
          text: { text: "数据采集" },
          body: {
            fill: "#6bc76a",
            stroke: "#6bc76a",
            color: "#333",
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
        ports: {
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
        },
      });
      const flink = new Rect({
        width: 70,
        height: 70,
        attrs: {
          text: { text: "数据开发", fill: "end" },
          body: {
            fill: "#299999",
            stroke: "#299999",
          },
          label: {
            fontSize: 16,
            fill: "#333",
            fontWeight: 800,
          },
        },
        ports: {
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
        },
      });
      const service = new Rect({
        width: 70,
        height: 70,
        attrs: {
          text: { text: "数据服务" },
          body: {
            fill: "#E6A23C",
            stroke: "#E6A23C",
            color: "#333",
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
        ports: {
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
        },
      });
      const security = new Rect({
        width: 70,
        height: 70,
        attrs: {
          text: { text: "数据安全" },
          body: {
            fill: "#409EF6",
            stroke: "#409EF6",
            color: "#333",
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
        ports: {
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
        },
      });
      const indexCenter = new Rect({
        width: 70,
        height: 70,
        attrs: {
          text: { text: "指标中心" },
          body: {
            fill: "#A2F6FC",
            stroke: "#A2F6FC",
            color: "#333",
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
        ports: {
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
        },
      });
      stencil.load(
        [collect, flink, service, security, indexCenter],
        "processLibrary"
      );
      // stencil.load([c2, r2, r3, c3], 'staffPool')
      console.log(graph.toJSON());
      /************************************** 绑定事件 *********************************/
      graph.on("cell:dblclick", ({ cell, e }) => {
        const p = graph.clientToGraph(e.clientX, e.clientY);
        cell.addTools([
          {
            name: "editableCell",
            args: {
              x: p.x,
              y: p.y,
            },
          },
        ]);
      });
      // 节点删除操作
      // 鼠标 Hover 时添加删除按钮
      graph.on('node:mouseenter', ({ node }) => {
        if (node === target) {
          node.addTools({
            name: 'button-remove',
            args: {
              x: 0,
              y: 0,
              offset: { x: 10, y: 10 },
            },
          })
        }
      })

      // 鼠标移开时删除删除按钮
      graph.on('node:mouseleave', ({ node }) => {
        node.removeTools()
      })
      // 线删除操作
      graph.on("edge:mouseenter", ({ edge }) => {
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
      // 鼠标移开时删除删除按钮
      graph.on("edge:mouseleave", ({ edge }) => {
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
  width: 250px;
  border: 1px solid #f0f0f0;
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
  border: 1px solid #f0f0f0;
  margin-left: -1px;
}
</style>