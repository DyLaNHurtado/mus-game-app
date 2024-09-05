<template>
  <div v-if="isVisible" class="modal-container" @click="handleBackgroundClick">
    <div class="modal-backdrop"></div>
    <div class="modal-content" @click.stop>
      <header class="modal-header">
        <h3>{{ title }}</h3>
        <button class="close-button" @click="closeModal">✖</button>
      </header>
      <section class="modal-body">
        <slot></slot>
      </section>
      <footer class="modal-footer">
        <slot name="footer"></slot>
      </footer>
    </div>
  </div>
</template>

<script>
import eventBus from '@/services/eventBus';

export default {
  name: 'Modal',
  props: {
    title: {
      type: String,
      default: 'Modal',
    },
  },
  data() {
    return {
      isVisible: false,
    };
  },
  created() {
    eventBus.on('open-modal', this.openModal);
    eventBus.on('close-modal', this.closeModal);
  },
  beforeDestroy() {
    eventBus.off('open-modal', this.openModal);
    eventBus.off('close-modal', this.closeModal);
  },
  methods: {
    openModal(data) {
      this.isVisible = true;
      this.title = data.title || this.title;
      this.$emit('modal-opened', data);
    },
    closeModal() {
      this.isVisible = false;
      this.$emit('modal-closed');
    },
    handleBackgroundClick(e) {
      if (e.target === e.currentTarget) {
        this.closeModal();
      }
    },
  },
};
</script>

<style scoped>
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  z-index: 1001;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  margin: 20px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
