from app.config import settings

class ModelRouter:
    def __init__(self):
        self.budget_model = "gpt-4o-mini"
        self.standard_model = settings.OPENAI_CHAT_MODEL
        self.premium_model = settings.ANTHROPIC_CHAT_MODEL if settings.ANTHROPIC_API_KEY else self.standard_model
        
    def get_model(self, query_complexity: str = "low") -> str:
        if query_complexity == "low":
            return self.budget_model
        elif query_complexity == "medium":
            return self.standard_model
        elif query_complexity == "high":
            return self.premium_model
        return self.standard_model

