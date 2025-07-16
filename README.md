# Antoree - Online Learning Platform

![Antoree Logo](/public/ico.png)

Antoree is a modern online learning platform built with React, TypeScript, and Tailwind CSS, offering a seamless educational experience with AI-powered course recommendations, search capabilities, and a responsive user interface.

![Home Page](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi69xJk616oPg4QwgGal1YIlqqh6_-YCb25q0qmSXHtOEp_IZe4OKrLVvrS5fHWaNQzNiwHh4rCuT6PRE0AQA5SRh2dPfDsfFG6UnhIGorngJri6ah4IHTmbfKzdZ1u9hHa0_-b6ItT_1pGoTqOgC64Y1EW0hkMDFomubYIE95_wtpNi-DmfKgT109K3y8_/s1600/screenshot-home.png)

## 📋 Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Development Server](#running-the-development-server)
  - [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [AI Integration](#ai-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **Responsive Modern UI**: Built with Tailwind CSS and Framer Motion for smooth animations
- **Course Catalog**: Browse and filter courses by category, price, rating, and more
- **Search Functionality**: Fast and efficient course search with real-time suggestions
- **User Account Management**: Favorites and viewing history
- **AI-Powered Assistant**: Chat widget for personalized learning recommendations
- **Dark/Light Theme**: Full support for dark and light modes
- **Course Details**: Comprehensive course information with instructor details and reviews

## 🛠 Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **AI Integration**: Google Generative AI & Cohere
- **State Management**: React Context API
- **HTTP Client**: Axios
- **UI Components**: Headless UI

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Khangdora/antoree-fe.git
cd antoree
npm install
```

### Running the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

However, view the website directly at `https://antoree-demo.khangdora.io.vn`

### Building for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
antoree/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and other assets
│   ├── components/         # Reusable components
│   │   ├── layout/         # Layout components (Header, Footer)
│   │   ├── model/          # Model-related components
│   │   └── ui/             # UI components
│   ├── contexts/           # React contexts
│   ├── data/               # Mock data JSON files
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Entry point
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🧩 Key Components

### Layout Components
- `Header`: Navigation, search, user menu, and categories dropdown
- `Footer`: Site links, copyright, and additional information
- `Layout`: Main layout wrapper with consistent structure

### UI Components
- `CourseCard`: Displays course information in a card format
- `CategoryCard`: Shows category with icon and count
- `AIChatWidget`: AI-powered chat assistant for course recommendations
- `CourseDetailModal`: Displays detailed course information

### Pages
- `HomePage`: Landing page with featured courses and categories
- `FilterPage`: Advanced search and filtering for courses
- `CoursePage`: Detailed view of a specific course
- `FavoriteCoursesPage`: User's saved courses
- `ViewHistoryPage`: User's course viewing history

## 🤖 AI Integration

Antoree features AI-powered components that enhance the learning experience:

- **AI Chat Widget**: Provides course recommendations and answers questions
- **AI Analysis**: Analyzes courses for personalized recommendations
- **Smart Search**: Uses natural language processing for better search results

## 📦 Deployment

The project is configured for deployment with Vercel. The `vercel.json` file includes the necessary configurations for a smooth deployment process.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ by Khang Dora
