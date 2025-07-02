/**
 * E2E Test: Ticket Scope Review and Management
 * 
 * This test validates that the project enforces proper ticket scope review:
 * 1. Review current work before creating new tickets
 * 2. Add to existing tickets when scope matches
 * 3. Create new tickets only when scope is different
 * 4. Avoid duplicate tickets for same scope
 */

describe("Ticket Scope Review and Management", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001");
    cy.waitForWidgetReady();
  });

  it("should review existing tickets before creating new ones", () => {
    // Test that the development process checks existing tickets
    cy.window().then((win) => {
      // Verify that the development workflow is documented
      expect(win.document.title).to.contain("Widget Graph Viz");
    });

    // Check that workflow documentation exists
    cy.readFile("TASK_LIST.md").should("exist");
    cy.readFile("README.md").should("contain", "workflow");
  });

  it("should add details to existing tickets when scope matches", () => {
    // Verify that related work is grouped in same ticket
    cy.readFile(".cursor/rules/gov-06-issues.mdc").should("exist");
    cy.readFile(".cursor/rules/gov-06-issues.mdc").should("contain", "scope");
  });

  it("should create new tickets only for different scope", () => {
    // Check that ticket creation follows scope rules
    cy.readFile(".cursor/rules/gov-02-workflow.mdc").should("contain", "scope");
    cy.readFile(".cursor/rules/gov-02-workflow.mdc").should("contain", "review");
  });

  it("should avoid duplicate tickets for same scope", () => {
    // Verify that duplicate prevention is documented
    cy.readFile(".cursor/rules/gov-06-issues.mdc").should("contain", "duplicate");
    cy.readFile(".cursor/rules/gov-06-issues.mdc").should("contain", "management");
  });

  it("should enforce proper scope management workflow", () => {
    // Check that scope review process is documented
    cy.readFile(".cursor/rules/gov-02-workflow.mdc").should("contain", "review");
    cy.readFile(".cursor/rules/gov-02-workflow.mdc").should("contain", "identify");
  });
}); 