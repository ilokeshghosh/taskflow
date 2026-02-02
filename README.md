---
# 🚀 TaskFlow

**TaskFlow** is a modern task and project management application built for structured team collaboration. It helps teams plan projects, manage tasks, onboard members, track activity, and maintain a complete audit trail — all within a clean, intuitive interface.

---

## 📌 Overview

TaskFlow provides a centralized workspace where teams can:

* Organize work into projects
* Manage team members with role-based access
* Receive real-time notifications
* Maintain a complete system activity log for auditing

The application is designed with **enterprise-style workflows** in mind while keeping the UI simple and productive.

---

## 🧭 Application Modules

### 🏠 Dashboard

* High-level overview of:

  * Total projects
  * Total tasks
  * In-progress, completed, and overdue tasks
  * Status
  * Progress
  * Deadlines
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-51-38_07cY6IFHx.png)
---

### 📁 Project Management

* Create and manage projects
  * Client
  * Budget
  * Priority
  * Start date & deadline
  * Progress indicator
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-51-51_cMpji0dRf.png)
* Project actions:

  * View details
  * Change status
  * Mark as completed
  * Put on hold
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-52-03_cixVyaROE.png)
---

### 📄 Project Details View

Each project has a detailed workspace with multiple sections:

#### 🔍 Overview

* Project description
* Goals and key deliverables
* Budget and timeline
* Project manager details
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-52-47_dyBb8v73w.png)

#### 🗂 Tasks

* View all project tasks
* Filter by priority
* Add new tasks directly from the project
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-53-25_RpLKe7sjU.png)

#### 👥 Team

* View assigned team members
* Role-based display (Manager, Developer, Tester, etc.)
* Member status (Online / Offline)
* Onboard and offboard members
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-53-34_rKEOR5_eJ.png)


#### 💬 Discussions *(Planned)*

* Reserved for future team discussions

#### 📊 Analytics *(Planned)*

* Reserved for project analytics and insights

---

### 🧑‍🤝‍🧑 Team Management


* Onboard members from a user pool
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-53-45_nYGwY92hC.png)

* Visual onboarding progress indicator for better UX
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-53-55_XJ2lHhkQr.png)
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-54-23_zdi4S55aF.png)

* Offboard members and return them to the free pool

![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/image_ZU_PVwEvP.png)

![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/image(1)_08qmXTm7s.png)








---

### ✅ Task Management

* Task statuses:

  * Open
  * Completed
  * On Review
  * Hold
  * Overdue
* Task attributes:

  * Title & description
  * Priority
  * Due date
  * Assigned user
  * Status

* Create tasks directly from:

  * Sidebar
  * Project details
  * Task board


![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/image_WpIyqa8J4.png)

---

### 🔔 Notifications

* Central notification center
* Filters:

  * All
  * Unread
  * High Priority
  * Archived
* Notifications for:

  * Project creation
  * Task assignments
  * Status updates
* Sort notifications by:

  * Date
  * Priority
  * Type


![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-56-54_f0sd-Xp8H.png)



![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/image_CKT5wy1yo.png)

![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/image_xAk_-YJPc.png)

---


### 📜 System Log (Audit Log)

* Complete audit trail of system activity
* Logged actions include:

  * Project creation
  * Task creation and updates
  * Task assignment and reassignment
  * Project assignment
  * Login failures
  * Deletions and archival
* Log severity levels:

  * Information
  * Warning
  * Error
* Export system logs for auditing or reporting

![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-57-06_sjN3A5ctI.png)
![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-57-27_2qbvieEgF.png)
---

### ⚙️ User Settings

* Profile management:

  * Avatar
  * Name
  * Contact information
* View professional details:

  * Role
  * User type
* Appearance, security, and about sections

![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-57-43_t9KMfvINx.png)
---

### ℹ️ About & System Status

* Application metadata:

  * App ID
  * UI version (SAPUI5)
  * Region and subaccount
* System health indicators:

  * API Gateway
  * CAP Service
  * Database
  * Authentication
  * File storage status
* Versioning and deployment info
* Powered by SAP BTP

![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/Screenshot%20from%202026-01-31%2023-57-56_-QY3Kq0o3.png)
---

## 🛠 Tech Stack

* **Frontend:** SAPUI5 (OData V4)
* **Backend:** SAP CAP (Node.js)
* **Database:** SAP HANA / SQLite (development)
* **Platform:** SAP BTP
* **Architecture:** Service-oriented, event-driven
* **UI Theme:** Dark mode, responsive design

---

## 🔐 Key Concepts Implemented

* Role-based access control
* OData V4 bindings
* CAP service hooks
* Audit logging
* Notification handling
* Batch operations
* Modular UI5 architecture

---



## 🚧 Project Status

**Active development**

Planned enhancements:

* Discussions module
* Advanced analytics
* File attachments
* Calendar integration improvements

---

## 📦 Version

`v0.0.2`

---

## 🎯 Purpose

This project demonstrates a **real-world, enterprise-style task management system** using **SAP CAP + SAPUI5**, focusing on clean architecture, structured workflows, and scalable design.

---


---
▶️ Want to Run It Locally?

🔹 Prerequisites
Make sure you have the following installed:

- Node.js
- npm

🔹 Clone the Repository
```bash
git clone https://github.com/ilokeshghosh/taskflow.git
cd taskflow

```

🔹 Install Dependencies
```bash
npm install
```


🔹 Run the Backend (CAP Service)
```bash
npm start
```

This will:
- Start the CAP service
- Serve OData endpoints
- Launch the SAPUI5 application automatically



![alt text](https://ik.imagekit.io/8fgpvoiai/taskFlow/Documentation/image_wBqbijOYo.png)

- username : bob@local 
- password : bob

---

### Thanks for stopping by!
### Hope you enjoy exploring the project as much as I enjoyed building it 🙂