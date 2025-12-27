# GearGuard - The Ultimate Maintenance Tracker

GearGuard is a full-stack Maintenance Management System built for tracking equipment, teams, and maintenance workflows.

## Features
- **Equipment Management**: Track machines, vehicles, and devices.
- **Maintenance Requests**: Workflow from "New" to "Scrap".
- **Team Management**: Assign technicians to specific departments.
- **Dashboard**: Real-time status overview.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Prisma (ORM)
- **Database**: SQLite (Dev)

## Setup Instructions

### Prerequisites
- Node.js (LTS)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   cd server
   npm install
   
   cd ../client
   npm install
   ```

### Running the App
1. **Start Backend**:
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   node seed.js  # Optional: Seeds dummy data
   npm start     # Runs on port 3001
   ```

2. **Start Frontend**:
   ```bash
   cd client
   npm run dev   # Runs on port 5173/5174
   ```

3. Open your browser and navigate to the local URL provided by Vite.

## Project Structure
- `/server`: API and Database logic.
- `/client`: React frontend application.
