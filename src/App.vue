<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav v-if="isAuthenticated" class="bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 shadow-md">
      <div class="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <!-- Brand -->
        <div class="flex items-center gap-2">
          <Zap class="w-8 h-8 text-yellow-300" stroke-width="2.5" />
          <h1 class="text-2xl font-bold tracking-tight">{{ appName }}</h1>
        </div>
        
        <!-- Menu -->
        <div class="flex items-center gap-6">
          <router-link 
            to="/dashboard" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-white/20"
            active-class="bg-white/20"
          >
            <LayoutDashboard class="w-5 h-5" />
            <span>Dashboard</span>
          </router-link>
          <router-link 
            to="/posts" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-white/20"
            active-class="bg-white/20"
          >
            <Database class="w-5 h-5" />
            <span>Data Management</span>
          </router-link>
          
          <!-- User Menu -->
          <div class="flex items-center gap-4 pl-4 border-l border-white/30">
            <div class="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
              <User class="w-4 h-4" />
              <span class="font-medium text-sm">{{ user?.name }}</span>
            </div>
            <button 
              @click="handleLogout" 
              class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors font-medium hover:text-red-100"
              title="Logout"
            >
              <LogOut class="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto p-8">
      <router-view />
    </main>

    <!-- Global Dialog Components -->
    <AlertDialog
      v-if="alertState.isVisible"
      :message="alertState.message"
      :type="alertState.type"
      :title="alertState.title"
      :button-text="alertState.buttonText"
      :auto-dismiss="alertState.autoDismiss"
      @close="closeAlert"
    />
    
    <ConfirmDialog
      v-if="confirmState.isVisible"
      :message="confirmState.message"
      :title="confirmState.title"
      :type="confirmState.type"
      :confirm-text="confirmState.confirmText"
      :cancel-text="confirmState.cancelText"
      @confirm="confirmDialog"
      @cancel="cancelDialog"
    />
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './stores/auth';
import { useDialog } from './composables/useDialog';
import AlertDialog from './components/AlertDialog.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import { Zap, LayoutDashboard, Database, User, LogOut } from 'lucide-vue-next';

export default {
  name: 'App',
  components: {
    AlertDialog,
    ConfirmDialog,
    Zap,
    LayoutDashboard,
    Database,
    User,
    LogOut
  },
  setup() {
    const router = useRouter();
    const { user, isAuthenticated, initAuth, logout } = useAuth();
    const { alertState, confirmState, showConfirm, closeAlert, confirmDialog, cancelDialog } = useDialog();
    const appName = import.meta.env.VITE_APP_NAME || 'Post Data Manager';

    onMounted(() => {
      initAuth();
    });

    const handleLogout = async () => {
      const confirmed = await showConfirm('Are you sure you want to logout?', {
        title: 'Confirm Logout',
        type: 'warning',
        confirmText: 'Logout',
        cancelText: 'Cancel'
      });
      
      if (confirmed) {
        await logout();
        router.push('/login');
      }
    };

    return {
      user,
      isAuthenticated,
      handleLogout,
      alertState,
      confirmState,
      closeAlert,
      confirmDialog,
      cancelDialog,
      appName
    };
  }
}
</script>