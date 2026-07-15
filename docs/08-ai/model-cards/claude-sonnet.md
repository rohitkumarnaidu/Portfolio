# Model Card: Claude Sonnet 4

> **Status:** ⚠️ Partially Implemented — some aspects are aspirational

## Model Details

- **Provider:** Anthropic
- **Model:** claude-sonnet-4-20250514
- **Type:** Large Language Model
- **Parameters:** Unknown (proprietary)
- **Context Window:** 200K tokens
- **Knowledge Cutoff:** Early 2025

## Intended Use

- Primary alternative AI model
- Fallback when GPT-4o is unavailable
- Longer context window tasks
- Document analysis and code review

## Limitations

- May produce inaccurate information (hallucinations)
- Limited to knowledge cutoff date
- API costs higher than GPT-4o per token
- No multimodal vision capabilities (text only)

## Safety

- Anthropic's constitutional AI alignment
- Additional guardrails in PROMPT-LIBRARY.md
- Rate limiting to prevent abuse
- Input sanitization middleware

## Performance Characteristics

- **TTFT (Time to First Token):** 300-600ms
- **Throughput:** ~40 tokens/s (output)
- **Cost:** $3.00/1M input tokens, $15.00/1M output tokens

## Deployment

- Accessed via Anthropic API
- Integration: FastAPI AI service (`apps/ai/app/services/`)
- Fallback target when GPT-4o hits rate limits or errors

## Version History

- Current: claude-sonnet-4-20250514

## Cross-References

- [../../MASTER-INDEX.md](../../MASTER-INDEX.md) Ã¢â‚¬â€ Documentation master index
- [../../26-reference/CROSS-REFERENCE-INDEX.md](../../26-reference/CROSS-REFERENCE-INDEX.md) Ã¢â‚¬â€ Cross-reference system
