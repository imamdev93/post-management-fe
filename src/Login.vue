<template>
  <div class="fixed inset-0 h-screen w-full flex items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-primary-600 overflow-auto">
    <div class="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
          <Lock class="w-8 h-8 text-primary-600" stroke-width="2.5" />
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Login</h1>
        <p class="text-gray-600">Welcome back! Please login to your account.</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <div class="relative">
            <input 
              type="email" 
              v-model="form.email" 
              :class="[
                'w-full pl-10 pr-4 py-2.5 border rounded-lg text-base transition-all',
                errors.email 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 focus:ring-2'
              ]"
              placeholder="your@email.com"
              required
            >
            <Mail class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <span v-if="errors.email" class="text-red-500 text-sm mt-1 block">{{ errors.email[0] }}</span>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <div class="relative">
             <input 
              type="password" 
              v-model="form.password" 
              :class="[
                'w-full pl-10 pr-4 py-2.5 border rounded-lg text-base transition-all',
                errors.password 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500 focus:ring-2'
              ]"
              placeholder="••••••••"
              required
            >
            <Key class="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          <span v-if="errors.password" class="text-red-500 text-sm mt-1 block">{{ errors.password[0] }}</span>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
           <AlertCircle class="w-5 h-5 flex-shrink-0" />
          {{ errorMessage }}
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full mt-6 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-primary-500/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
          <span v-else>Login</span>
          <ArrowRight v-if="!loading" class="w-4 h-4" />
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './stores/auth';
import { Lock, Mail, Key, AlertCircle, ArrowRight } from 'lucide-vue-next';

export default {
  name: 'Login',
  components: { Lock, Mail, Key, AlertCircle, ArrowRight },
  setup() {
    const router = useRouter();
    const { login, loading } = useAuth();

    const form = ref({
      email: '',
      password: ''
    });

    const errors = ref({});
    const errorMessage = ref('');

    const handleLogin = async () => {
      errors.value = {};
      errorMessage.value = '';

      const result = await login(form.value);

      if (result.success) {
        router.push('/dashboard');
      } else {
        errorMessage.value = result.message;
        errors.value = result.errors || {};
      }
    };

    return {
      form,
      errors,
      errorMessage,
      loading,
      handleLogin
    };
  }
};
</script>