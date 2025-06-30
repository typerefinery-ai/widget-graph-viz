/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Workbench Communication', () => {
  let fixtureData;

  beforeEach(() => {
    // Pre-load fixture data before setting up event listeners
    cy.fixture("src/assets/data/tree-task.json").then((data) => {
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

  it('should debug workbench and iframe loading', () => {
    // Check if workbench loads
    cy.get('.workbench').should('be.visible');
    cy.get('#widgetFrame').should('be.visible');
    
    // Check if iframe loads the widget
    cy.getWidgetIframeBody().find('[component="graphviz"]').should('be.visible');
    
    // Check if tree panel exists
    cy.getWidgetIframeBody().find('#tree_panel').should('be.visible');
    
    // Check if tree panel has SVG
    cy.getWidgetIframeBody().find('#tree_panel svg').should('exist');
    
    // Check if SVG has text elements
    cy.getWidgetIframeBody().find('#tree_panel svg text').should('exist');
    
    // Log the tree panel content for debugging
    cy.getWidgetIframeBody().find('#tree_panel').then(($panel) => {
      cy.log('Tree panel HTML:', $panel.html());
    });
    
    // Test clicking Task Data button
    cy.get('.btn').contains('📋 Task Data').click();
    cy.wait(2000);
    
    // Check if SVG text elements contain the expected text
    cy.getWidgetIframeBody().find('#tree_panel svg text').should('contain', 'Task List');
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
    cy.fixture('src/assets/data/tree-sighting.json').then((fixtureData) => {
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
    cy.fixture('src/assets/data/tree-task.json').then((fixtureData) => {
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
    cy.fixture('src/assets/data/tree-event.json').then((fixtureData) => {
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
    cy.fixture('src/assets/data/tree-company.json').then((fixtureData) => {
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
    cy.fixture('src/assets/data/tree-me.json').then((fixtureData) => {
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
    cy.intercept('GET', '/cypress/fixtures/src/assets/data/nonexistent.json', { statusCode: 404 }).as('errorData');
    
    // Click a button that would trigger the error (we'll simulate this)
    cy.get('.btn').contains('📥 Request Data').click();
    
    // Check that error handling works
    cy.get('.console').should('contain', 'sent to iframe');
  });

  it('should use fallback data when fixture loading fails', () => {
    // Intercept the fixture request to simulate a failure
    cy.intercept('GET', '/cypress/fixtures/src/assets/data/tree-sighting.json', { statusCode: 500 }).as('failedSightingData');
    
    // Click the Sighting Data button
    cy.get('.btn').contains('👁️ Sighting Data').click();
    
    // Wait for the failed request
    cy.wait('@failedSightingData');
    
    // Check that the message was still sent to iframe (with fallback data)
    cy.get('.console').should('contain', 'sent to iframe');
    cy.get('.console').should('contain', 'DATA_REFRESH');
  });
});

describe("Workbench Enhanced Event Handling", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001/workbench");
    cy.waitForWidgetReady();
  });

  describe("Manual Data Request Buttons", () => {
    it("should load sighting data when Sighting Data button is clicked", () => {
      // Click the Sighting Data button in the workbench
      cy.get("button").contains("👁️ Sighting Data").click();
      
      // Verify the tree panel displays the sighting data
      cy.get("#tree_panel").should("contain", "Evidence List");
      
      // Verify success notification
      cy.checkToast("success", "sighting data loaded successfully");
    });

    it("should load task data when Task Data button is clicked", () => {
      // Click the Task Data button in the workbench
      cy.get("button").contains("📋 Task Data").click();
      
      // Verify the tree panel displays task data
      cy.get("#tree_panel").should("contain", "Task List");
      
      // Verify success notification
      cy.checkToast("success", "task data loaded successfully");
    });

    it("should load impact data when Impact Data button is clicked", () => {
      // Click the Impact Data button in the workbench
      cy.get("button").contains("💥 Impact Data").click();
      
      // Verify the tree panel displays impact data
      cy.get("#tree_panel").should("contain", "Impact");
      
      // Verify success notification
      cy.checkToast("success", "impact data loaded successfully");
    });

    it("should load event data when Event Data button is clicked", () => {
      // Click the Event Data button in the workbench
      cy.get("button").contains("📅 Event Data").click();
      
      // Verify the tree panel displays event data
      cy.get("#tree_panel").should("contain", "Event List");
      
      // Verify success notification
      cy.checkToast("success", "event data loaded successfully");
    });

    it("should load user data when User Data button is clicked", () => {
      // Click the User Data button in the workbench
      cy.get("button").contains("👤 User Data").click();
      
      // Verify the tree panel displays user data
      cy.get("#tree_panel").should("contain", "Type Refinery User");
      
      // Verify success notification
      cy.checkToast("success", "user data loaded successfully");
    });

    it("should load company data when Company Data button is clicked", () => {
      // Click the Company Data button in the workbench
      cy.get("button").contains("🏢 Company Data").click();
      
      // Verify the tree panel displays company data
      cy.get("#tree_panel").should("contain", "Company");
      
      // Verify success notification
      cy.checkToast("success", "company data loaded successfully");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing fixture data gracefully", () => {
      // Mock the workbench to simulate missing fixture data
      cy.window().then((win) => {
        cy.stub(win, 'postMessage').callsFake((message) => {
          if (message && message.action === 'DATA_REQUEST') {
            const errorResponse = {
              ...message,
              target: 'iframe-embed_BD8EU3LCD',
              topicName: message.type,
              eventName: 'readaction',
              endpointConfig: {
                method: 'GET',
                url: 'https://flow.typerefinery.localhost:8101/viz-data/tree-sighting'
              },
              url: 'https://flow.typerefinery.localhost:8101/viz-data/tree-sighting',
              method: 'GET',
              payloadType: 'application/json',
              body: null,
              ok: false,
              error: 'Failed to load sighting data: Fixture not found'
            };
            
            win.postMessage(errorResponse, '*');
          }
        });
      });

      // Trigger data request
      cy.get("#tree_panel").click();
      
      // Verify error handling
      cy.checkToast("error", "Failed to load tree data");
    });

    it("should handle network timeout errors", () => {
      // Mock the workbench to simulate timeout
      cy.window().then((win) => {
        cy.stub(win, 'postMessage').callsFake((message) => {
          if (message && message.action === 'DATA_REQUEST') {
            const timeoutResponse = {
              ...message,
              target: 'iframe-embed_BD8EU3LCD',
              topicName: message.type,
              eventName: 'readaction',
              endpointConfig: {
                method: 'GET',
                url: 'https://flow.typerefinery.localhost:8101/viz-data/tree-sighting'
              },
              url: 'https://flow.typerefinery.localhost:8101/viz-data/tree-sighting',
              method: 'GET',
              payloadType: 'application/json',
              body: null,
              ok: false,
              error: 'Request timed out'
            };
            
            win.postMessage(timeoutResponse, '*');
          }
        });
      });

      // Trigger data request
      cy.get("#tree_panel").click();
      
      // Verify timeout error handling
      cy.checkToast("error", "Request timed out");
    });
  });
});

describe("Multi-Panel Data Loading", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001/workbench");
    cy.waitForWidgetReady();
  });

  it("should load sighting data into all three panels", () => {
    // Click the Sighting Data button
    cy.get("button").contains("👁️ Sighting Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel displays sighting data
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Evidence List");
      
      // Verify promo panel has graph visualization
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      
      // Verify scratch panel has graph visualization
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify success notification
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should load task data into all three panels", () => {
    // Click the Task Data button
    cy.get("button").contains("📋 Task Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel displays task data
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Task List");
      
      // Verify promo panel has graph visualization
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      
      // Verify scratch panel has graph visualization
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify success notification
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should load impact data into all three panels", () => {
    // Click the Impact Data button
    cy.get("button").contains("💥 Impact Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel displays impact data
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Impact");
      
      // Verify promo panel has graph visualization
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      
      // Verify scratch panel has graph visualization
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify success notification
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should load event data into all three panels", () => {
    // Click the Event Data button
    cy.get("button").contains("📅 Event Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel displays event data
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Event List");
      
      // Verify promo panel has graph visualization
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      
      // Verify scratch panel has graph visualization
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify success notification
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should load user data into all three panels", () => {
    // Click the User Data button
    cy.get("button").contains("👤 User Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel displays user data
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Type Refinery User");
      
      // Verify promo panel has graph visualization
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      
      // Verify scratch panel has graph visualization
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify success notification
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should load company data into all three panels", () => {
    // Click the Company Data button
    cy.get("button").contains("🏢 Company Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel displays company data
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Company");
      
      // Verify promo panel has graph visualization
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      
      // Verify scratch panel has graph visualization
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify success notification
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should handle data type switching and maintain all panels", () => {
    // Start with sighting data
    cy.get("button").contains("👁️ Sighting Data").click();
    cy.getWidgetIframeBody().then(($iframeBody) => {
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Evidence List");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Switch to task data
    cy.get("button").contains("📋 Task Data").click();
    cy.getWidgetIframeBody().then(($iframeBody) => {
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Task List");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Switch to impact data
    cy.get("button").contains("💥 Impact Data").click();
    cy.getWidgetIframeBody().then(($iframeBody) => {
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Impact");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
    });
    
    // Verify all panels remain functional after switching
    cy.checkToast("success", "Data loaded into all panels successfully");
  });

  it("should validate graph data conversion from tree data", () => {
    // Load sighting data (which has tree structure)
    cy.get("button").contains("👁️ Sighting Data").click();
    
    // Get iframe body for widget assertions
    cy.getWidgetIframeBody().then(($iframeBody) => {
      // Verify tree panel shows tree structure
      cy.wrap($iframeBody).find("#tree_panel").should("contain", "Evidence List");
      
      // Verify promo panel shows converted graph
      cy.wrap($iframeBody).find("#promo_panel").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg").should("exist");
      cy.wrap($iframeBody).find("#promo_panel svg circle").should("exist"); // Graph nodes
      
      // Verify scratch panel shows converted graph
      cy.wrap($iframeBody).find("#scratch_panel").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg").should("exist");
      cy.wrap($iframeBody).find("#scratch_panel svg circle").should("exist"); // Graph nodes
    });
  });
}); 