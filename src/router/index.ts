import { createRouter, createWebHistory } from 'vue-router'
import TransformQubitsViewVue from '@/views/TransformQubitsView.vue';
import TransformGateViewVue from '../views/TransformGateView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/qubits',
    },
    {
      path: '/qubits',
      name: 'qubits',
      component: TransformQubitsViewVue
    },
    {
      path: '/gate',
      name: 'gate',
      component: TransformGateViewVue
    },
  ]
})

export default router
