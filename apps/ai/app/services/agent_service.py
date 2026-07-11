from app.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

class AgentService:
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.OPENAI_CHAT_MODEL,
            openai_api_key=settings.OPENAI_API_KEY,
            temperature=0.2, # Lower temperature for coding
            max_tokens=4000,
            streaming=True
        )
        
        self.system_prompt = """You are an expert AI coding assistant integrated directly into an Admin Sandbox Web IDE.
Your goal is to help the developer write, refactor, or explain code.
You will receive the current file content and a user request.
Respond only with the suggested code or changes, formatted properly.
If the user asks a general question, answer it concisely.
"""

    async def get_code_stream(self, file_content: str, instruction: str):
        messages = [
            SystemMessage(content=self.system_prompt)
        ]
        
        prompt = f"Current file content:\n```\n{file_content}\n```\n\nInstruction: {instruction}"
        messages.append(HumanMessage(content=prompt))
        
        async for chunk in self.llm.astream(messages):
            yield chunk.content
