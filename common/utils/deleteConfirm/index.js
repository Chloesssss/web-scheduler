import { ElMessageBox } from 'element-plus'
export const DeleteConfirm = () => {
  return ElMessageBox.confirm('将要进行删除操作！是否继续？', '删除确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
}