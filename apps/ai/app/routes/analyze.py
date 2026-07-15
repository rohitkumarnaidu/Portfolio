import structlog
from fastapi import APIRouter, Request
from pydantic import BaseModel
import re

logger = structlog.get_logger(__name__)
router = APIRouter()


class AnalyzeRequest(BaseModel):
    content: str
    analysis_type: str = "readability"


def _count_sentences(text: str) -> int:
    return len(re.findall(r'[.!?]+', text.strip())) or 1


def _count_words(text: str) -> int:
    return len(text.split()) or 1


def _avg_word_length(text: str) -> float:
    words = text.split()
    if not words:
        return 0.0
    return sum(len(w.strip(".,!?;:\"'()[]")) for w in words) / len(words)


def _syllables(word: str) -> int:
    word = word.lower().strip(".,!?;:\"'()[]")
    if not word:
        return 0
    count = 0
    vowels = "aeiouy"
    prev_is_vowel = False
    for ch in word:
        is_vowel = ch in vowels
        if is_vowel and not prev_is_vowel:
            count += 1
        prev_is_vowel = is_vowel
    if word.endswith("e") and count > 1:
        count -= 1
    return max(count, 1)


def _analyze_readability(text: str) -> dict:
    sentences = _count_sentences(text)
    words = _count_words(text)
    avg_wl = _avg_word_length(text)
    avg_sl = words / sentences
    total_syllables = sum(_syllables(w) for w in text.split())
    grade = 0.39 * avg_sl + 11.8 * (total_syllables / words) - 15.59
    score = max(0, min(100, int(100 - (grade - 1) * 10)))

    suggestions = []
    if avg_sl > 25:
        suggestions.append("Sentences are too long. Consider breaking them into shorter sentences.")
    if grade > 12:
        suggestions.append(f"Reading level (grade {grade:.0f}) is high. Use simpler vocabulary.")
    if avg_wl > 5.5:
        suggestions.append("Average word length is high. Prefer shorter, common words.")
    if words < 50:
        suggestions.append("Content is very short. Consider expanding for better coverage.")

    return {
        "score": score,
        "suggestions": suggestions,
        "metrics": {
            "word_count": words,
            "sentence_count": sentences,
            "avg_sentence_length": round(avg_sl, 1),
            "avg_word_length": round(avg_wl, 2),
            "flesch_kincaid_grade": round(grade, 1),
        },
    }


def _analyze_seo(text: str) -> dict:
    words = text.lower().split()
    word_count = len(words) or 1
    word_freq: dict[str, int] = {}
    for w in words:
        w_clean = w.strip(".,!?;:\"'()[]")
        if len(w_clean) > 2:
            word_freq[w_clean] = word_freq.get(w_clean, 0) + 1

    # Calculate keyword density for top keywords
    top_keywords = sorted(word_freq.items(), key=lambda x: -x[1])[:5]
    keyword_density = {w: round(c / word_count * 100, 2) for w, c in top_keywords}

    headings = len(re.findall(r'^#{1,6}\s', text, re.MULTILINE))
    h1_count = len(re.findall(r'^#\s', text, re.MULTILINE))
    meta_len = len(text[:160]) if len(text) > 0 else 0

    suggestions = []
    if h1_count == 0:
        suggestions.append("Missing H1 heading. Include exactly one H1 for SEO.")
    elif h1_count > 1:
        suggestions.append(f"Found {h1_count} H1 headings. Use only one H1 per page.")
    if headings == 0:
        suggestions.append("No headings found. Use headings (H2, H3) to structure content.")
    if word_count < 300:
        suggestions.append(f"Only {word_count} words. Aim for at least 300 words for good SEO.")
    if meta_len > 160:
        suggestions.append(f"Meta description is ~{meta_len} chars. Keep under 160 characters.")

    score = min(100, int(
        (min(word_count / 300, 1) * 30) +
        (1 if h1_count == 1 else 0.3 if h1_count > 0 else 0) * 25 +
        (min(headings / 3, 1) * 25) +
        (min(meta_len / 160, 1) * 20)
    ))

    return {
        "score": score,
        "suggestions": suggestions,
        "metrics": {
            "word_count": word_count,
            "heading_count": headings,
            "h1_count": h1_count,
            "keyword_density": keyword_density,
            "meta_description_length": meta_len,
        },
    }


FORMAL_MARKERS = {"therefore", "however", "furthermore", "consequently", "nevertheless",
                  "accordingly", "moreover", "notwithstanding", "thus", "hence",
                  "endeavor", "utilize", "facilitate", "commence", "terminate",
                  "demonstrate", "significant", "substantial", "approximately"}
CASUAL_MARKERS = {"gonna", "wanna", "gotta", "kinda", "sorta", "yeah", "nah",
                  "cool", "awesome", "guys", "hey", "literally", "basically",
                  "actually", "honestly", "pretty", "really", "super", "totally"}
