import { ref, reactive } from "vue";

// Global state for dialogs
const alertState = reactive({
  isVisible: false,
  title: "",
  message: "",
  type: "info",
  buttonText: "OK",
  autoDismiss: 0,
  resolve: null,
});

const confirmState = reactive({
  isVisible: false,
  title: "Confirm Action",
  message: "",
  type: "warning",
  confirmText: "Confirm",
  cancelText: "Cancel",
  resolve: null,
});

export function useDialog() {
  /**
   * Show an alert dialog
   * @param {string} message - The message to display
   * @param {string} type - Type: 'success', 'error', 'warning', 'info'
   * @param {object} options - Additional options
   * @returns {Promise} Resolves when dialog is closed
   */
  const showAlert = (message, type = "info", options = {}) => {
    return new Promise((resolve) => {
      alertState.message = message;
      alertState.type = type;
      alertState.title = options.title || "";
      alertState.buttonText = options.buttonText || "OK";
      alertState.autoDismiss = options.autoDismiss || 0;
      alertState.resolve = resolve;
      alertState.isVisible = true;
    });
  };

  /**
   * Show a confirmation dialog
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   * @returns {Promise<boolean>} Resolves to true if confirmed, false if cancelled
   */
  const showConfirm = (message, options = {}) => {
    return new Promise((resolve) => {
      confirmState.message = message;
      confirmState.title = options.title || "Confirm Action";
      confirmState.type = options.type || "warning";
      confirmState.confirmText = options.confirmText || "Confirm";
      confirmState.cancelText = options.cancelText || "Cancel";
      confirmState.resolve = resolve;
      confirmState.isVisible = true;
    });
  };

  const closeAlert = () => {
    alertState.isVisible = false;
    if (alertState.resolve) {
      alertState.resolve();
      alertState.resolve = null;
    }
  };

  const confirmDialog = () => {
    confirmState.isVisible = false;
    if (confirmState.resolve) {
      confirmState.resolve(true);
      confirmState.resolve = null;
    }
  };

  const cancelDialog = () => {
    confirmState.isVisible = false;
    if (confirmState.resolve) {
      confirmState.resolve(false);
      confirmState.resolve = null;
    }
  };

  return {
    // Alert
    alertState,
    showAlert,
    closeAlert,

    // Confirm
    confirmState,
    showConfirm,
    confirmDialog,
    cancelDialog,
  };
}
