import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import Layout from './components/layout/layout.vue'
import Main from './pages/main.vue'

const routes = [
    {
        path: '/', component: Layout,
        children: [
            {
                path: '',
                component: Main
            }
        ]
    }
]

const router = createRouter({
    history: createMemoryHistory(),
    routes,
})

createApp(App).use(router).mount('#app')