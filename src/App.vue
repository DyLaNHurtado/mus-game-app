<template>
  <v-app>
    <v-main>
      <router-view />
      <ErrorModal v-if="showError" :message="errorMessage" @close="closeErrorModal" />
      <QuestionModal v-if="showQuestion" :question="question" @confirm="handleConfirm" @cancel="handleCancel" />
    </v-main>
  </v-app>
</template>

<script>
import ErrorModal from '@/components/ErrorModal.vue';
import QuestionModal from '@/components/QuestionModal.vue';
import eventBus from '@/services/eventBus';

export default {
  components: {
    ErrorModal,
    QuestionModal
  },
  data() {
    return {
      showError: false,
      showQuestion: false,
      errorMessage: '',
      question: '',
      onConfirm: null,
      onCancel: null
    };
  },
  created() {
    eventBus.on('showErrorModal', this.showErrorModal);
    eventBus.on('showQuestionModal', this.showQuestionModal);
  },
  methods: {
    showErrorModal(message) {
      this.errorMessage = message;
      this.showError = true;
    },
    showQuestionModal({ question, onConfirm, onCancel }) {
      console.log("questionDialog event", question);
      
      this.question = question;
      this.onConfirm = onConfirm;
      this.onCancel = onCancel;
      this.showQuestion = true;
    },
    handleConfirm() {
      if (this.onConfirm) this.onConfirm();
      this.showQuestion = false;
    },
    handleCancel() {
      if (this.onCancel) this.onCancel();
      this.showQuestion = false;
    },
    closeErrorModal() {
      this.showError = false;
    }
  }
};
</script>