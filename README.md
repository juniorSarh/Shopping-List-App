<div align="center">

![Shopping List App Banner](https://socialify.git.ci/juniorSarh/Shopping-List-App/image?language=1&owner=1&name=1&stargazers=1&theme=Light)

# 🛒 Shopping List App

*A modern, responsive shopping list management application built with React, TypeScript, and Redux Toolkit*

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Redux Toolkit](https://img.shields.io/badge/Redux%20Toolkit-2.9.0-purple.svg)](https://redux-toolkit.js.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.12-646CFF.svg)](https://vitejs.dev/)

</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [📚 API Documentation](#-api-documentation)
- [🧭 Routing](#-routing)
- [🎨 UI Components](#-ui-components)
- [🔐 Authentication](#-authentication)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🔐 Authentication System
- **User Registration**: Sign up with email, password, name, surname, and cell number
- **Secure Login**: Password hashing using bcryptjs for security
- **Protected Routes**: Role-based access control for authenticated and guest users
- **Session Management**: Persistent authentication state across page refreshes

### 📝 Shopping List Management
- **Create Lists**: Multiple shopping lists with customizable titles, categories, images, and notes
- **Responsive Grid Layout**: Adaptive design (1 column mobile → 2 columns tablet → 4 columns desktop)
- **List Cards**: Rich metadata display including item counts and notes
- **Share Functionality**: Web Share API with clipboard fallback for easy sharing

### 🛍️ Item Management
- **CRUD Operations**: Complete create, read, update, delete functionality for items
- **Rich Item Data**: Name, quantity, category, notes, and image support
- **Search & Filter**: URL-driven search functionality for finding items quickly
- **Sorting**: Extensible sorting system (name, category, date)

### 🎯 User Experience
- **Modern UI**: Clean, intuitive interface with smooth transitions
- **Loading States**: Visual feedback during data operations
- **Error Handling**: Comprehensive error messages and fallbacks
- **Mobile Responsive**: Optimized for all device sizes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/juniorSarh/Shopping-List-App.git
   cd Shopping-List-App
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the project root:
   ```env
   VITE_API_URL=https://shoppinglist-json-server.onrender.com
   ```

4. **Database Setup**
   
   Create a `db.json` file in the project root:
   ```json
   {
     "users": [],
     "lists": [],
     "items": []
   }
   ```

5. **Start Development Server**
   ```bash
   # Start the backend (optional, uses render.com by default)
   npx json-server --watch db.json --port 3000 --delay 400
   
   # Start the frontend
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library with modern hooks and concurrent features
- **TypeScript 5.8** - Type-safe JavaScript development
- **Redux Toolkit 2.9.0** - State management with Redux patterns
- **React Router 7.9.3** - Client-side routing with nested routes
- **Vite 7.1.12** - Fast build tool and development server
- **React Icons 5.5.0** - Icon library for UI components
- **Axios 1.12.2** - HTTP client for API requests

### Backend & Security
- **JSON Server** - REST API with database persistence
- **bcryptjs 3.0.2** - Password hashing for authentication

### Development Tools
- **ESLint** - Code linting and formatting
- **TypeScript Compiler** - Type checking and compilation

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── LoginForm.tsx    # Login form component
│   ├── SignupForm.tsx   # Registration form component
│   ├── Header.tsx       # Application header
│   ├── Footer.tsx       # Application footer
│   └── ...
├── features/            # Redux Toolkit feature slices
│   ├── auth/
│   │   ├── loginSlice.ts      # Login state and actions
│   │   └── registerSlice.ts   # Registration state and actions
│   ├── lists/
│   │   └── shoppingListsSlice.ts  # Shopping list CRUD
│   └── items/
│       └── itemsSlice.ts     # Item CRUD operations
├── modules.css/         # CSS Modules for component styling
│   ├── auth.module.css       # Authentication form styles
│   ├── shoppinglist.module.css
│   └── ...
├── pages/               # Page components
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login page
│   ├── SignUp.tsx       # Registration page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Profile.tsx      # User profile
│   └── Share.tsx        # Shared list view
├── types/               # TypeScript type definitions
│   └── shopping.ts      # Shopping-related types
├── routes/              # Route protection components
│   └── ProtectedRoute.tsx
├── App.tsx              # Main application component
└── store.ts             # Redux store configuration
```

---

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Backend API endpoint (defaults to render.com deployment)

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 📚 API Documentation

### Base URL
```
https://shoppinglist-json-server.onrender.com
```

### Endpoints

#### Users
- `GET /users?email=:email` - Find user by email
- `POST /users` - Create new user

#### Shopping Lists
- `GET /lists?userId=:userId` - Get user's shopping lists
- `POST /lists` - Create new shopping list
- `PATCH /lists/:id` - Update shopping list
- `DELETE /lists/:id` - Delete shopping list

#### Items
- `GET /items?listId=:listId` - Get items for a list
- `POST /items` - Create new item
- `PATCH /items/:id` - Update item
- `DELETE /items/:id` - Delete item

### Data Models

#### User
```typescript
{
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  surname: string;
  cellNumber: string;
}
```

#### Shopping List
```typescript
{
  id: string;
  userId: string;
  title: string;
  category?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: number;
}
```

#### Item
```typescript
{
  id: string;
  listId: string;
  name: string;
  quantity: number;
  category?: string;
  notes?: string;
  images?: string[];
  createdAt: number;
}
```

---

## 🧭 Routing

The application uses React Router with protected routes:

### Public Routes
- `/` - Home/Landing page
- `/login` - User login
- `/signup` - User registration

### Protected Routes (Authentication Required)
- `/dashboard` - Main dashboard with shopping lists
- `/dashboard/lists/:listId/items` - Items view for a specific list
- `/profile` - User profile management

### Special Routes
- `/share/:listId` - Public view of shared shopping list

---

## 🎨 UI Components

### Authentication Forms
- Centered, responsive design
- Form validation and error handling
- Loading states during submission
- Password strength indicators

### Dashboard
- Responsive grid layout for shopping lists
- Card-based UI with hover effects
- Quick actions for list management
- Search and filter capabilities

### Item Management
- Table view with sorting capabilities
- Modal forms for adding/editing items
- Bulk operations support
- Image upload and preview

---

## 🔐 Authentication

### Security Features
- **Password Hashing**: Using bcryptjs for secure password storage
- **Protected Routes**: Server-side and client-side route protection
- **Session Management**: Persistent authentication state
- **Input Validation**: Client-side and server-side validation

### Authentication Flow
1. **Registration**: User creates account with hashed password
2. **Login**: Credentials validated against stored hash
3. **Session**: Authentication token stored in Redux state
4. **Authorization**: Protected routes check authentication status

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Redux Toolkit team for state management solutions
- Vite team for the fast development experience
- JSON Server for providing a simple backend solution

---

<div align="center">

**Built with ❤️ by [Junior Sarh](https://github.com/juniorSarh)**

[⭐ Star this repo](https://github.com/juniorSarh/Shopping-List-App) | [🐛 Report Issues](https://github.com/juniorSarh/Shopping-List-App/issues) | [💡 Feature Requests](https://github.com/juniorSarh/Shopping-List-App/issues/new)

</div>