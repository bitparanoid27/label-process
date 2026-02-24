# SME-OMS: Lightweight E-commerce Order Processor 📦

A high-performance, scalable order management system designed for small-to-medium enterprises (SMEs). This project bridges the gap between manual spreadsheet tracking and expensive enterprise solutions like Linnworks, providing a robust backend for multi-channel order processing.

---

## 🚀 The Problem
Small sellers on platforms like Amazon and eBay often outgrow Google Sheets but cannot afford enterprise OMS subscriptions. This leads to "spreadsheet fatigue," manual errors, and delayed shipping. 

**SME-OMS** provides a structured, automated intermediary step that centralizes order data and prepares it for high-volume processing.

## 🛠 Tech Stack
*   **Runtime:** Node.js
*   **Language:** JavaScript (ES6+)
*   **Database:** PostgreSQL (Relational integrity for orders/SKUs)
*   **Queue Management:** [BullMQ](https://docs.bullmq.io/) (Redis-backed background processing)
*   **Architecture:** Message-driven Background Tasks

## 🏗 Key Architectural Features
*   **Asynchronous Job Processing:** Utilizes **BullMQ** to handle high-volume order ingestion without blocking the main event loop.
*   **Relational Data Modeling:** PostgreSQL schema designed to handle complex order states, customer data, and SKU mapping.
*   **Scalable Background Workers:** Designed to offload heavy tasks (like invoice generation or third-party API syncing) to background workers.

## ⚙️ Setup & Installation

### 1. Prerequisites
*   Node.js (v16+)
*   PostgreSQL Instance
*   Redis (Required for BullMQ)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/bitparanoid27/sme-order-processor.git
cd sme-order-processor
# Install dependencies
npm install
``` 

### 3. Database Setup
Ensure your PostgreSQL and Redis instances are running, then configure your connection strings (the project currently looks for standard local defaults or environment variables).

# Example for running the processor
```
npm start
```
### 📈 Current Status & Roadmap

- [x] Database Schema Design: Robust PostgreSQL tables for Orders, Line Items, and Platforms.
- [x] Order Ingestion: Core logic for receiving and storing incoming order data.
- [x] Job Queueing: Initial BullMQ setup for processing background tasks.
- [ ] Roadmap: API Integration for Amazon/eBay Webhooks.
- [ ] Roadmap: PDF Packing Slip & Label Generation.
- [ ] Roadmap: Inventory Sync logic to prevent overselling.


## Inspiration 💡
This project was born out of a need to provide SME sellers with professional-grade infrastructure. By leveraging Node.js and BullMQ, the system can handle bursts of holiday traffic (like Black Friday) that would typically crash a spreadsheet-based workflow.
Note: This project is under active development. It is intended to be used as a standalone service or a pluggable module for larger e-commerce ecosystems.

## Note:
This is still work in progress project. 
