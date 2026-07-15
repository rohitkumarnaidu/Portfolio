import time
import logging

from collections import defaultdict

from app.config import settings

logger = logging.getLogger(__name__)

MODEL_PRICING: dict[str, dict[str, float]] = {
    "gpt-4o": {"input_per_1m": 2.50, "output_per_1m": 10.00},
    "gpt-4o-mini": {"input_per_1m": 0.15, "output_per_1m": 0.60},
    "claude-sonnet-4": {"input_per_1m": 3.00, "output_per_1m": 15.00},
    "text-embedding-3-small": {"input_per_1m": 0.02, "output_per_1m": 0.02},
}


class CostController:
    def __init__(self):
        self._monthly_usage: float = 0.0
        self._model_usage: dict[str, int] = defaultdict(int)
        self._month_key: str = ""

    def _current_month_key(self) -> str:
        return time.strftime("%Y-%m")

    async def _ensure_month(self):
        key = self._current_month_key()
        if key != self._month_key:
            self._monthly_usage = 0.0
            self._model_usage.clear()
            self._month_key = key
            logger.info("cost_controller reset for new month %s", key)

    def _estimate_cost(self, tokens: int, model: str) -> float:
        pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o-mini"])
        cost_per_token = pricing["input_per_1m"] / 1_000_000
        return tokens * cost_per_token

    async def check_budget(self) -> bool:
        await self._ensure_month()
        return self._monthly_usage < settings.MONTHLY_BUDGET_USD

    async def track_usage(self, tokens: int, model: str):
        await self._ensure_month()
        cost = self._estimate_cost(tokens, model)
        self._monthly_usage += cost
        self._model_usage[model] += tokens

    async def get_monthly_usage(self) -> dict:
        await self._ensure_month()
        model_details = {}
        for model, token_count in self._model_usage.items():
            pricing = MODEL_PRICING.get(model, MODEL_PRICING["gpt-4o-mini"])
            model_details[model] = {
                "tokens": token_count,
                "estimated_cost": round(token_count * pricing["input_per_1m"] / 1_000_000, 6),
            }
        return {
            "month": self._month_key,
            "total_estimated_cost": round(self._monthly_usage, 6),
            "budget": settings.MONTHLY_BUDGET_USD,
            "models": model_details,
        }

    async def get_remaining_budget(self) -> float:
        await self._ensure_month()
        return max(0.0, settings.MONTHLY_BUDGET_USD - self._monthly_usage)
