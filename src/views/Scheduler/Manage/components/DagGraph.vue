<template>
  <div class="content">
    <div class="app-content" id="flowContainer" ref="container"></div>
  </div>
</template>

<script>
import { Graph, Shape, Addon, FunctionExt } from "@antv/x6";
const { Stencil } = Addon;
const { Rect, Polygon } = Shape;
export default {
  name: "graph",
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const graph = new Graph({
        container: document.getElementById('flowContainer'),
        grid: true,
        background: {
            color: '#qqqqg1',
            repeat: 'watermark',
            opacity: 0.2,
        },
        keyboard: true,
        scroller: {
            enabled: true,
            pannable: true
        },
        selecting: {
            enabled: true,
            rubberband: true,
            filter (node) {
            // 只选连接线(边)
            return that.graph.isEdge(node)
            }
        },
        translating: {
            restrict (view) {
            const cell = view.cell
            if (cell.isNode()) {
                const parent = cell.getParent()
                if (parent) {
                // 限制子节点不能移动
                return {
                    x: cell.getBBox().x,
                    y: cell.getBBox().y,
                    width: 100,
                    height: 100
                }
                }
            }
            return null
            }
        }
      })
    },
  },
};
</script>
<style scoped>
.app-content {
  flex: 1;
  height: 100%;
  margin-left: 8px;
  margin-right: 8px;
  box-shadow: 0 0 10px 1px #e9e9e9;
}
</style>