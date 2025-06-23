describe("Complete User Flow", () => {
  beforeEach(() => {
    // Set up API interception before visiting the page
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 200,
      fixture: "api-responses/sighting.json",
    }).as("initialApiCall");
    
    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();
  });

  it("should complete full user journey from load to interaction", () => {
    // Wait for initial data load and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
    cy.checkToast("success", "sighting data loaded successfully");

    // Mock task filter API call
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-task", {
      statusCode: 200,
      fixture: "api-responses/task.json",
    }).as("taskApiCall");

    // Click task filter
    cy.get("#task").click({ force: true });

    // Wait for task data load and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
    cy.checkToast("success", "task data loaded successfully");

    // Mock company filter API call
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-company", {
      statusCode: 200,
      fixture: "api-responses/sighting.json",
    }).as("companyApiCall");

    // Click company filter
    cy.get("#company").click({ force: true });

    // Wait for company data load and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();

    // Mock reload API call
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-company", {
      statusCode: 200,
      fixture: "api-responses/sighting.json",
    }).as("reloadApiCall");

    // Click reload button
    cy.get("#reload").click();

    // Wait for reload and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });

  it("should handle error recovery in complete flow", () => {
    // Mock API failure
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("apiError");

    // Visit widget
    cy.visit("?local=true");
    cy.waitForWidgetReady();

    // Wait for API call
    cy.wait("@apiError");

    // Wait for error processing
    cy.wait(3000);

    // Debug: Check what's in the tree panel
    cy.get("#tree_panel").then(($panel) => {
      console.log("Tree panel content:", $panel.html());
      console.log("Tree panel text:", $panel.text());
    });

    // Verify error message appears - be more flexible
    cy.get("#tree_panel", { timeout: 15000 }).should(($panel) => {
      const text = $panel.text();
      expect(text).to.satisfy((text) => 
        text.includes("Failed to load tree data") || 
        text.includes("Falling back to parent mode")
      );
    });
    cy.get("#tree_panel .error-message", { timeout: 15000 }).should("exist");

    // Mock successful retry
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 200,
      fixture: "api-responses/sighting.json",
    }).as("apiRetry");

    // Click reload button to trigger retry
    cy.get("#reload").click();

    // Wait for retry
    cy.wait("@apiRetry");

    // Verify recovery
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });

  it("should maintain state across filter changes", () => {
    // Wait for initial load
    cy.wait("@initialApiCall");
    cy.verifyTreeRendered();

    // Test multiple filter changes
    const filters = ["task", "impact", "event", "me", "company"];

    filters.forEach((filter, index) => {
      // Mock API call for each filter - use 'user' endpoint for 'me' filter
      const endpoint = filter === "me" ? "user" : filter;
      cy.intercept("GET", `https://flow.typerefinery.localhost:8101/viz-data/tree-${endpoint}`, {
        statusCode: 200,
        fixture: "api-responses/sighting.json",
      }).as(`${filter}ApiCall`);

      // Click filter with force
      cy.get(`#${filter}`).click({ force: true });

      // Wait for API call
      cy.wait(`@${filter}ApiCall`);

      // Verify state maintained
      cy.waitForLoadingComplete();
      cy.verifyTreeRendered();

      // Verify filter button is selected
      cy.get(`#${filter}`).should("be.checked");
    });
  });
}); 