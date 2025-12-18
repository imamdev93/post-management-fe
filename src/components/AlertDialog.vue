<template>
  <Transition name="dialog-fade">
    <div v-if="isVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm" @click.self="close">
      <div :class="[
        'bg-white rounded-2xl p-8 max-w-md w-11/12 shadow-2xl animate-slide-up',
        type
      ]">
        <!-- Icon -->
        <div :class="[
          'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg',
          iconClasses
        ]">
          <component :is="getIcon" class="w-10 h-10 text-white" stroke-width="2.5" />
        </div>
        
        <!-- Title -->
        <h3 class="text-2xl font-semibold text-gray-800 mb-3 text-center">
          {{ computedTitle }}
        </h3>
        
        <!-- Message -->
        <p class="text-gray-600 text-center mb-6 leading-relaxed">
          {{ message }}
        </p>
        
        <!-- Actions -->
        <div class="flex justify-center">
          <button 
            @click="close" 
            :class="[
              'min-w-[120px] px-6 py-2.5 rounded-lg font-medium transition-all shadow-md active:scale-95',
              buttonClasses
            ]"
          >
            {{ buttonText }}
          </button>
        </div>

        <!-- Auto dismiss progress -->
        <div v-if="autoDismiss" class="h-1 w-full bg-gray-100 mt-6 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-100 ease-linear rounded-full"
            :class="buttonClasses"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next';

export default {
  name: 'AlertDialog',
  components: { CheckCircle, XCircle, AlertTriangle, Info },
  props: {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
    },
    buttonText: {
      type: String,
      default: 'OK'
    },
    autoDismiss: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const isVisible = ref(true);
    const progress = ref(100);
    let timer = null;
    let progressTimer = null;

    const close = () => {
      isVisible.value = false;
      setTimeout(() => emit('close'), 300);
    };

    const getIcon = computed(() => {
      const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info
      };
      return icons[props.type] || Info;
    });

    const iconClasses = computed(() => {
      const classes = {
        success: 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/40',
        error: 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40',
        warning: 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-amber-500/40',
        info: 'bg-gradient-to-br from-primary-500 to-primary-600 shadow-primary-500/40'
      };
      return classes[props.type] || classes.info;
    });

    const buttonClasses = computed(() => {
      const classes = {
        success: 'bg-green-500 hover:bg-green-600 text-white',
        error: 'bg-red-500 hover:bg-red-600 text-white',
        warning: 'bg-amber-500 hover:bg-amber-600 text-white',
        info: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:shadow-lg text-white'
      };
      return classes[props.type] || classes.info;
    });

    const computedTitle = computed(() => {
      if (props.title) return props.title;
      const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
      };
      return titles[props.type];
    });

    if (props.autoDismiss) {
      const duration = 3000;
      const step = 10;
      
      timer = setTimeout(close, duration);
      
      progressTimer = setInterval(() => {
        progress.value = Math.max(0, progress.value - (100 / (duration / step)));
      }, step);
    }

    onBeforeUnmount(() => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
    });

    return {
      isVisible,
      close,
      getIcon,
      iconClasses,
      buttonClasses,
      computedTitle,
      progress
    };
  }
};
</script>

<style>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>



<style>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
