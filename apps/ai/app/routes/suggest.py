import structlog
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional

logger = structlog.get_logger(__name__)
router = APIRouter()


class SuggestRequest(BaseModel):
    content: str
    suggestion_type: str = "improve"
    context: str = ""


SYSTEM_PROMPTS = {
    "improve": "You are a professional editor. Rewrite the following text to be more engaging, clear, and impactful. Maintain the original meaning but make it more compelling. Return only the rewritten text, nothing else.",
    "fix": "You are a proofreader. Fix any spelling, grammar, and punctuation errors in the following text. Preserve the original voice and meaning as much as possible. Return only the corrected text, nothing else.",
    "expand": "You are a content writer. Expand the following text by adding relevant details, examples, or elaborations. Make it more comprehensive while preserving the original message. Return only the expanded text, nothing else.",
    "summarize": "You are a concise writer. Summarize the following text to its key points. Keep it brief and to the point. Return only the summary, nothing else.",
}


def _rule_based_improve(text: str) -> list[str]:
    suggestions = []
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    power_words = ["discover", "transform", "proven", "essential", "exclusive", "breakthrough",
                   "ultimate", "unleash", "accelerate", "amplify"]

    for s in sentences:
        words = s.split()
        if len(words) > 20:
            suggestions.append(f"Long sentence ({len(words)} words): \"{' '.join(words[:8])}...\" — break it into shorter sentences.")
        elif len(words) < 4:
            suggestions.append(f"Very short sentence: \"{s}\" — consider merging or expanding.")

    if not any(pw in text.lower() for pw in power_words):
        suggestions.append("Add power words like 'discover', 'transform', or 'proven' to increase impact.")
    if len(sentences) < 3:
        suggestions.append("Very short content. Add more sentences to develop the message.")

    return suggestions if suggestions else ["Text reads well. Minor improvements could add more impact."]


COMMON_TYPOS = {
    "teh": "the", "recieve": "receive", "wich": "which", "thier": "their",
    "wierd": "weird", "acheive": "achieve", "beleive": "believe", "neccessary": "necessary",
    "occurence": "occurrence", "seperate": "separate", "goverment": "government",
    "definately": "definitely", "alot": "a lot", "cant": "can't", "dont": "don't",
    "wont": "won't", "isnt": "isn't", "doesnt": "doesn't", "didnt": "didn't",
    "wasnt": "wasn't", "wouldnt": "wouldn't", "couldnt": "couldn't", "shouldnt": "shouldn't",
    "havent": "haven't", "hasnt": "hasn't", "hadnt": "hadn't", "its": "its",
}


def _rule_based_fix(text: str) -> list[str]:
    suggestions = []
    words = text.split()
    for i, w in enumerate(words):
        clean = w.strip(".,!?;:\"'()[]").lower()
        if clean in COMMON_TYPOS and COMMON_TYPOS[clean] != clean:
            suggestions.append(f"Line {i // 10 + 1}: \"{clean}\" → \"{COMMON_TYPOS[clean]}\"")
    return suggestions if suggestions else ["No obvious spelling or grammar issues found."]


def _rule_based_expand(text: str) -> list[str]:
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    suggestions = []
    for s in sentences:
        words = s.split()
        if len(words) < 8:
            suggestions.append(f"Short sentence: \"{s}\" — add context or an example to strengthen it.")
    if len(sentences) < 5:
        suggestions.append("Content is brief. Consider adding background, examples, or supporting details.")
    if not suggestions:
        suggestions.append("Content is reasonably detailed. Consider adding a concluding sentence.")
    return suggestions


def _rule_based_summarize(text: str) -> list[str]:
    sentences = [s.strip() for s in text.replace("!", ".").replace("?", ".").split(".") if s.strip()]
    if not sentences:
        return ["No content to summarize."]
    key_sentences = sorted(sentences, key=len)[:max(2, len(sentences) // 3)]
    return key_sentences if key_sentences else [sentences[0]]


RULE_FALLBACKS = {
    "improve": _rule_based_improve,
    "fix": _rule_based_fix,
    "expand": _rule_based_expand,
    "summarize": _rule_based_summarize,
}


def _use_llm(content: str, suggestion_type: str, context: str) -> Optional[list[str]]:
    from app.config import settings
    if not settings.OPENAI_API_KEY:
        return None

    from langchain_openai import ChatOpenAI
    from langchain_core.messages import SystemMessage, HumanMessage

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        openai_api_key=settings.OPENAI_API_KEY,
        temperature=0.5,
        max_tokens=1024,
    )
    system_prompt = SYSTEM_PROMPTS.get(suggestion_type, SYSTEM_PROMPTS["improve"])
    if context:
        system_prompt += f"\n\nConsider this context: {context}"

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=content),
    ]
    try:
        result = llm.invoke(messages)
        text = result.content.strip()
        return [s.strip() for s in text.split("\n") if s.strip()]
    except Exception as e:
        logger.warning("llm_suggestion_failed", error=str(e), suggestion_type=suggestion_type)
        return None


@router.post("/suggest")
async def suggest_endpoint(request: SuggestRequest, http_request: Request):
    suggestion_type = request.suggestion_type if request.suggestion_type in SYSTEM_PROMPTS else "improve"
    content = request.content.strip()
    if not content:
        return {"suggestions": ["No content provided."], "original_content": ""}

    suggestions = _use_llm(content, suggestion_type, request.context)
    if suggestions is None:
        fallback = RULE_FALLBACKS.get(suggestion_type, RULE_FALLBACKS["improve"])
        suggestions = fallback(content)

    analytics = getattr(http_request.app.state, "analytics", None)
    if analytics:
        await analytics.track_event("content_suggestion", {
            "suggestion_type": suggestion_type,
            "suggestion_count": len(suggestions),
            "content_length": len(content),
            "used_llm": suggestions is not None,
        })

    logger.info("suggestion_complete", suggestion_type=suggestion_type, count=len(suggestions))
    return {"suggestions": suggestions, "original_content": request.content}