FIRST_PERSON = {"i", "me", "my", "we", "us", "our"}
SECOND_PERSON = {"you", "your", "yours"}


def _analyze_tone(text: str) -> dict:
    words = text.lower().split()
    word_count = len(words) or 1

    formal_count = sum(1 for w in words if w.strip(".,!?;:\"'()[]") in FORMAL_MARKERS)
    casual_count = sum(1 for w in words if w.strip(".,!?;:\"'()[]") in CASUAL_MARKERS)
    first_person = sum(1 for w in words if w.strip(".,!?;:\"'()[]") in FIRST_PERSON)
    second_person = sum(1 for w in words if w.strip(".,!?;:\"'()[]") in SECOND_PERSON)

    formality_score = (formal_count - casual_count) / word_count * 100
    # Scale to 0-100 where 50 is neutral
    score = max(0, min(100, int(50 + formality_score * 2.5)))

    suggestions = []
    if formality_score > 10:
        suggestions.append("Content reads as very formal. Consider a more conversational tone for better engagement.")
    elif formality_score < -10:
        suggestions.append("Content reads as very casual. Consider adding more formal structure for professional contexts.")
    if first_person > second_person * 2 and first_person > word_count * 0.05:
        suggestions.append("Heavy first-person usage. Consider varying perspective for broader appeal.")

    tone_label = "formal" if formality_score > 5 else "casual" if formality_score < -5 else "neutral"

    return {
        "score": score,
        "suggestions": suggestions,
        "metrics": {
            "tone": tone_label,
            "formal_markers": formal_count,
            "casual_markers": casual_count,
            "first_person_ratio": round(first_person / word_count, 3),
            "second_person_ratio": round(second_person / word_count, 3),
        },
    }


POSITIVE_WORDS = {"good", "great", "excellent", "amazing", "wonderful", "fantastic",
                  "beautiful", "outstanding", "remarkable", "superb", "brilliant",
                  "love", "happy", "delightful", "pleased", "perfect", "best",
                  "impressive", "innovative", "successful", "positive", "helpful"}
NEGATIVE_WORDS = {"bad", "terrible", "awful", "horrible", "poor", "worse",
                  "hate", "ugly", "disappointing", "dreadful", "mediocre",
                  "worst", "fail", "failure", "problem", "issue", "negative",
                  "difficult", "wrong", "broken", "useless", "painful"}


def _analyze_sentiment(text: str) -> dict:
    words = text.lower().split()
    word_count = len(words) or 1

    pos_count = sum(1 for w in words if w.strip(".,!?;:\"'()[]") in POSITIVE_WORDS)
    neg_count = sum(1 for w in words if w.strip(".,!?;:\"'()[]") in NEGATIVE_WORDS)

    net = pos_count - neg_count
    max_possible = max(pos_count + neg_count, 1)
    score = max(0, min(100, int(50 + (net / max_possible) * 50)))

    sentiment = "positive" if score > 60 else "negative" if score < 40 else "neutral"

    suggestions = []
    if sentiment == "negative":
        suggestions.append("Overall negative tone. Consider balancing with positive framing.")
    elif sentiment == "neutral" and word_count < 100:
        suggestions.append("Sentiment is neutral. Adding more expressive language can improve engagement.")

    return {
        "score": score,
        "suggestions": suggestions,
        "metrics": {
            "sentiment": sentiment,
            "positive_word_count": pos_count,
            "negative_word_count": neg_count,
            "positive_ratio": round(pos_count / word_count, 3),
            "negative_ratio": round(neg_count / word_count, 3),
        },
    }


ANALYZERS = {
    "readability": _analyze_readability,
    "seo": _analyze_seo,
    "tone": _analyze_tone,
    "sentiment": _analyze_sentiment,
}


@router.post("/analyze")
async def analyze_endpoint(request: AnalyzeRequest, http_request: Request):
    analysis_type = request.analysis_type
    content = request.content.strip()
    if not content:
        return {"analysis_type": analysis_type, "score": 0, "suggestions": ["No content provided."], "metrics": {}}

    analyzer = ANALYZERS.get(analysis_type)
    if not analyzer:
        return {"analysis_type": analysis_type, "score": 0, "suggestions": [f"Unknown analysis type: {analysis_type}"], "metrics": {}}

    result = analyzer(content)
    result["analysis_type"] = analysis_type

    analytics = getattr(http_request.app.state, "analytics", None)
    if analytics:
        await analytics.track_event("content_analysis", {
            "analysis_type": analysis_type,
            "score": result["score"],
            "suggestion_count": len(result["suggestions"]),
            "content_length": len(content),
        })

    logger.info("analysis_complete", analysis_type=analysis_type, score=result["score"])
    return result
