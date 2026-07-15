# Model Card: GPT-4o

> **Status:** ✅ Active — reflects actual implementation

## Model Details

- **Provider:** OpenAI
- **Model:** GPT-4o (gpt-4o-2024-08-06)
- **Type:** Large Language Model (multimodal)
- **Parameters:** Unknown (proprietary)
- **Context Window:** 128K tokens
- **Max Output:** 16,384 tokens
- **Knowledge Cutoff:** October 2024

## Intended Use

- AI assistant chat responses
- Content analysis and summarization
- Code generation and review
- Natural language understanding for portfolio queries

## Limitations

- May produce inaccurate information (hallucinations)
- Limited to knowledge cutoff date
- No real-time web search capability (without tool use)
- API costs can be significant at scale

## Safety

- OpenAI's built-in content moderation
- Additional guardrails in PROMPT-LIBRARY.md
- Rate limiting to prevent abuse
- Input sanitization middleware

## Performance Characteristics

- **TTFT (Time to First Token):** 200-500ms
- **Throughput:** ~60 tokens/s (output)
- **Cost:** $2.50/1M input tokens, $10.00/1M output tokens (standard)

## Deployment

- Accessed via OpenAI API
- Integration: FastAPI AI service (`apps/ai/app/services/`)
- Fallback: Claude Sonnet 4 (Anthropic)

## Version History

- Current: gpt-4o-2024-08-06
- Previous: gpt-4o-2024-05-13

## Cross-References

- [../../MASTER-INDEX.md](../../MASTER-INDEX.md) â€” Documentation master index
- [../../26-reference/CROSS-REFERENCE-INDEX.md](../../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
