/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to wait for widget to be ready
Cypress.Commands.add("waitForWidgetReady", () => {
  cy.get('[component="graphviz"]', { timeout: 10000 }).should("be.visible");
  cy.get("#tree_panel", { timeout: 10000 }).should("exist");
});

// Custom command to mock API responses
Cypress.Commands.add("mockApiResponse", (endpoint, fixture, statusCode = 200) => {
  const alias = endpoint.replace(/[^a-zA-Z0-9]/g, "-");
  cy.intercept("GET", endpoint, {
    statusCode,
    fixture,
  }).as(alias);
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

// Custom command to click filter and wait for data load
Cypress.Commands.add("clickFilterAndWait", (filterId) => {
  cy.get(`#${filterId}`).click();
  cy.waitForLoadingComplete();
});

// Custom command to verify tree is rendered
Cypress.Commands.add("verifyTreeRendered", () => {
  cy.get("#tree_panel svg").should("exist");
  cy.get("#tree_panel svg g").should("exist");
});

// Custom command to get the iframe's body for widget assertions
Cypress.Commands.add("getWidgetIframeBody", () => {
  // Get the iframe, its document, and body, and wrap it for Cypress
  return cy
    .get("#widgetFrame", { timeout: 10000 })
    .should("exist")
    .then(($iframe) => {
      const doc = $iframe[0].contentDocument || $iframe[0].contentWindow.document;
      return cy.wrap(doc.body);
    });
}); 