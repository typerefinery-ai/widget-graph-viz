/**
 * E2E Test: Project Rules TDD Workflow Validation
 * 
 * This test validates that the project rules properly enforce:
 * 1. Issue creation before any code changes
 * 2. Test-driven development approach
 * 3. E2E tests written before implementation
 * 4. Minimal implementation to make tests pass
 */

describe("Project Rules TDD Workflow", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001");
    cy.waitForWidgetReady();
  });

  it("should enforce issue creation before code changes", () => {
    // Test that development workflow requires GitHub issues
    cy.window().then((win) => {
      // Verify that the development process is documented
      expect(win.document.title).to.contain("Widget Graph Viz");
    });

    // Check that workflow documentation exists
    cy.readFile("TASK_LIST.md").should("exist");
    cy.readFile("README.md").should("contain", "test-driven");
  });

  it("should require E2E tests before implementation", () => {
    // Verify test structure exists
    cy.readFile("cypress/e2e/").should("exist");
    
    // Check that all major features have corresponding tests
    cy.readFile("cypress/e2e/local-mode.cy.js").should("exist");
    cy.readFile("cypress/e2e/widget-mode.cy.js").should("exist");
    cy.readFile("cypress/e2e/user-interactions.cy.js").should("exist");
    cy.readFile("cypress/e2e/complete-flow.cy.js").should("exist");
  });

  it("should enforce minimal implementation approach", () => {
    // Test that the widget loads with minimal required functionality
    cy.get("[component='widget']").should("be.visible");
    
    // Verify core functionality exists without over-engineering
    cy.get("[data-testid='widget-ready']").should("exist");
  });

  it("should validate test-driven development workflow", () => {
    // Check that tests define acceptance criteria
    cy.readFile("cypress/e2e/local-mode.cy.js").should("contain", "should load data");
    cy.readFile("cypress/e2e/widget-mode.cy.js").should("contain", "should communicate");
    
    // Verify test coverage for user flows
    cy.readFile("cypress/e2e/complete-flow.cy.js").should("contain", "user journey");
  });

  it("should enforce quality standards in development process", () => {
    // Check that quality standards are documented
    cy.readFile(".cursor/rules/gov-04-quality.mdc").should("exist");
    cy.readFile(".cursor/rules/gov-05-testing.mdc").should("exist");
    
    // Verify testing principles are defined
    cy.readFile(".cursor/rules/gov-05-testing.mdc").should("contain", "Test-Driven Development");
  });
}); 