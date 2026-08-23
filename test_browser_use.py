import os
import sys
import asyncio
from dotenv import load_dotenv

# Reconfigure stdout to use UTF-8 to prevent Windows terminal encoding errors
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Load env variables from .env
load_dotenv()

# Ensure GOOGLE_API_KEY is set from GEMINI_API_KEY
if 'GEMINI_API_KEY' in os.environ and 'GOOGLE_API_KEY' not in os.environ:
    os.environ['GOOGLE_API_KEY'] = os.environ['GEMINI_API_KEY']

from browser_use import Agent
from browser_use.llm import ChatGoogle

async def main():
    # Using gemini-flash-lite-latest
    llm = ChatGoogle(model="gemini-flash-lite-latest")
    
    agent = Agent(
        task="Go to google.com, search for 'Google DeepMind', and print the title of the first result.",
        llm=llm,
    )
    result = await agent.run()
    print("\n--- Agent Result ---")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
