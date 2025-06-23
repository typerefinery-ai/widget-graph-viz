/// <reference types="cypress" />

describe('Workbench Communication', () => {
  beforeEach(() => {
    cy.visit('/src/html/workbench.html');
  });

  it('should load the workbench and the widget iframe', () => {
    cy.get('.workbench').should('exist');
    cy.get('#widgetFrame').should('exist');
    cy.get('#status').should('contain', 'Connected');
    cy.get('.console').should('contain', 'Workbench Started');
  });

  it('should send a message from workbench to widget and log it', () => {
    cy.get('#messageType').clear().type('custom-event');
    cy.get('#messageData').clear().type('{"action": "test", "data": "Hello from Cypress!"}', { parseSpecialCharSequences: false });
    cy.get('.btn.success').contains('Send').click();
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'custom-event');
    cy.get('.console').should('contain', 'Hello from Cypress!');
  });

  it('should receive a message from the widget and log it', () => {
    // Simulate a message from the widget to the parent
    cy.window().then((win) => {
      const iframe = win.document.getElementById('widgetFrame');
      iframe.contentWindow.postMessage({ type: 'test-from-widget', data: 'Hello Workbench!' }, '*');
    });
    cy.get('.console').should('contain', 'received from iframe');
    cy.get('.console').should('contain', 'test-from-widget');
    cy.get('.console').should('contain', 'Hello Workbench!');
  });
}); 