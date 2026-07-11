> ⚠️ **PARTIALLY IMPLEMENTED — Contains Design Spec Content**
> This document blends implemented features with aspirational design content. Sections marked with [DESIGN SPEC] describe future work that does **not** yet exist in the codebase. See [`docs/ai/README.md`](./README.md) for the current AI implementation status.

# AI Observability

## Overview
AI Observability is critical for understanding how the AI layer performs in production. It goes beyond traditional APM (Application Performance Monitoring) by tracking LLM-specific metrics such as token usage, cost, generation latency, and semantic errors.

## Tracing and Logging

### 1. LangSmith Integration
We utilize **LangSmith** (or a similar tool like Langfuse/DataDog LLM Observability) to trace every step of the AI execution pipeline.
- **Span Tracking**: Visualizing the execution time of individual steps: Query Parsing -> Vector Retrieval -> LLM Generation.
- **Prompt/Response Logging**: Capturing the exact prompt sent to the model and the raw completion received, essential for debugging unexpected behaviors.

### 2. Standard Application Logging
The FastAPI service uses structured JSON logging (e.g., using `structlog` or standard Python logging). Logs are aggregated into a centralized logging platform.
- Logs include `trace_id` and `session_id` to correlate backend AI logs with Next.js frontend requests.

## Key Performance Indicators (KPIs)

### 1. Latency Metrics
- **Time to First Token (TTFT)**: Critical for user experience in streaming responses. Target: < 1 second.
- **Time Between Tokens (TBT)**: Measures the perceived speed of generation.
- **Total Request Latency**: Total time from user submission to complete response generation.

### 2. Cost and Usage Metrics
- **Token Count**: Tracking prompt tokens and completion tokens per request.
- **Cost Allocation**: Calculating the estimated cost per user session or per day. 
- **Cache Hit Rate**: If semantic caching is implemented, tracking how often identical/similar queries are served from cache versus hitting the LLM API.

### 3. Error Rates and Reliability
- **API Failures**: Tracking timeouts, 429 Rate Limits, or 500 errors from external providers (OpenAI/Anthropic).
- **Fallback Trigger Rate**: How often the system had to fall back from the primary model to the secondary model.
- **Validation Errors**: How often the LLM output failed to match the expected Pydantic schema (indicating prompt confusion or model degradation).

## Alerting
Automated alerts are configured for critical thresholds:
- **High Cost Alert**: Triggers if daily token usage exceeds a predefined budget.
- **High Latency Alert**: Triggers if the 95th percentile TTFT exceeds 3 seconds.
- **Elevated Error Rate**: Triggers if API failures or validation errors spike above 2%.

## Dashboards
An Admin Dashboard (built into the Next.js frontend or a Grafana instance) visualizes these metrics, allowing the portfolio owner to monitor the AI's health and ROI at a glance.

---

> ⚠️ **Implementation Status:** Design Spec Only. Not implemented in current codebase.
