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
    goal="Analyze a company's website to determine its business model category: B2B, B2C, D2C, B2B2C, C2C, C2B, B2G, or C2G.",
    backstory="""You are an expert in identifying e-commerce and business model types based on website content. 
    Your job is to examine the structure, language, product offerings, and target audience of a company's website 
    and categorize it into one of the following:
      - B2B (Business-to-Business)
      - B2C (Business-to-Consumer)
      - D2C (Direct-to-Consumer)
      - B2B2C (Business-to-Business-to-Consumer)
      - C2C (Consumer-to-Consumer)
      - C2B (Consumer-to-Business)
      - B2G (Business-to-Government)
      - C2G (Consumer-to-Government)
    You may use any information on the site including product pages, About, FAQ, and blog.""",
    verbose=True,
    allow_delegation=False,
    memory=False,
    tools=[scraper, search_tool],
    llm=llm
)

message_generator = Agent(
    role="Email Drafting Assistant",
    goal="Craft brand tone-aligned email messages based on user specified context and tailored to brand tone.",
    backstory="""You are an email drafting specialist skilled at writing professional email communications that also reflect the brand specific tone.
    You understand how different tonal values (like playful, assertive, empathetic, formal, etc.) influence the choice of words, structure, and delivery of a message.
    You take a given context and tone directive to write an email that is aligned with the context provided.""",
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

def generate_message(context: str, result):
    task_description = f"""
You must draft a professional email message based on the specific context provided by the user.

CONTEXT TO ADDRESS:
{context}

BRAND ANALYSIS TO FOLLOW:
{result}

INSTRUCTIONS:
1. Write an email that directly addresses the context: "{context}"
2. Use the brand voice, tone, and communication guidelines from the brand analysis above
3. Make the email professional and actionable
4. Return ONLY the email content, no explanations or meta-commentary
5. Do not return generic responses - address the specific context provided

Draft the email now:
"""

    task = Task(
        description=task_description,
        expected_output="An email draft that reflects the analyzed brand tone and is aligned with the context provided",
        agent=message_generator
    )
    
    crew = Crew(agents=[message_generator], tasks=[task])
    result = crew.kickoff()
    
    # Access the raw output from the task result
    if hasattr(result, 'tasks_output') and len(result.tasks_output) > 0:
        return result.tasks_output[0].raw
    else:
        return str(result)  # Fallback to string representation