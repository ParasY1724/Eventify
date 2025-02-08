# Eventify

Event Management Website : Socket.io Implementation for Real-Time Updates

## Table of Contents

- [Overview](#overview)
- [Backend](#backend)
  - [Endpoints](#endpoints)
  - [Socket.IO Implementation](#socketio-implementation)
- [Frontend](#frontend)
- [Installation](#installation)
- [Usage](#usage)

## Overview

Eventify is a comprehensive event management platform that allows users to create, manage, and attend events with real-time updates using Socket.IO. The platform includes user authentication, event creation, and a dynamic user interface for seamless interaction.

## Backend

The backend is built with Node.js, Express, and MongoDB. It handles user authentication, event management, and real-time updates using Socket.IO.

### Endpoints

#### Auth Routes

- **POST** `/api/auth/register`
  - Register a new user.
- **POST** `/api/auth/login`
  - Login a user.
- **GET** `/api/auth/user`
  - Get the authenticated user's details.
- **PUT** `/api/auth/user`
  - Update the authenticated user's details.

#### Event Routes

- **GET** `/api/events/search`
  - Search for events.
- **POST** `/api/events`
  - Create a new event.
- **GET** `/api/events`
  - Get all events.
- **GET** `/api/events/:id`
  - Get a specific event by ID.
- **PATCH** `/api/events/:id`
  - Update a specific event by ID.
- **DELETE** `/api/events/:id`
  - Delete a specific event by ID.
- **POST** `/api/events/:id/attend`
  - Attend a specific event.
- **POST** `/api/events/:id/leave`
  - Leave a specific event.

### Socket.IO Implementation

The backend uses Socket.IO for real-time updates. The following events are handled:

- **joinEvent**: Join a specific event room.
- **leaveEvent**: Leave a specific event room.
- **disconnect**: Handle client disconnection.

## Frontend

The frontend is built with React and utilizes various contexts for managing authentication, events, and socket connections.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ParasY1724/Eventify.git
   ```
2. Navigate to the backend and install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Navigate to the frontend and install dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Usage

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
2. Start the frontend development server:
   ```bash
   cd ../frontend
   npm start
   ```

---

This README provides a comprehensive overview and detailed documentation of the Eventify project, highlighting the backend and frontend structures, socket implementations, and API endpoints.
