<template>
  <Transition name="dialog-fade">
    <div v-if="isVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000] backdrop-blur-sm" @click.self="close">
      <div class="bg-white rounded-2xl p-8 max-w-lg w-11/12 shadow-2xl animate-slide-up">
        <!-- Icon -->
        <div class="flex justify-center mb-6" :class="iconClass">
          <div class="p-4 rounded-full bg-opacity-10" :class="bgClass">
             <component :is="getIcon" class="w-12 h-12" stroke-width="2" />
          </div>
        </div>
        
        <!-- Title -->
        <h3 class="text-2xl font-bold text-gray-800 mb-3 text-center">
          {{ title }}
        </h3>
        
        <!-- Message -->
        <p class="text-gray-600 text-center mb-8 leading-relaxed">
          {{ message }}
        </p>
        
        <!-- Actions -->
        <div class="flex gap-4 justify-center flex-col sm:flex-row-reverse">
          <button 
            @click="handleConfirm" 
            class="min-w-[120px] px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
            :class="confirmButtonClass"
          >
            {{ confirmText }}
          </button>
          <button 
            @click="handleCancel" 
            class="min-w-[120px] px-6 py-3 rounded-xl font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900"
          >
            {{ cancelText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed } from 'vue';
import { AlertCircle, Trash2, Info } from 'lucide-vue-next';

export default {
  name: 'ConfirmDialog',
  components: { AlertCircle, Trash2, Info },
  props: {
    title: {
      type: String,
      default: 'Confirm Action'
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'warning',
      validator: (value) => ['warning', 'danger', 'info'].includes(value)
    },
    confirmText: {
      type: String,
      default: 'Confirm'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    }
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    const isVisible = ref(true);

    const handleConfirm = () => {
      emit('confirm');
    };

    const handleCancel = () => {
      emit('cancel');
    };

    const close = () => {
      handleCancel();
    }

    const getIcon = computed(() => {
      const icons = {
        warning: AlertCircle,
        danger: Trash2,
        info: Info
      };
      return icons[props.type] || AlertCircle;
    });

    const iconClass = computed(() => {
      const classes = {
        warning: 'text-amber-500',
        danger: 'text-red-500',
        info: 'text-blue-500'
      };
      return classes[props.type];
    });

    const bgClass = computed(() => {
      const classes = {
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500'
      };
      return classes[props.type];
    });

    const confirmButtonClass = computed(() => {
      const classes = {
        warning: 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-300 ring-offset-2',
        danger: 'bg-red-500 hover:bg-red-600 text-white ring-2 ring-red-300 ring-offset-2',
        info: 'bg-blue-500 hover:bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2'
      };
      return classes[props.type];
    });

    return {
      isVisible,
      handleConfirm,
      handleCancel,
      close,
      getIcon,
      iconClass,
      bgClass,
      confirmButtonClass
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
