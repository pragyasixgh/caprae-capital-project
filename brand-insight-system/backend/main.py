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
    tone_values: list[str]

@app.post("/analyze/")
async def analyze_url(req: URLRequest):
    try:
        result = await run_crew_analysis(req.url)
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
    try:
        # Remove await since generate_message is not async
        message = generate_message(req.context, req.tone_values)
        return {"message": message}
    except Exception as e:
        return {"error": str(e)}