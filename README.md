# EduDesk

EduDesk is a comprehensive educational platform designed to streamline academic management, communication, and learning experiences for students, teachers, and administrators. Built with Django (backend) and React (frontend), EduDesk offers features such as quizzes, document management, analytics, chatbots, and more.

## Features
- **User Authentication**: Secure login and registration for students and staff.
- **Quizzes**: Create, manage, and attempt quizzes with instant answer saving and analytics.
- **Document Management**: Upload, store, and manage academic documents.
- **Analytics**: Track user activity, quiz performance, and other metrics.
- **Chatbot**: AI-powered chatbot for student support and FAQs.
- **Notifications**: Real-time alerts and notifications for important events.
- **Media Handling**: Store and serve documents and media files securely.

## Technologies Used
- **Backend**: Django, Django REST Framework
- **Frontend**: React, Vite, Tailwind CSS
- **Database**: SQLite (default, can be changed)
- **AI Integration**: Google Gemini API (for chatbot and document analysis)

## Folder Structure
```
EduDesk/
├── backend/
│   ├── db.sqlite3
│   ├── manage.py
│   ├── apps/
│   │   ├── accounts/        # User authentication and management
│   │   ├── analytics/       # User and quiz analytics
│   │   ├── chatbot/         # AI chatbot logic and endpoints
│   │   ├── documents/       # Document upload and management
│   │   ├── quizzes/         # Quiz models, views, and services
│   │   └── ...
│   ├── edudesk/             # Django project settings and URLs
│   └── media/               # Uploaded documents and media files
├── frontend/
│   └── edudesk_frontend/
│       ├── public/          # Static assets
│       ├── src/
│       │   ├── api/         # API integration and registry
│       │   ├── assets/      # Images and other assets
│       │   ├── components/  # React components (Quiz, Dashboard, etc.)
│       │   ├── context/     # Context providers (notifications, auth)
│       │   ├── hooks/       # Custom React hooks
│       │   └── pages/       # Page-level components
│       ├── index.html
│       ├── package.json
│       ├── tailwind.config.js
│       └── vite.config.js
├── ppt/
│   └── EduDesk.pptx         # Project presentation
└── README.md                # Project documentation
```

## Setup Instructions

### Backend (Django)
1. Navigate to the backend folder:
   ```cmd
   cd EduDesk\backend
   ```
2. Install dependencies:
   ```cmd
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```cmd
   python manage.py migrate
   ```
4. Start the server:
   ```cmd
   python manage.py runserver
   ```

### Frontend (React)
1. Navigate to the frontend folder:
   ```cmd
   cd EduDesk\frontend\edudesk_frontend
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the development server:
   ```cmd
   npm run dev
   ```

## Usage
- Access the frontend at `http://localhost:5173` (default Vite port).
- Access the backend API at `http://localhost:8000` (default Django port).
- Configure environment variables and API keys as needed (e.g., for Gemini API).

## Contributing
Contributions are welcome! Please fork the repository, make your changes, and submit a pull request. For major changes, open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License.

## Authors
- Kahan Mistry

---
For more details, see the source code and documentation in each folder.
