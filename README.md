Family Hub Dashboard
Project Overview
The Family Hub Dashboard is a productivity application built using the SAPUI5 framework and SAP Fiori design principles. It is designed to manage household tasks, track grocery requirements, and manage a point-based reward system for family members (Tina, Anopa, and Anotida).

In a corporate context, this application serves as a prototype for a Task Management and Incentive Tracking System, demonstrating core competencies in data binding, routing, and role-based access control.

Key Features
Role-Based Access Control: Secure Admin tab protected by a Parental Gate (PIN: 1991).

Two-Way Data Binding: Real-time synchronization between the UI and JSON data models.

Component-Based Routing: Seamless navigation between the main dashboard and specific member profile views.

Responsive Design: Optimized for Desktop (Compact) and Mobile (Cozy) content densities.

Audit Trail: History log tracking all point-related transactions and completions.

Project Structure
The application follows the Model-View-Controller (MVC) architectural pattern:

webapp/manifest.json: The application descriptor file containing routing configurations, data sources, and UI5 dependencies.

webapp/Component.js: The root component that initializes the router and manages global settings.

webapp/view/: XML views defining the structure and layout of the user interface.

webapp/controller/: JavaScript controllers containing the business logic and event handlers.

webapp/model/: JSON files providing the initial data structures for chores and family points.

Technical Specifications
Framework: SAPUI5 1.120.0 (Minimum)

Libraries: sap.m, sap.f, sap.ui.core, sap.ui.layout

Architecture: MVC (Model-View-Controller)

Navigation: SAP Routing with Pattern Matching

Logic: Defensive JavaScript programming to prevent race conditions

Installation and Execution
Ensure a local web server (such as Node.js with UI5 Tooling) is installed.

Place the project folder in your workspace directory.

Access the application via the index.html file through your local server URL (e.g., http://localhost:8080/index.html).

Use the PIN 1991 to access the Parental Controls under the Admin tab.

Business Application Example
This architecture mirrors a corporate Employee Performance Dashboard.

Chores represent Key Performance Indicators (KPIs) or Assigned Tasks.

Points represent Incentive Compensation or Performance Ratings.

Admin Gate represents Management-level access for task assignment and performance review.

History represents a formal Audit Log for compliance and transparency.
