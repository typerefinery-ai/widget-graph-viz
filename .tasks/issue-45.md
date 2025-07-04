---
issue_number: 45
title: "Implement .tasks/ folder for incremental ticket updates with metadata"
state: OPEN
author: Max Barrass
created_at: 2025-07-04T01:29:19Z
updated_at: 2025-07-04T01:29:19Z
labels:
  - enhancement
url: https://github.com/typerefinery-ai/widget-graph-viz/issues/45
---

## Summary
Implement a new workflow for ticket management:
- All ticket updates must be performed via a `.tasks/` folder in the repo.
- Each ticket update must be a markdown file with YAML metadata (issue number, title, status, timestamps, summary, etc.).
- Before updating a ticket, always fetch the latest from GitHub.
- Write/update the local `.tasks/issue-<number>.md` file with the new update and metadata.
- After local update, push the update to GitHub (using the CLI or API).
- Ensure all ticket changes are traceable and auditable.

## Acceptance Criteria
- [ ] `.tasks/` folder exists and is used for all ticket updates
- [ ] Each ticket has a corresponding markdown file with YAML metadata
- [ ] Workflow: fetch from GitHub → update local file → update GitHub → commit/push
- [ ] Rules and README updated to reflect new process
- [ ] All ticket changes are traceable and auditable

## Additional Context
This will improve traceability, auditability, and local/offline ticket management for the project.

---

## Incremental Updates

- 2025-07-04: Issue created and initial .tasks/ folder and markdown file established. 