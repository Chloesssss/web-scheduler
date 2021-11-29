// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { createApp } from "vue";
import App from "./App.vue";
import './public-path';
import { createRouter, createWebHistory } from 'vue-router';

import routes from './router/index.js';

import store from "./store";
import Instance from "@/../common/utils/request/index";
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Pagination from "@/../common/components/pagination.vue"
import TableDeleteLink from "@/../common/components/tableDeleteLink.vue"
import '@/../common/css/global.scss'

let router = null;
let instance = null;
let history = null;


function render(props = {}) {
    const { container } = props;
    history = createWebHistory(window.__POWERED_BY_QIANKUN__ ? `${props.name}` : '/');
    router = createRouter({
        history,
        routes,
    });
    instance = createApp(App);
    instance.config.globalProperties.$axios = Instance
    instance.component('pagination', Pagination) // 公共分页组件
    instance.component('table-delete-link', TableDeleteLink) // 公共表格内操作删除按钮组件
    instance.use(router).use(ElementPlus, { size: 'small', zIndex: 3000, locale: zhCn, })
    instance.use(store);
    instance.mount(container ? container.querySelector('#app') : '#app');
}

if (!window.__POWERED_BY_QIANKUN__) {
    render();
}
export async function bootstrap() {
    console.log('%c ', 'color: green;', 'vue3.0 app bootstraped');
}

function storeTest(props) {
    props.setGlobalState &&
    props.setGlobalState({
        id: `${props.name}_子应用`
    });
    props.onGlobalStateChange &&
    props.onGlobalStateChange(
        (value, prev) => console.log(`[onGlobalStateChange - ${props.name}]:`, value, prev),
        true,
    );
}

export async function mount(props) {
    storeTest(props);
    render(props);
    instance.config.globalProperties.$onGlobalStateChange = props.onGlobalStateChange;
    instance.config.globalProperties.$setGlobalState = props.setGlobalState;
}

export async function unmount() {
    localStorage.removeItem('CURRENT_ROUTE')
    instance.unmount();
    instance._container.innerHTML = '';
    instance = null;
    router = null;
    history.destroy();
}
