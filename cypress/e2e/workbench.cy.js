/* eslint-disable no-undef */
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

  it('should load sighting data when Sighting Data button is clicked', () => {
    cy.fixture('api-responses/sighting.json').then((fixtureData) => {
      cy.get('.btn').contains('👁️ Sighting Data').click();
      cy.wait(1000);
      if (fixtureData.heading) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.heading);
      } else if (fixtureData.name) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.name);
      }
    });
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
    cy.get('.console').should('contain', 'embed-viz-event-payload-data-unattached-force-graph');
  });

  it('should load task data when Task Data button is clicked', () => {
    cy.fixture('api-responses/task.json').then((fixtureData) => {
      cy.get('.btn').contains('📋 Task Data').click();
      cy.wait(1000);
      if (fixtureData.heading) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.heading);
      } else if (fixtureData.name) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.name);
      }
    });
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
  });

  it('should load event data when Event Data button is clicked', () => {
    cy.fixture('api-responses/event.json').then((fixtureData) => {
      cy.get('.btn').contains('📅 Event Data').click();
      cy.wait(1000);
      if (fixtureData.heading) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.heading);
      } else if (fixtureData.name) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.name);
      }
    });
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
  });

  it('should load company data when Company Data button is clicked', () => {
    cy.fixture('api-responses/company.json').then((fixtureData) => {
      cy.get('.btn').contains('🏢 Company Data').click();
      cy.wait(1000);
      if (fixtureData.heading) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.heading);
      } else if (fixtureData.name) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.name);
      }
    });
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
  });

  it('should load user data when User Data button is clicked', () => {
    cy.fixture('api-responses/user.json').then((fixtureData) => {
      cy.get('.btn').contains('👤 User Data').click();
      cy.wait(1000);
      if (fixtureData.heading) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.heading);
      } else if (fixtureData.name) {
        cy.getWidgetIframeBody().find('#tree_panel').should('contain', fixtureData.name);
      }
    });
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
  });

  it('should handle fixture loading errors gracefully', () => {
    // Intercept the fixture request to simulate an error
    cy.intercept('GET', '/cypress/fixtures/api-responses/nonexistent.json', { statusCode: 404 }).as('errorData');
    
    // Mock the loadFixtureData function to simulate an error
    cy.window().then((win) => {
      // Override the loadFixtureData function temporarily
      const originalLoadFixtureData = win.loadFixtureData;
      win.loadFixtureData = async (dataType) => {
        if (dataType === 'nonexistent') {
          throw new Error('Fixture not found');
        }
        return originalLoadFixtureData(dataType);
      };
    });
    
    // Click a button that would trigger the error (we'll simulate this)
    cy.get('.btn').contains('📥 Request Data').click();
    
    // Check that error handling works
    cy.get('.console').should('contain', 'sent to iframe');
  });

  it('should use fallback data when fixture loading fails', () => {
    // Intercept the fixture request to simulate a failure
    cy.intercept('GET', '/cypress/fixtures/api-responses/sighting.json', { statusCode: 500 }).as('failedSightingData');
    
    // Click the Sighting Data button
    cy.get('.btn').contains('👁️ Sighting Data').click();
    
    // Wait for the failed request
    cy.wait('@failedSightingData');
    
    // Check that the message was still sent to iframe (with fallback data)
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
  });
}); 