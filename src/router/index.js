const routes = [
  {
    path: "/",
    name: "Manage", 
    component: () => import("@/views/Scheduler/Main.vue"),
    children: [
      {
        path: "workManage", //作业管理
        name: "WorkManage", 
        component: () => import("@/views/Scheduler/Manage/WorkManage.vue"),
      },
      {
        path: "workMonitor", //作业监控
        name: "WorkMonitor", 
        component: () => import("@/views/Scheduler/Monitior/WorkMonitor.vue"),
      },
      {
        path: "exampleMonitor", //实时监控
        name: "ExampleMonitor", 
        component: () => import("@/views/Scheduler/Example/ExampleMonitor.vue"),
      }
    ]}
];

export default routes;
