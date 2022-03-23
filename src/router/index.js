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
      },
      {
        path: "exampleTaskMonitor", //任务实例列表
        name: "ExampleTaskMonitor", 
        component: () => import("@/views/Scheduler/Example/ExampleTaskMonitor.vue"),
      },
      {
        path: "example", //例子
        name: "example", 
        component: () => import("@/views/Scheduler/Monitior/example.vue"),
      },
    ]}
];

export default routes;
