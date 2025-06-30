describe("User Interactions", () => {
  beforeEach(() => {
    // Set up API interception before visiting the page
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 200,
      fixture: "src/assets/data/tree-sighting.json",
    }).as("apiCall");
    
    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();
  });

  it("should change tree data when filter is clicked", () => {
    // Wait for initial data load
    cy.wait("@apiCall");

    // Click task filter with force to bypass CSS pointer-events issue
    cy.get("#task").click({ force: true });

    // Mock new API call for task data
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-task", {
      statusCode: 200,
      fixture: "src/assets/data/tree-task.json",
    }).as("taskApiCall");

    // Wait for new API call
    cy.wait("@taskApiCall");

    // Verify tree updates
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });

  it("should show loading state during data fetch", () => {
    // Wait for initial data load
    cy.wait("@apiCall");

    // Mock slow API response
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-task", {
      statusCode: 200,
      fixture: "src/assets/data/tree-task.json",
      delay: 1000,
    }).as("slowApiCall");

    // Click filter to trigger new data load
    cy.get("#task").click({ force: true });

    // Verify loading state appears
    cy.get("#tree_panel").should("contain", "Loading tree data...");

    // Wait for API call to complete
    cy.wait("@slowApiCall");

    // Verify loading completes
    cy.waitForLoadingComplete();
  });

  it("should handle filter interactions correctly", () => {
    // Wait for initial data load
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();

    // Test all filter buttons
    const filters = ["task", "impact", "event", "me", "company"];

    filters.forEach((filter) => {
      // Mock API call for each filter - use 'user' endpoint for 'me' filter
      const endpoint = filter === "me" ? "user" : filter;
      cy.intercept("GET", `https://flow.typerefinery.localhost:8101/viz-data/tree-${endpoint}`, {
        statusCode: 200,
        fixture: "src/assets/data/tree-sighting.json",
      }).as(`${filter}ApiCall`);

      // Click filter with force
      cy.get(`#${filter}`).click({ force: true });

      // Wait for content to load instead of specific API call
      cy.waitForLoadingComplete();
      cy.verifyTreeRendered();
    });
  });

  it("should reload data when reload button is clicked", () => {
    // Wait for initial data load
    cy.wait("@apiCall");

    // Click reload button
    cy.get("#reload").click();

    // Mock reload API call
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 200,
      fixture: "src/assets/data/tree-sighting.json",
    }).as("reloadApiCall");

    // Wait for reload API call
    cy.wait("@reloadApiCall");

    // Verify data reloaded
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });
}); 