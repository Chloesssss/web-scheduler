import { ElLoading } from 'element-plus'
let loadingService = null;
const start = () => {
  loadingService = ElLoading.service({
    lock: true,
    text: '加载中...',
    spinner: 'dots-loader',
    // background: 'rgba(0, 0, 0, 0.7)'
  })
}
const end = () => {
  loadingService && loadingService.close();
}
export const Loading = {
  start,
  end
}