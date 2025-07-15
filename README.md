# Brand Voice & Industry Analyzer

This is a full-stack AI-powered web application that:
- Accepts a website URL
- Analyzes the website to establish the brand voice and classifies the business industry type
- Generates a brand-aligned email based on the context provided

Built with **FastAPI** (backend), **React** (frontend), and **CrewAI agents**

---

## Key Features

- **Brand Voice Analysis**: Extracts tone scale, personality traits, messaging themes, and communication guidelines
- **Industry Classification**: Categorizes business models (B2B, B2C, D2C, B2B2C, C2C, C2B, B2G, C2G)
- **Email Generation**: Creates brand-aligned emails based on context and analyzed tone
- **Modern UI**: Clean, responsive interface with dark theme and gradient styling
- **Real-time Processing**: Asynchronous analysis with loading states and error handling

---

## Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React, JavaScript             |
| Backend   | FastAPI, Python, CrewAI       |
| Agents    | CrewAI + LangChain + Tools    |
| LLM       | OpenAI GPT-4                  |
| Tools     | ScrapeWebsiteTool, SerperDevTool |

---

## Project Structure

```
brand-insight-system/
├── backend/
│   ├── main.py                    # FastAPI server
│   ├── service/
│   │   └── brand_voice_service.py # CrewAI agents and analysis logic
│   ├── venv/                      # Python virtual environment
│   └── .env                       # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js                 # React app logic
│   │   └── App.css                # Application styles
│   ├── public/
│   ├── node_modules/              # Node.js dependencies
│   ├── package.json               # Node.js dependencies
│   └── package-lock.json          # Lock file for dependencies
├── .gitignore
└── README.md
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/brand-insight-system.git
cd brand-insight-system
```

### 2. Backend Setup

**Python Environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install required packages
pip install fastapi uvicorn crewai crewai-tools langchain-openai python-dotenv

# Create requirements.txt for future use
pip freeze > requirements.txt
```

**Environment Variables**

Create a `.env` file inside the `backend/` folder:

```ini
OPENAI_API_KEY=your_openai_key_here
```

**Run FastAPI Server**
```bash
uvicorn main:app --reload
```

Server will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

React app will run at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint             | Description                                                           |
|--------|---------------------|-----------------------------------------------------------------------|
| POST   | `/analyze/`         | Accepts `{ "url": "website_url" }` and returns brand voice analysis and industry classification |
| POST   | `/generate-message/` | Accepts `{ "context": "message_context", "tone_values": [] }` and returns brand-aligned message |

## Development Notes

- Frontend expects the backend server at `localhost:8000`
- Backend CORS is configured for `http://localhost:3000`
- Run both frontend and backend simultaneously for full functionality
- Analysis results are stored in memory for the session
- The application uses native fetch API for HTTP requests
- Custom CSS provides responsive design with dark theme

---

## Requirements

### Backend Dependencies
- Python 3.8+
- FastAPI
- CrewAI
- crewai-tools (ScrapeWebsiteTool)
- langchain-openai
- python-dotenv
- uvicorn

### Frontend Dependencies
- Node.js 14+
- React
- React hooks (useState)
- CSS3 (custom styling)
