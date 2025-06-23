describe("Widget Mode Communication", () => {
  beforeEach(() => {
    // Visit widget without local parameter (widget mode)
    cy.visit("/");
    cy.waitForWidgetReady();
  });

  it("should request data from parent app", () => {
    // Spy on postMessage calls
    cy.window().then((win) => {
      cy.spy(win, "postMessage").as("postMessage");
    });

    // Wait for widget to initialize and make data request
    cy.wait(5000);

    // Verify postMessage was called for data request
    cy.get("@postMessage").should("have.been.called");
  });

  it("should process data from parent app", () => {
    // Mock parent sending data via postMessage
    cy.window().then((win) => {
      const mockTreeData = {
        name: "Test Root",
        children: [
          {
            name: "Test Child 1",
            children: [],
          },
          {
            name: "Test Child 2",
            children: [],
          },
        ],
      };

      // Simulate parent sending data
      win.postMessage(
        {
          type: "embed-viz-event-payload-data-tree-sighting",
          data: mockTreeData,
        },
        "*"
      );
    });

    // Verify tree renders with received data
    cy.verifyTreeRendered();
  });

  it("should handle parent app errors", () => {
    // Mock parent sending error
    cy.window().then((win) => {
      win.postMessage(
        {
          type: "embed-viz-event-payload-data-tree-sighting",
          error: "Parent app error",
        },
        "*"
      );
    });

    // Verify error toast appears
    cy.checkToast("error", "Failed to load tree data from parent application");
  });

  it("should handle missing data from parent", () => {
    // Mock parent sending message without data
    cy.window().then((win) => {
      win.postMessage(
        {
          type: "embed-viz-event-payload-data-tree-sighting",
        },
        "*"
      );
    });

    // Verify error message
    cy.get("#tree_panel").should("contain", "No tree data available from parent application");
  });
}); 