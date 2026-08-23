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

from browser_use import Agent, BrowserSession
from browser_use.llm import ChatGoogle

async def main():
    # Use gemini-flash-lite-latest since it has active free tier quota
    llm = ChatGoogle(model="gemini-flash-lite-latest")
    
    # Configure browser to run in HEADLESS=FALSE (Real visible browser)
    browser = BrowserSession(headless=False)
    
    task_description = (
        "1. Open http://localhost:3000/login\n"
        "2. Log in using email 'testadmin_qa@example.com' and password 'TestAdmin123!'.\n"
        "3. Once logged in, go to the Destinations admin page (http://localhost:3000/admin/destinations):\n"
        "   - Create a new destination (e.g. 'Test Destination Bali', description: 'Beautiful place').\n"
        "   - Verify it is created and appears in the list.\n"
        "   - Edit/Update that destination (change name to 'Test Destination Bali Updated').\n"
        "   - Delete the destination.\n"
        "4. Go to the Packages admin page (http://localhost:3000/admin/packages):\n"
        "   - Create a new package.\n"
        "   - Verify it is created.\n"
        "   - Update it.\n"
        "   - Delete it.\n"
        "5. Go to the Coupons admin page (http://localhost:3000/admin/coupons):\n"
        "   - Create a new coupon.\n"
        "   - Verify it.\n"
        "   - Delete it.\n"
        "6. Confirm when all CRUD operations are successfully tested."
    )
    
    agent = Agent(
        task=task_description,
        llm=llm,
        browser=browser
    )
    
    print("Launching visible browser to perform E2E CRUD tests. You will see a browser window open...")
    result = await agent.run()
    print("\n--- Test Result ---")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
