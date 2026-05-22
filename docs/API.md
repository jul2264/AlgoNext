# AlgoNext API Reference

> Base URL: `http://localhost:8000/api/v1`

## Authentication

All API endpoints (except the Clerk webhook) require a valid Clerk JWT token in the `Authorization` header:

```
Authorization: Bearer <clerk_session_token>
```

## Endpoints

### Curriculum

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/curriculum/levels/` | List all levels |
| GET | `/curriculum/levels/{id}/` | Level detail with chapters |
| GET | `/curriculum/chapters/{id}/` | Chapter detail with categories |
| GET | `/curriculum/categories/{id}/` | Category detail with problems |

### Problems

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/problems/` | Any | List/filter/search problems |
| GET | `/problems/{slug}/` | Any | Problem detail + starter code |
| POST | `/problems/` | Teacher | Create new problem |
| PUT | `/problems/{slug}/` | Teacher | Update problem |
| DELETE | `/problems/{slug}/` | Teacher | Delete problem |

### Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/submissions/` | Submit code for execution |
| GET | `/submissions/{id}/` | Get submission result |
| GET | `/submissions/problem/{slug}/` | Submission history for a problem |

### Progress

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/progress/` | Overall progress summary |
| GET | `/progress/streak/` | Current streak data |
| GET | `/progress/heatmap/` | Activity heatmap data |
| GET | `/progress/badges/` | Earned badges |
| GET | `/progress/leaderboard/` | Global leaderboard |

### Adaptive Learning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/adaptive/recommendations/` | Recommended next problems |
| GET | `/adaptive/skill-profile/` | Skill scores per category |
| GET | `/adaptive/learning-path/` | Suggested learning path |

### Faculty

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/faculty/classes/` | Teacher | List teacher's classes |
| POST | `/faculty/classes/` | Teacher | Create a class |
| POST | `/faculty/classes/{id}/join/` | Student | Join class with code |
| GET | `/faculty/classes/{id}/students/` | Teacher | Class roster + progress |
| POST | `/faculty/assignments/` | Teacher | Create assignment |
| GET | `/faculty/analytics/student/{id}/` | Teacher | Student analytics |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users/webhook/` | Clerk webhook (user sync) |
| GET | `/users/me/` | Current user profile |
| PATCH | `/users/me/` | Update profile |
