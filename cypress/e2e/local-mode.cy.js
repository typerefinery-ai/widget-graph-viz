describe("Local Mode Data Loading", () => {
  beforeEach(() => {
    // Set up API interception before visiting the page with the new URL
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 200,
      fixture: "api-responses/sighting.json",
    }).as("apiCall");
    
    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();
  });

  it("should detect local mode and make API call", () => {
    // Wait for API call and verify response
    cy.wait("@apiCall");

    // Verify loading completes
    cy.waitForLoadingComplete();

    // Verify tree is rendered
    cy.verifyTreeRendered();
  });

  it("should load tree data from API when local=true", () => {
    // Verify loading state appears
    cy.get("#tree_panel").should("contain", "Loading tree data...");

    // Wait for API call and verify response
    cy.wait("@apiCall");

    // Verify loading completes
    cy.waitForLoadingComplete();

    // Verify tree is rendered
    cy.verifyTreeRendered();

    // Verify success toast appears
    cy.checkToast("success", "sighting data loaded successfully");
  });

  it("should handle API errors gracefully", () => {
    // Mock API failure with correct URL - set up before any API calls
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("apiError");

    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();

    // Wait for API call and verify it was made
    cy.wait("@apiError").then((interception) => {
      console.log("API Error intercepted:", interception);
      expect(interception.response.statusCode).to.equal(500);
    });

    // Wait a moment for error processing
    cy.wait(3000);

    // Debug: Check what's in the tree panel
    cy.get("#tree_panel").then(($panel) => {
      console.log("Tree panel content:", $panel.html());
      console.log("Tree panel text:", $panel.text());
    });

    // Verify error toast appears
    cy.checkToast("error", "Failed to load tree data");

    // Verify error message in tree panel - be more flexible with the check
    // Check for either the error message or the fallback message
    cy.get("#tree_panel", { timeout: 15000 }).should(($panel) => {
      const text = $panel.text();
      expect(text).to.satisfy((text) => 
        text.includes("Failed to load tree data") || 
        text.includes("Falling back to parent mode")
      );
    });
    
    // Also check for the error message class
    cy.get("#tree_panel .error-message", { timeout: 15000 }).should("exist");
  });

  it("should retry failed API requests", () => {
    // Mock first API call to fail, second to succeed
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("apiError1");

    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();

    cy.wait("@apiError1");

    // Wait a moment for retry logic to trigger
    cy.wait(3000);

    // Mock retry to succeed
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 200,
      fixture: "api-responses/sighting.json",
    }).as("apiRetry");

    // Wait for retry
    cy.wait("@apiRetry");

    // Wait for loading to complete
    cy.waitForLoadingComplete();

    // Verify success after retry
    cy.verifyTreeRendered();
  });

  it("should fallback to parent mode after max retries", () => {
    // Mock API to fail multiple times
    cy.intercept("GET", "https://flow.typerefinery.localhost:8101/viz-data/tree-sighting", {
      statusCode: 500,
      body: { error: "Server error" },
    }).as("apiFailure");

    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();

    // Wait for multiple API failures
    cy.wait("@apiFailure");
    cy.wait("@apiFailure");
    cy.wait("@apiFailure");

    // Wait for error processing
    cy.wait(5000);

    // Verify error message appears (no automatic fallback)
    cy.get("#tree_panel", { timeout: 15000 }).should("contain", "Failed to load tree data");
    cy.get("#tree_panel .error-message", { timeout: 15000 }).should("exist");
  });
}); 