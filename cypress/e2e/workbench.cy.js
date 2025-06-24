/// <reference types="cypress" />

describe('Workbench Communication', () => {
  let fixtureData;

  beforeEach(() => {
    // Pre-load fixture data before setting up event listeners
    cy.fixture("api-responses/task.json").then((data) => {
      fixtureData = data;
    });

    cy.visit('/workbench');
    
    // Listen for DATA_REQUEST from widget iframe and respond with fixture
    cy.window().then((win) => {
      win.addEventListener('message', (event) => {
        let eventData = event.data;
        
        // Handle both string and object payloads
        if (typeof eventData === 'string') {
          try {
            eventData = JSON.parse(eventData);
          } catch (e) {
            console.warn('Failed to parse event data as JSON:', eventData);
            return;
          }
        }
        
        if (
          eventData &&
          eventData.action === 'DATA_REQUEST' &&
          eventData.payload &&
          eventData.payload.id === 'scratch'
        ) {
          win.postMessage({
            ...eventData,
            target: 'iframe-embed_BD8EU3LCD',
            topicName: eventData.type,
            eventName: 'readaction',
            endpointConfig: {
              method: 'GET',
              url: 'https://flow.typerefinery.localhost:8101/viz-data/tree-task'
            },
            url: 'https://flow.typerefinery.localhost:8101/viz-data/tree-task',
            method: 'GET',
            payloadType: 'application/json',
            body: null,
            ok: true,
            data: fixtureData
          }, '*');
        }
      });
    });
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
    // Wait for the widget to load and potentially send a DATA_REQUEST
    cy.wait(2000);
    
    // Check if the workbench received and responded to a DATA_REQUEST
    cy.get('.console').should('contain', 'received from iframe');
    cy.get('.console').should('contain', 'Widget requesting data, responding with mock data');
  });
}); 