// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Global configuration for widget testing
Cypress.on("uncaught:exception", (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // for uncaught exceptions in the application
  if (err.message.includes("ResizeObserver loop limit exceeded")) {
    return false;
  }
  return true;
});

// Custom command to wait for widget to be ready
Cypress.Commands.add("waitForWidgetReady", () => {
  cy.get('[component="graphviz"]', { timeout: 10000 }).should("be.visible");
  cy.get("#tree_panel", { timeout: 10000 }).should("exist");
});

// Custom command to mock API responses
Cypress.Commands.add("mockApiResponse", (endpoint, fixture, statusCode = 200) => {
  cy.intercept("GET", endpoint, {
    statusCode,
    fixture,
  }).as(`api-${endpoint.replace(/[^a-zA-Z0-9]/g, "-")}`);
});

// Custom command to simulate parent app message
Cypress.Commands.add("simulateParentMessage", (message) => {
  cy.window().then((win) => {
    win.postMessage(message, "*");
  });
});

// Custom command to check for toast notifications
Cypress.Commands.add("checkToast", (type, message) => {
  cy.get(".toastify").should("contain", message);
  if (type) {
    cy.get(".toastify").should("have.class", `toast-${type}`);
  }
});

// Custom command to wait for loading state to complete
Cypress.Commands.add("waitForLoadingComplete", () => {
  cy.get("#tree_panel").should("not.contain", "Loading tree data...");
  cy.get("#tree_panel .loading-message").should("not.exist");
  cy.get(".toastify").should("not.contain", "Loading");
}); 