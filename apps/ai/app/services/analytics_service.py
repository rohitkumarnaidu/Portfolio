import time
from collections import defaultdict, deque
from typing import Optional

import structlog

EVENT_TYPES = {
    "chat_message",
    "rag_retrieval",
    "model_invocation",
    "error",
    "content_analysis",
    "content_suggestion",
}

MAX_EVENTS = 1000


class AnalyticsService:
    def __init__(self):
        self._logger = structlog.get_logger(__name__)
        self._events: deque[dict] = deque(maxlen=MAX_EVENTS)

    async def track_event(self, event_name: str, properties: dict):
        if event_name not in EVENT_TYPES:
            self._logger.warning("analytics unknown event type", event_name=event_name)
        event = {
            "event_name": event_name,
            "timestamp": time.time(),
            "properties": properties,
        }
        self._events.append(event)
        self._logger.info("analytics_event", **event)

    async def get_events(self, event_type: Optional[str] = None, limit: int = 100) -> list[dict]:
        if event_type:
            filtered = [e for e in self._events if e["event_name"] == event_type]
        else:
            filtered = list(self._events)
        return filtered[-limit:]

    async def get_stats(self) -> dict:
        counts: dict[str, int] = defaultdict(int)
        for e in self._events:
            counts[e["event_name"]] += 1
        return {
            "total_events": len(self._events),
            "event_counts": dict(counts),
        }
