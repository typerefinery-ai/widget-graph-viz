describe("Local Mode Data Loading", () => {
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

  it("should detect local mode and load from local file", () => {
    // Wait for local file call and verify response
    cy.wait("@localFileCall");

    // Verify loading completes
    cy.waitForLoadingComplete();

    // Verify tree is rendered
    cy.verifyTreeRendered();
  });

  it("should load tree data from local file when local=true", () => {
    // Verify loading state appears
    cy.get("#tree_panel").should("contain", "Loading tree data...");

    // Wait for local file call and verify response
    cy.wait("@localFileCall");

    // Verify loading completes
    cy.waitForLoadingComplete();

    // Verify tree is rendered
    cy.verifyTreeRendered();

    // Verify success toast appears
    cy.checkToast("success", "sighting data loaded successfully from local file");
  });

  it("should handle local file errors gracefully", () => {
    // Mock local file failure
    cy.intercept("GET", "**/src/assets/data/tree-sighting.json", {
      statusCode: 404,
      body: { error: "File not found" },
    }).as("localFileError");

    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();

    // Wait for local file call and verify it was made
    cy.wait("@localFileError").then((interception) => {
      console.log("Local file error intercepted:", interception);
      expect(interception.response.statusCode).to.equal(404);
    });

    // Wait a moment for error processing
    cy.wait(3000);

    // Debug: Check what's in the tree panel
    cy.get("#tree_panel").then(($panel) => {
      console.log("Tree panel content:", $panel.html());
      console.log("Tree panel text:", $panel.text());
    });

    // Verify error toast appears
    cy.checkToast("error", "Failed to load sighting data from local file");

    // Verify error message in tree panel
    cy.get("#tree_panel", { timeout: 15000 }).should("contain", "Failed to load sighting data from local file");
    cy.get("#tree_panel .error-message", { timeout: 15000 }).should("exist");
  });

  it("should not retry failed local file requests", () => {
    // Mock local file to fail
    cy.intercept("GET", "**/src/assets/data/tree-sighting.json", {
      statusCode: 404,
      body: { error: "File not found" },
    }).as("localFileFailure");

    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();

    cy.wait("@localFileFailure");

    // Wait a moment for error processing
    cy.wait(3000);

    // Verify error message appears (no retry for local files)
    cy.get("#tree_panel", { timeout: 15000 }).should("contain", "Failed to load sighting data from local file");
    cy.get("#tree_panel .error-message", { timeout: 15000 }).should("exist");
  });

  it("should show error when not in local mode", () => {
    // Visit widget without local=true parameter
    cy.visit("?");
    cy.waitForWidgetReady();

    // Try to load data (should show error about not being in local mode)
    cy.get("#tree_panel").should("contain", "Not in local mode - use events for data loading");
  });
}); 