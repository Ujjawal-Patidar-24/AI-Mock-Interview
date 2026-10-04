# AI Mock Interview Platform

A full-stack web application that lets users practice real interviews by talking to an AI interviewer. Users answer questions by voice, and the AI evaluates the complete interview with a score, rating, strengths, weaknesses and improvement feedback.

## Features

- Voice-based interview: real-time speech-to-text and text-to-speech using the Web Speech API
- Role-specific interview questions generated dynamically by an LLM (Groq API)
- AI evaluation of the complete interview: score, rating, strengths, weaknesses and feedback
- Secure user authentication using JWT
- Personalized dashboard to track performance across attempts
- Interview results stored in MongoDB

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT
- **AI:** Groq API (LLM)
- **Speech:** Web Speech API

## Getting Started

### Prerequisites

- Node.js installed
- A MongoDB database (local or MongoDB Atlas)
- A Groq API key from https://console.groq.com

### Installation

1. Clone the repository

```bash
   git clone https://github.com/Ujjawal-Patidar-24/AI-Mock-Interview.git
   cd AI-Mock-Interview
```

2. Install dependencies

```bash
   npm install
```

3. Create a `.env` file in the root folder (see `.env.example`) and add your values

```
   GROQ_API_KEY=your_groq_api_key_here
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
```

4. Start the server

```bash
   node server.js
```

5. Open `http://localhost:5000` in your browser (Google Chrome recommended for speech features).

## Author

**Ujjawal Patidar**
MCA, National Institute of Technology, Tiruchirappalli
[LinkedIn](https://www.linkedin.com/in/ujjawalpatidar)
