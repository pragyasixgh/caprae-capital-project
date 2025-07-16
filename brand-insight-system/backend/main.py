from fastapi import FastAPI, Request
from pydantic import BaseModel
from service.brand_voice_service import run_crew_analysis, generate_message
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

# These are now available to use anywhere
openai_api_key = os.getenv("OPENAI_API_KEY")
app = FastAPI()

# Store the analysis result in memory (for production, use a database)
stored_analysis_result = None

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class URLRequest(BaseModel):
    url: str

class ContextInput(BaseModel):
    context: str
    tone_values: list[str]  # This can be removed if not needed

@app.post("/analyze/")
async def analyze_url(req: URLRequest):
    global stored_analysis_result
    try:
        result = await run_crew_analysis(req.url)
        
        # Store the full result for later use
        stored_analysis_result = result
        
        # Return the raw output for each task
        return {
            "tasks_output": [
                {"raw": result.tasks_output[0].raw},
                {"raw": result.tasks_output[1].raw}
            ]
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/generate-message/")
async def generate_brand_message(req: ContextInput):
    global stored_analysis_result
    try:
        # Check if we have a stored analysis result
        if stored_analysis_result is None:
            return {"error": "No brand analysis found. Please run /analyze/ first."}
        
        # Pass the stored analysis result instead of tone_values
        message = generate_message(req.context, stored_analysis_result)
        return {"message": message}
    except Exception as e:
        return {"error": str(e)}