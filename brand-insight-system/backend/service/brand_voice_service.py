from crewai import Crew, Agent, Task
from crewai_tools import ScrapeWebsiteTool, SerperDevTool
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"))

scraper = ScrapeWebsiteTool()
search_tool = SerperDevTool()

# Define Agents
brand_voice_analyzer = Agent(
    role="Comprehensive Brand Voice Analyst",
    goal="Analyze a brand's tone, personality traits, messaging themes...",
    backstory="You are a branding expert...",
    verbose=True,
    allow_delegation=True,
    memory=True,
    tools=[scraper],
    llm=llm
)

industry_classifier = Agent(
    role="E-commerce Business Model Classifier",
    goal="Analyze a company website to classify its business model",
    backstory="You are an expert in identifying e-commerce models...",
    verbose=True,
    allow_delegation=False,
    memory=False,
    tools=[scraper, search_tool],
    llm=llm
)

message_generator = Agent(
    role="Brand Message Drafting Assistant",
    goal="Craft brand-aligned messages",
    backstory="You write messages in a given tone...",
    verbose=False,
    allow_delegation=False,
    memory=False,
    llm=llm
)

async def run_crew_analysis(url: str):
    task1 = Task(
        description=f"""Perform a comprehensive analysis of the brand's voice at {url}. Your analysis should:
        1. Evaluate tonal patterns and tone scale attributes.
        2. Profile brand personality traits and identify key messaging themes.
        3. Document communication dos and don'ts with clear reasoning.
        Output YAML with tone_scale, personality_traits, messaging_themes, communication_guidelines.""",
        expected_output="YAML structured output...",
        agent=brand_voice_analyzer,
    )

    task2 = Task(
        description=f"""Classify the company's business model by analyzing {url}.
        Output JSON with 'industry_type' and 'justification'.""",
        expected_output="JSON output with 'industry_type' and 'justification'",
        agent=industry_classifier,
    )

    crew = Crew(agents=[brand_voice_analyzer, industry_classifier], tasks=[task1, task2])
    result = crew.kickoff()  # Return the entire crew result
    return result

def generate_message(context: str, tone_values: list[str]):
    tone_str = ", ".join(tone_values)
    
    task_description = f"""
Write a single, concise brand message based on the following:

Context:
{context}

Tone Values:
{tone_str}

Guidelines:
- Reflect the tone values throughout the message.
- Do not explain or justify anything.
- Only return the final message.
"""

    task = Task(
        description=task_description,
        expected_output="A single, concise brand message that reflects the given tone values",
        agent=message_generator
    )
    
    crew = Crew(agents=[message_generator], tasks=[task])
    result = crew.kickoff()
    
    # Access the raw output from the task result
    if hasattr(result, 'tasks_output') and len(result.tasks_output) > 0:
        return result.tasks_output[0].raw
    else:
        return str(result)  # Fallback to string representation