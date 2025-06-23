// notifications.js
// Centralized notification system using Toastify-js

window.Widgets.Notifications = {};

(function ($, ns, document, window) {
    "use strict";

    // Notification queue to prevent spam
    ns.notificationQueue = [];
    ns.isProcessingQueue = false;
    ns.maxQueueSize = 10;

    // Default configuration
    ns.config = {
        duration: 5000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        close: true,
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
    };

    /**
     * Show a notification using Toastify
     * @param {string} type - Type of notification (success, error, warning, info, loading)
     * @param {string} message - Message to display
     * @param {object} options - Additional options
     */
    ns.showNotification = function (type, message, options = {}) {
        const notification = {
            type,
            message,
            options: { ...ns.config, ...options },
            timestamp: Date.now(),
        };

        // Add to queue
        ns.notificationQueue.push(notification);

        // Limit queue size
        if (ns.notificationQueue.length > ns.maxQueueSize) {
            ns.notificationQueue.shift();
        }

        // Process queue if not already processing
        if (!ns.isProcessingQueue) {
            ns.processQueue();
        }
    };

    /**
     * Process the notification queue
     */
    ns.processQueue = function () {
        if (ns.notificationQueue.length === 0) {
            ns.isProcessingQueue = false;
            return;
        }

        ns.isProcessingQueue = true;
        const notification = ns.notificationQueue.shift();

        // Get Toastify from global scope (loaded via script tag)
        const Toastify = window.Toastify;
        if (!Toastify) {
            console.error("Toastify not found. Make sure toastify.js is loaded.");
            ns.processQueue();
            return;
        }

        // Configure notification based on type
        const config = ns.getNotificationConfig(notification.type, notification.message, notification.options);

        // Show notification
        Toastify(config).showToast();

        // Process next notification after a short delay
        setTimeout(() => {
            ns.processQueue();
        }, 100);
    };

    /**
     * Get notification configuration based on type
     * @param {string} type - Notification type
     * @param {string} message - Message to display
     * @param {object} options - Base options
     * @returns {object} Configuration object for Toastify
     */
    ns.getNotificationConfig = function (type, message, options) {
        const baseConfig = {
            text: message,
            duration: options.duration,
            gravity: options.gravity,
            position: options.position,
            stopOnFocus: options.stopOnFocus,
            close: options.close,
            className: `widget-toast toast-${type}`,
        };

        // Type-specific configurations
        switch (type) {
            case "success":
                return {
                    ...baseConfig,
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                        color: "white",
                    },
                };

            case "error":
                return {
                    ...baseConfig,
                    style: {
                        background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                        color: "white",
                    },
                };

            case "warning":
                return {
                    ...baseConfig,
                    style: {
                        background: "linear-gradient(to right, #f093fb, #f5576c)",
                        color: "white",
                    },
                };

            case "info":
                return {
                    ...baseConfig,
                    style: {
                        background: "linear-gradient(to right, #4facfe, #00f2fe)",
                        color: "white",
                    },
                };

            case "loading":
                return {
                    ...baseConfig,
                    style: {
                        background: "linear-gradient(to right, #667eea, #764ba2)",
                        color: "white",
                    },
                    duration: -1, // Don't auto-dismiss loading notifications
                };

            default:
                return {
                    ...baseConfig,
                    style: options.style || baseConfig.style,
                };
        }
    };

    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {object} options - Additional options
     */
    ns.showSuccess = function (message, options = {}) {
        ns.showNotification("success", message, options);
    };

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {object} options - Additional options
     */
    ns.showError = function (message, options = {}) {
        ns.showNotification("error", message, options);
    };

    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {object} options - Additional options
     */
    ns.showWarning = function (message, options = {}) {
        ns.showNotification("warning", message, options);
    };

    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {object} options - Additional options
     */
    ns.showInfo = function (message, options = {}) {
        ns.showNotification("info", message, options);
    };

    /**
     * Show loading notification
     * @param {string} message - Loading message
     * @param {object} options - Additional options
     */
    ns.showLoading = function (message, options = {}) {
        ns.showNotification("loading", message, options);
    };

    /**
     * Dismiss all notifications
     */
    ns.dismissAll = function () {
        // Remove all toast elements
        const toasts = document.querySelectorAll(".toastify");
        toasts.forEach((toast) => {
            toast.remove();
        });

        // Clear queue
        ns.notificationQueue = [];
        ns.isProcessingQueue = false;
    };

    /**
     * Get current notifications
     * @returns {object} Notifications object with dismissAll method
     */
    ns.getNotifications = function () {
        return {
            dismissAll: ns.dismissAll,
        };
    };

    // Initialize when DOM is ready
    $(document).ready(function () {
        // Add custom CSS for widget-specific styling
        const customCSS = `
            .widget-toast {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                font-size: 14px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                max-width: 350px;
                word-wrap: break-word;
            }
            
            .widget-toast.toast-loading {
                background: linear-gradient(45deg, #667eea, #764ba2) !important;
            }
            
            .widget-toast.toast-success {
                background: linear-gradient(45deg, #00b09b, #96c93d) !important;
            }
            
            .widget-toast.toast-error {
                background: linear-gradient(45deg, #ff5f6d, #ffc371) !important;
            }
            
            .widget-toast.toast-warning {
                background: linear-gradient(45deg, #f093fb, #f5576c) !important;
            }
            
            .widget-toast.toast-info {
                background: linear-gradient(45deg, #4facfe, #00f2fe) !important;
            }
        `;

        // Inject custom CSS
        const style = document.createElement("style");
        style.textContent = customCSS;
        document.head.appendChild(style);
    });

})(
    window.jQuery,
    window.Widgets.Notifications,
    document,
    window
); 