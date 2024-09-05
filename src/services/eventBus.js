import mitt from 'mitt';

const eventBus = mitt();

export default {
  ...eventBus,
  showErrorModal(message) {
    eventBus.emit('showErrorModal', message);
  },
  showQuestionModal(question, onConfirm, onCancel) {
    eventBus.emit('showQuestionModal', { question, onConfirm, onCancel });
  }
};
