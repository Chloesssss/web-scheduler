import { ElMessage } from 'element-plus'
function Message(code, message) { // 调用接口之后的信息提示
  ElMessage[code !== 200 ? 'error' : 'success'](`${message}${code !== 200 ? '失败, 请重试!' : '成功!'}`)
}
export {
  Message
}