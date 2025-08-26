# EduDesk Frontend

Modern React application built with Vite and Tailwind CSS for the EduDesk learning platform.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🛠️ Tech Stack

- **React 19.1.0** - Modern React with hooks
- **Vite 7.0.4** - Fast development and build tool
- **Tailwind CSS 4.1.11** - Utility-first CSS framework
- **React Router DOM 7.7.1** - Client-side routing
- **Lucide React 0.536.0** - Beautiful icons
- **Axios 1.11.0** - HTTP client

## 📁 Project Structure

```
src/
├── components/           # Reusable components
│   ├── Navbar.jsx       # Navigation component
│   ├── Footer.jsx       # Footer component
│   ├── FeatureCard.jsx  # Feature display card
│   └── index.js         # Component exports
├── pages/               # Page components
│   ├── Home.jsx         # Landing page
│   ├── Auth/            # Authentication pages
│   │   ├── Login.jsx    # Login form
│   │   └── Signup.jsx   # Registration form
│   └── Dashboard/       # Dashboard pages
│       └── Dashboard.jsx # Student dashboard
├── assets/              # Static assets
├── App.jsx              # Main app component with routing
└── main.jsx             # Application entry point
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Secondary**: Purple (#8B5CF6)
- **Background**: Dark Gray (#111827)
- **Surface**: Gray (#1F2937)
- **Text**: White (#FFFFFF)
- **Muted**: Gray (#9CA3AF)

### Components
- **Cards**: Rounded corners, subtle borders, hover effects
- **Buttons**: Gradient backgrounds, smooth transitions
- **Forms**: Dark inputs with blue focus states
- **Navigation**: Sticky header with backdrop blur

## 🔗 Routes

- `/` - Home page
- `/login` - User login
- `/signup` - User registration
- `/dashboard` - Student dashboard

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid System**: CSS Grid and Flexbox
- **Typography**: Responsive text sizes

## 🔧 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎯 Features Implemented

✅ Modern home page with hero section
✅ Feature showcase with icons
✅ How it works section
✅ Statistics display
✅ Testimonials
✅ Call-to-action sections
✅ Responsive navigation
✅ Authentication forms
✅ Student dashboard
✅ Dark theme design
✅ Smooth animations

## 🚀 Next Steps

- [ ] Connect to backend APIs
- [ ] Add form validation
- [ ] Implement authentication flow
- [ ] Add loading states
- [ ] Error handling
- [ ] File upload functionality
- [ ] Quiz interface
- [ ] Analytics charts
- [ ] Chatbot integration+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
