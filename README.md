# Real-time Chat Application (ABP Framework & ReactJS)

A modern, high-performance real-time chat application built using a decoupled architecture. It leverages the **ABP Framework (.NET 10)** on the backend, **PostgreSQL** for persistence, and **ReactJS (Vite)** styled with **Tailwind CSS** for a premium, dark-themed glassmorphism user interface.

---

## 🚀 Key Features

- **JWT Authentication**: Secure user authentication using OpenIddict (Password Grant Flow) directly integrated into the React frontend.
- **Real-time Messaging**: Instant message delivery and syncing via ASP.NET Core SignalR WebSockets.
- **Group Channels**: Create and join channels for group discussions (seeded with `# General`, `# Random`, `# ABP Framework`, and `# React & Tailwind` defaults).
- **Direct Messages (DMs)**: Private one-on-one chats between registered users.
- **Presence Indicators**: Live online/offline status indicators in the sidebar for all registered users.
- **Typing Indicators**: Real-time feedback showing when other users are currently typing in a shared room or private chat (e.g., *"John is typing..."*).
- **Unread Message Badges**: Real-time unread message counts displayed next to inactive channels and direct message threads in the sidebar. Count indicators clear immediately upon selection.

---

## 🛠️ Technology Stack

### Backend
- **ABP Framework 10.0** (Domain-Driven Design architecture)
- **ASP.NET Core Web API**
- **ASP.NET Core SignalR** (WebSockets connection hub)
- **Entity Framework Core & Npgsql** (PostgreSQL integration)
- **OpenIddict** (JWT OAuth2 Token provider)

### Frontend
- **ReactJS (Vite)**
- **Tailwind CSS** (Custom dark-mode glassmorphic interface)
- **@microsoft/signalr** (SignalR client library)
- **Axios** (REST API client)
- **Lucide React** (Modern iconography)

---

## 📁 Repository Structure

```
MessageApp/
│
├── Apis/MessageApp/                       # ABP Backend Solution
│   ├── src/
│   │   ├── MessageApp.Domain/             # Domain Models (ChatChannel, ChatMessage, Presence)
│   │   ├── MessageApp.EntityFrameworkCore/# DB Context, Fluent API, Migrations
│   │   ├── MessageApp.Application/        # Application Services (ChatAppService logic)
│   │   ├── MessageApp.HttpApi/            # Explicit Controllers (ChatController API endpoints)
│   │   ├── MessageApp.HttpApi.Host/       # Web API Host (SignalR Hubs, CORS, JWT config)
│   │   └── MessageApp.DbMigrator/         # Database Migrator (PostgreSQL schema & seed data)
│
└── react-client/                          # React Frontend Client
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx            # JWT Login/Logout & Token injection
    │   │   └── ChatContext.jsx            # SignalR connections, message states & unread counts
    │   ├── components/
    │   │   ├── Login.jsx                  # Sign In page (Glassmorphism layout)
    │   │   ├── Register.jsx               # Sign Up page
    │   │   └── ChatDashboard.jsx          # Main Chat UI (Sidebar, Chat logs, inputs)
    │   └── services/
    │       └── api.js                     # REST API client configuration
```

---

## ⚙️ Getting Started

### Prerequisites
- **.NET 10.0 SDK**
- **Node.js (v18+)** and npm
- **PostgreSQL** instance running locally

---

### Step-by-Step Setup

#### 1. Database Setup & Seeding
1. Make sure your PostgreSQL server is active.
2. Open `Apis/MessageApp/src/MessageApp.DbMigrator/appsettings.json` and verify the connection string:
   ```json
   "ConnectionStrings": {
     "Default": "Host=localhost;Port=5432;Database=MessageApp;User ID=your_username;Password=your_password;"
   }
   ```
3. Run the migrations and seed data project to automatically initialize the database schema and admin account:
   ```bash
   cd Apis/MessageApp/src/MessageApp.DbMigrator
   dotnet run
   ```
   *(This will create the PostgreSQL database, apply migrations, and seed default channels and admin user `admin` with password `1q2w3E*`).*

#### 2. Start the Backend API
Navigate to the HttpApi Host project and run the server:
```bash
cd Apis/MessageApp/src/MessageApp.HttpApi.Host
dotnet run
```
- The backend will start on `https://localhost:44342` (and `http://localhost:29562`).
- Swagger API documentation is available at `https://localhost:44342/swagger`.

#### 3. Start the Frontend Client
Navigate to the React client directory, install dependencies, and start the development server:
```bash
cd react-client
npm install
npm run dev
```
- The client will run locally at `http://localhost:5173`.

---

## 🧪 Testing Real-Time Features (User Guide)

To verify the real-time capabilities of the application, it is recommended to open **two separate browser windows** (e.g., normal window + private/incognito window):

1. **Log in or Register**:
   - In window 1, log in using the default admin account:
     - **Username**: `admin`
     - **Password**: `1q2w3E*`
   - In window 2 (incognito), click **Sign Up** to register a new account (e.g., `user1` with password `Password123!`).
2. **Check Online Status**:
   - Verify that the green dot presence indicator is visible in the sidebar next to each user's name when they are online.
3. **Send Group Messages**:
   - Select `# General` on both browsers. Send a message and watch it sync instantly in both windows.
4. **Send Direct Messages**:
   - On the `admin` screen, click `user1` in the Direct Messages list.
   - On the `user1` screen, click `admin`.
   - Send private messages to ensure they are secure and visible only to the participating users.
5. **Observe Typing Indicators**:
   - Type in the input field of one window; you will immediately see `[User] is typing...` above the input area of the other window.
6. **Observe Unread Message Badges**:
   - In window 1 (`admin`), select `# Random` or stay in a DM.
   - In window 2 (`user1`), select `# General` and send a message.
   - You will see a circular badge next to `# General` in the sidebar of window 1 displaying the count of unread messages. Clicking the channel immediately clears the badge.
