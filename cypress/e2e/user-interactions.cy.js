describe("User Interactions", () => {
  beforeEach(() => {
    // Set up local file interception before visiting the page
    cy.intercept("GET", "**/src/assets/data/tree-sighting.json", {
      statusCode: 200,
      fixture: "src/assets/data/tree-sighting.json",
    }).as("localFileCall");
    
    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();
  });

  it("should change tree data when filter is clicked", () => {
    // Wait for initial data load
    cy.wait("@localFileCall");

    // Mock new local file call for task data BEFORE clicking filter
    cy.intercept("GET", "**/src/assets/data/tree-task.json", {
      statusCode: 200,
      fixture: "src/assets/data/tree-task.json",
    }).as("taskLocalFileCall");

    // Click task filter radio input directly
    cy.get("#task[type='radio']").click({ force: true });

    // Wait for new local file call
    cy.wait("@taskLocalFileCall");

    // Verify tree updates
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });

  it("should show loading state during data fetch", () => {
    // Wait for initial data load
    cy.wait("@localFileCall");

    // Mock slow local file response
    cy.intercept("GET", "**/src/assets/data/tree-task.json", {
      statusCode: 200,
      fixture: "src/assets/data/tree-task.json",
      delay: 1000,
    }).as("slowLocalFileCall");

    // Click filter to trigger new data load
    cy.get("#task[type='radio']").click({ force: true });

    // Verify loading state appears
    cy.get("#tree_panel").should("contain", "Loading tree data...");

    // Wait for local file call to complete
    cy.wait("@slowLocalFileCall");

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
      // Mock local file call for each filter - use 'user' endpoint for 'me' filter
      const endpoint = filter;
      cy.intercept("GET", `**/src/assets/data/tree-${endpoint}.json`, {
        statusCode: 200,
        fixture: "src/assets/data/tree-sighting.json",
      }).as(`${filter}LocalFileCall`);

      // Click filter radio input directly
      cy.get(`#${filter}[type='radio']`).click({ force: true });

      // Wait for content to load instead of specific local file call
      cy.waitForLoadingComplete();
      cy.verifyTreeRendered();
    });
  });

  it("should reload data when reload button is clicked", () => {
    // Wait for initial data load
    cy.wait("@localFileCall");

    // Mock reload local file call BEFORE clicking reload
    cy.intercept("GET", "**/src/assets/data/tree-sighting.json", {
      statusCode: 200,
      fixture: "src/assets/data/tree-sighting.json",
    }).as("reloadLocalFileCall");

    // Click reload button
    cy.get("#reload").click();

    // Wait for reload local file call
    cy.wait("@reloadLocalFileCall");

    // Verify data reloaded
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });
}); 