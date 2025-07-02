describe("Complete User Flow", () => {
  beforeEach(() => {
    // Visit widget with local=true parameter
    cy.visit("?local=true");
    cy.waitForWidgetReady();
  });

  it("should complete full user journey from load to interaction", () => {
    // Wait for initial data load and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
    cy.checkToast("success", "sighting data loaded successfully from local file");

    // Click task filter
    cy.get("#task[type='radio']").click({ force: true });

    // Wait for task data load and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
    cy.checkToast("success", "task data loaded successfully from local file");

    // Click company filter
    cy.get("#company[type='radio']").click({ force: true });

    // Wait for company data load and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();

    // Click reload button
    cy.get("#reload").click();

    // Wait for reload and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });

  it("should handle error recovery in complete flow", () => {
    // Wait for initial load
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();

    // Debug: Check what's in the tree panel
    cy.get("#tree_panel").then(($panel) => {
      console.log("Tree panel content:", $panel.html());
      console.log("Tree panel text:", $panel.text());
    });

    // Click reload button to trigger any potential errors
    cy.get("#reload").click();

    // Wait for reload and verify content appears
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();
  });

  it("should maintain state across filter changes", () => {
    // Wait for initial load
    cy.waitForLoadingComplete();
    cy.verifyTreeRendered();

    // Test multiple filter changes
    const filters = ["task", "impact", "event", "me", "company"];

    filters.forEach((filter, index) => {
      // Click filter with force
      cy.get(`#${filter}[type='radio']`).click({ force: true });

      // Verify state maintained
      cy.waitForLoadingComplete();
      cy.verifyTreeRendered();

      // Verify filter button is selected
      cy.get(`#${filter}`).should("be.checked");
    });
  });
}); 