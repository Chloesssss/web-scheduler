export function generateGitMessage(processTemp, ProjectVersionTemp) {
  if (processTemp.NODE_ENV == "production") {
    // window.ProjectVersionTemp = Object.freeze(ProjectVersionTemp)
    console.group(`版本信息 - ${new Date().toLocaleDateString()}`)
    console.log('分支名称：' + ProjectVersionTemp.branchName)
    console.log('打包日期：' + ProjectVersionTemp.buildDate)
    console.log('代码提交日期：' + ProjectVersionTemp.commitDate)
    console.log('commitHash：' + ProjectVersionTemp.commitHash)
    console.groupEnd()
  }
}
