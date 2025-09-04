import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import Layout from './components/layout/layout.vue'
import Main from './pages/main.vue'
import Upload from './pages/music/upload.vue'

const routes = [
    {
        path: '/', component: Layout,
        children: [
            {
                path: '',
                component: Main
            },
            {
                path: 'music/upload',
                component: Upload
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

createApp(App).use(router).mount('#app')