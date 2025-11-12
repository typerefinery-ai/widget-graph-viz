describe("Overview Visualization Module", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001/?local=true&viz=overview");
    cy.waitForWidgetReady();
  });

  it("renders simulation nodes and links", () => {
    cy.window().then((win) => {
      const active = win.Widgets.Loader.getActiveInstance();
      expect(active, "active visualization").to.exist;
      expect(active.id).to.equal("overview");
    });
    cy.get(".overview-simulation", { timeout: 10000 }).should("exist");
    cy.get(".overview-simulation svg").should("exist");
    cy.get(".overview-node").should("have.length.greaterThan", 0);
    cy.get(".overview-link").should("have.length.greaterThan", 0);
  });
});

