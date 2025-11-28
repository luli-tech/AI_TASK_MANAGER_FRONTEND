# Task Manager - Frontend Integration Guide

## Overview

This Next.js frontend is fully integrated with the Rust backend API. The application includes:

- ✅ **Authentication**: JWT-based auth with automatic token refresh
- ✅ **Task Management**: Full CRUD operations with real-time updates
- ✅ **Notifications**: SSE-based real-time notifications
- ✅ **Messaging**: User-to-user messaging system
- ✅ **Google OAuth**: Social login integration

## Architecture

### API Client (`lib/api-client.ts`)
- Automatic JWT token management
- Token refresh on 401 errors
- Request/response interceptors
- Built-in caching (5 min default)
- Retry logic with exponential backoff

### State Management (`lib/store.ts`)
- **Zustand** stores for global state
- **Auth Store**: User authentication and session
- **Task Store**: Task CRUD operations
- **Notification Store**: Notifications + SSE subscriptions
- **Chat Store**: Messaging functionality
- **UI Store**: Theme and sidebar state

### React Query Hooks (`hooks/`)
- `use-tasks.ts`: Task operations with optimistic updates
- Automatic cache invalidation
- Error handling and retry logic

## Configuration

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://task-manager-84ag.onrender.com
```

For local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## API Endpoints

All endpoints are configured in the stores and match the backend API:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and revoke tokens
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback

### Tasks
- `GET /api/tasks` - List tasks (with filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `PATCH /api/tasks/:id/status` - Update task status
- `DELETE /api/tasks/:id` - Delete task

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/stream` - SSE stream for real-time updates
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### Messages
- `GET /api/messages/conversations` - List conversations
- `GET /api/messages/conversations/:userId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read

## Running the Application

### Development

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3001` (or next available port).

### Production Build

```bash
npm run build
npm start
```

## Features

### 🔐 Authentication Flow

1. User registers or logs in
2. Backend returns `access_token` and `refresh_token`
3. Tokens stored in localStorage
4. Access token sent with every request
5. On 401, automatically refresh token
6. On refresh failure, redirect to login

### 📋 Task Management

- **Create**: Use the "New Task" button
- **Update**: Click on any task to edit
- **Status**: Drag-and-drop or use status dropdown
- **Delete**: Click delete icon
- **Filter**: By status, priority, due date

### 🔔 Real-time Notifications

- SSE connection established on login
- Notifications appear instantly
- Bell icon shows unread count
- Click to mark as read

### 💬 Messaging

- Direct messages between users
- Conversation list with unread counts
- Real-time message delivery

## Component Structure

```
app/
├── login/          # Login page
├── signup/         # Registration page
├── dashboard/      # Main dashboard
├── tasks/          # Task management
├── notifications/  # Notification center
├── chat/           # Messaging
└── settings/       # User settings

components/
├── auth/           # Auth forms
├── tasks/          # Task components
├── layout/         # App layout
└── ui/             # Reusable UI components

lib/
├── api-client.ts   # API client
├── store.ts        # Zustand stores
├── types.ts        # TypeScript types
└── utils.ts        # Utilities

hooks/
└── use-tasks.ts    # React Query hooks
```

## Type Safety

All API responses are typed with TypeScript interfaces in `lib/types.ts`:

- `User`, `UserResponse`
- `Task`, `CreateTaskRequest`, `UpdateTaskRequest`
- `Notification`, `NotificationPreferences`
- `Message`, `Conversation`
- `AuthTokens`

## Error Handling

- API errors are caught and displayed to users
- Network errors trigger automatic retries
- 401 errors trigger token refresh
- Failed refresh redirects to login

## Security

- JWT tokens in localStorage
- Automatic token refresh
- Secure HTTP-only cookies (backend)
- CORS configured on backend
- Protected routes with auth checks

## Troubleshooting

### "Session expired" errors
- Check if backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Clear localStorage and re-login

### Tasks not loading
- Check network tab for API errors
- Verify authentication token is valid
- Check backend logs

### Notifications not appearing
- Ensure SSE connection is established
- Check browser console for errors
- Verify backend notification service is running

## Next Steps

1. ✅ Configure backend URL
2. ✅ Test authentication flow
3. ✅ Test task operations
4. ✅ Test notifications
5. ✅ Test messaging
6. 🔄 Deploy to production

## Support

For issues or questions:
- Check backend API documentation
- Review browser console for errors
- Verify environment variables are set correctly
