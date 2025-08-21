# Application Architecture

This document outlines the different types of applications within this project, their location in the codebase, and how they are managed.

The core logic for managing and launching all app types has been centralized in the `window/app/` module. This module is responsible for differentiating between app types and delegating to the appropriate launcher.

---

## 1. System Apps

System Apps are core components of the desktop experience that are critical for the shell's functionality.

-   **Definition:** High-privilege, essential applications. The user has specified that these should be treated with care and not be modified without good reason.
-   **Examples:** `FileExplorer`, `Settings`, `AppStore`.
-   **Location:** The component logic for these apps resides alongside other major window components (e.g., in `window/components/`).
-   **Management Logic:** The logic for launching and managing System Apps is located in `window/app/system.ts`. Currently, they are launched similarly to Internal Apps, but having a separate module allows for specialized logic in the future (e.g., preventing them from being closed, running with special permissions).

---

## 2. Internal Apps

Internal Apps are applications that run as React components within the main Electron window. They represent standard, sandboxed applications.

-   **Definition:** A standard application whose UI is built with React and rendered inside a managed `AppWindow`.
-   **Examples:** `Notebook`, `SFTP`, `Hyper`.
-   **Location:** The source code for these applications is typically found in `window/components/apps/`.
-   **Management Logic:** The logic for launching, focusing, and managing the lifecycle of these apps is located in `window/app/internal.ts`. This includes creating new window instances and ensuring only one instance of an app (that doesn't expect `initialData`) is open at a time.

---

## 3. External Apps

External Apps are separate, self-contained programs (often their own Electron apps) that are launched as child processes from the main application.

-   **Definition:** A standalone application, typically with its own `package.json` and start script (`npm start`). The App Store is capable of recognizing these apps and installing their dependencies (`npm install`).
-   **Examples:** `Chrome2`, `Chrome3`.
-   **Location:** The source code for these applications is located in `components/apps/`.
-   **Management Logic:** The logic for launching these external processes is located in `window/app/external.ts`.
-   **Important Note:** The user has indicated that this functionality is **currently not working correctly**. The code has been refactored into the new module, but the underlying bug has not been fixed, as per the instruction to focus on refactoring first.

---

This new modular structure in `window/app/` should make it easier to understand, maintain, and extend the application management system in the future.
