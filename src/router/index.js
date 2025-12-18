import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../Dashboard.vue";
import PostManagement from "../Post.vue";
import Login from "../Login.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { guest: true },
  },
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/posts",
    name: "PostManagement",
    component: PostManagement,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("auth_token");
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.meta.guest && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
