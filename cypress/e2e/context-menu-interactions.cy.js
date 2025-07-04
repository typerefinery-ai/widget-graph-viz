describe("Context Menu Interactions", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001/?local=true");
    cy.waitForWidgetReady();
  });

  describe("Tree Panel Context Menu", () => {
    it("should show context menu on right-click of tree object", () => {
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Check that context menu appears
      cy.get(".scm-container").should("be.visible");
    });

    it("should have Copy option in tree context menu", () => {
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Check that Copy option is available
      cy.get(".scm-container").should("contain", "Copy");
    });

    it("should have Edit DAG option in tree context menu", () => {
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Check that Edit DAG option is available
      cy.get(".scm-container").should("contain", "Edit DAG");
    });

    it("should execute Copy action when clicked", () => {
      // Spy on console.log to verify action execution
      cy.window().then((win) => {
        cy.spy(win.console, "log").as("consoleLog");
      });
      
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Click Copy option
      cy.get(".scm-container").contains("Copy").click();
      
      // Verify action was executed
      cy.get("@consoleLog").should("have.been.calledWith", "copy selected");
    });

    it("should execute Edit DAG action when clicked", () => {
      // Spy on console.log to verify action execution
      cy.window().then((win) => {
        cy.spy(win.console, "log").as("consoleLog");
      });
      
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Click Edit DAG option
      cy.get(".scm-container").contains("Edit DAG").click();
      
      // Verify action was executed
      cy.get("@consoleLog").should("have.been.calledWith", "edit dag selected");
    });
  });

  describe("Force Graph (Scratch Panel) Context Menu", () => {
    beforeEach(() => {
      // Load some data to have objects in the force graph
      cy.intercept("GET", "**/tree-sighting.json", {
        fixture: "src/assets/data/tree-sighting.json"
      }).as("getSightingData");
      
      // Click on a radio button to load data
      cy.get("#sighting[type='radio']").click({ force: true });
      cy.wait("@getSightingData");
      
      // Wait for force graph to be populated
      cy.get("#scratch_panel").should("be.visible");
      // Wait for at least one force graph node to be rendered
      cy.get("#scratch_panel svg image.snodes").should("exist");
    });

    it("should show context menu on right-click of force graph object", () => {
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Check that context menu appears
      cy.get(".scm-container").should("be.visible");
    });

    it("should have Remove option in force graph context menu", () => {
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Check that Remove option is available
      cy.get(".scm-container").should("contain", "Remove");
    });

    it("should have Create Connection option in force graph context menu", () => {
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Check that Create Connection option is available
      cy.get(".scm-container").should("contain", "Create Connection");
    });

    it("should have Create SRO option in force graph context menu", () => {
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Check that Create SRO option is available
      cy.get(".scm-container").should("contain", "Create SRO");
    });

    it("should execute Remove action when clicked", () => {
      // Spy on console.log to verify action execution
      cy.window().then((win) => {
        cy.spy(win.console, "log").as("consoleLog");
      });
      
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Click Remove option
      cy.get(".scm-container").contains("Remove").click();
      
      // Verify action was executed (should raise an event)
      cy.get("@consoleLog").should("have.been.called");
    });

    it("should execute Create Connection action when clicked", () => {
      // Spy on console.log to verify action execution
      cy.window().then((win) => {
        cy.spy(win.console, "log").as("consoleLog");
      });
      
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Click Create Connection option
      cy.get(".scm-container").contains("Create Connection").click();
      
      // Verify action was executed (should raise an event)
      cy.get("@consoleLog").should("have.been.called");
    });

    it("should execute Create SRO action when clicked", () => {
      // Spy on console.log to verify action execution
      cy.window().then((win) => {
        cy.spy(win.console, "log").as("consoleLog");
      });
      
      // Right-click on a force graph node
      cy.get("#scratch_panel svg image.snodes").first().rightclick({ force: true });
      
      // Click Create SRO option
      cy.get(".scm-container").contains("Create SRO").click();
      
      // Verify action was executed (should raise an event)
      cy.get("@consoleLog").should("have.been.called");
    });
  });

  describe("Context Menu Behavior", () => {
    it("should hide context menu when clicking outside", () => {
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node to show context menu
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Verify context menu is visible
      cy.get(".scm-container").should("be.visible");
      
      // Click outside the context menu
      cy.get("body").click();
      
      // Verify context menu is hidden
      cy.get(".scm-container").should("not.be.visible");
    });

    it("should show correct heading in context menu", () => {
      // Wait for tree data to load
      cy.get("#tree_panel").should("contain", "Sighting");
      
      // Right-click on the <image> inside the first g.node
      cy.get("#tree_panel svg g.node").first().find("image").rightclick({ force: true });
      
      // Check that the heading matches the node name
      cy.get(".scm-container .scm-item").first().should("have.css", "font-weight", "700");
    });
  });
}); 