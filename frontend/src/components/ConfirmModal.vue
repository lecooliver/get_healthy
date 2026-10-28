<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirmar'
  },
  message: {
    type: String,
    default: 'Tem certeza?'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmClass: {
    type: String,
    default: 'btn-danger'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const close = () => {
  emit('update:show', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('update:show', false)
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div
          class="fixed inset-0 bg-black/50"
          @click="close"
        />
        <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 z-10">
          <h3 class="text-lg font-semibold mb-2">
            {{ title }}
          </h3>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            {{ message }}
          </p>
          <div class="flex gap-3 justify-end">
            <button
              class="btn btn-secondary"
              @click="close"
            >
              {{ cancelText }}
            </button>
            <button
              :class="['btn', confirmClass]"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
