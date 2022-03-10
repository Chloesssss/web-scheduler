const child_process = require("child_process")

// git 提交记录信息 https://git-scm.com/docs/git-show    https://git-scm.com/docs/git
const commitHash = child_process.execSync('git show -s --format=%H').toString().trim()
const localBranchName = child_process.execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
// const branchName = child_process.execSync(`git rev-parse --abbrev-ref ${localBranchName}@{upstream}`).toString().trim()
const commitDateObj = new Date(child_process.execSync('git show -s --format=%cd').toString())
const commitDate = `${commitDateObj.getFullYear()+'-'+(commitDateObj.getMonth()+1)+'-'+commitDateObj.getDate()+'  '+commitDateObj.getHours()+':'+commitDateObj.getMinutes()}`
const nowDate = new Date()
const buildDate = `${nowDate.getFullYear()+'-'+(nowDate.getMonth()+1)+'-'+nowDate.getDate()+'  '+nowDate.getHours()+':'+nowDate.getMinutes()}`
module.exports = {
  commitHash,
  branchName: localBranchName,
  commitDate,
  buildDate
}
