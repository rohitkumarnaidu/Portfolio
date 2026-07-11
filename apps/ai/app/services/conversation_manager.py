class ConversationManager:
    def __init__(self):
        pass
        
    async def get_history(self, session_id: str) -> list[dict]:
        return []
        
    async def add_message(self, session_id: str, role: str, content: str):
        pass
