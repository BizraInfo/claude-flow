# Manual Testing Plan for Interactive Init

This document outlines the manual test cases executed to verify the functionality of the new interactive `init` wizard.

## Test Environment
- **Command:** `npx tsx src/cli/main.ts init`
- **Verification Tools:** `ls -R`, `read_files`

---

## Test Case 1: Happy Path (Swarm Mode, Web App)

- **Objective:** Verify the successful creation of a project with common options.
- **Action:** Run `npx tsx src/cli/main.ts init`.
- **User Input:**
  1.  **Project Name:** `my-interactive-project`
  2.  **Use Case:** `🚀 Quick tasks & single objectives (Swarm Mode)`
  3.  **Neural-Enhanced:** `Yes`
  4.  **Project Type:** `Web Application (React + Node.js)`
  5.  **Proceed:** `Yes`
- **Expected Outcome:**
  - The script completes with a success message.
  - A directory named `my-interactive-project` is created (or files are created in the current directory, I will check the `init` logic for this).
  - The generated configuration files (`.claude/settings.json`, `claude-flow.config.json`, etc.) should reflect the choices made (e.g., neural features enabled).
  - The project structure should align with the "Web Application" template.

---

## Test Case 2: Alternative Path (Hive-Mind Mode, Research)

- **Objective:** Verify a different combination of options.
- **Action:** Run `npx tsx src/cli/main.ts init`.
- **User Input:**
  1.  **Project Name:** `my-hive-project`
  2.  **Use Case:** `🐝 Complex projects & persistent sessions (Hive-Mind Mode)`
  3.  **Neural-Enhanced:** `No`
  4.  **Project Type:** `Research Project`
  5.  **Proceed:** `Yes`
- **Expected Outcome:**
  - The script completes with a success message.
  - A directory named `my-hive-project` is created (or files are created).
  - Configuration files reflect the new choices (e.g., neural features disabled, hive-mind mode preferred).
  - The project structure should align with the "Research Project" template.

---

## Test Case 3: Cancellation Path

- **Objective:** Verify that the process exits gracefully and no files are created when the user cancels.
- **Action:** Run `npx tsx src/cli/main.ts init`.
- **User Input:**
  1.  **Project Name:** `cancelled-project`
  2.  ... (any answers for other questions) ...
  3.  **Proceed:** `No`
- **Expected Outcome:**
  - The script prints "Initialization cancelled."
  - The script exits without error.
  - No new project files or directories are created. An `ls` command should show the file system is unchanged.
