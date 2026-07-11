# Load Test Specification

## Test Objectives
- Verify the platform can handle target traffic
- Identify performance bottlenecks
- Validate scaling behavior
- Establish performance baseline

## Target Metrics

| Metric | Target | Method |
|--------|--------|--------|
| Concurrent users | 500 | k6 / Artillery |
| Requests per second | 100 | k6 |
| P95 API response time | < 200ms | k6 |
| P99 API response time | < 500ms | k6 |
| Error rate | < 0.1% | k6 |
| Page load (LCP) | < 2.5s | Lighthouse CI |

## Test Scenarios

### Scenario 1: Public Portfolio Traffic
Simulate visitor browsing the public portfolio:
- Landing page (30% of traffic)
- Project listing + detail (25%)
- Blog listing + detail (20%)
- About page (15%)
- Contact form submission (10%)

### Scenario 2: Admin Dashboard
Simulate admin user operations:
- Dashboard load (20%)
- Content CRUD operations (50%)
- Media upload (10%)
- Analytics view (20%)

### Scenario 3: AI Chat
Simulate AI assistant usage:
- Chat initiation (30%)
- Message exchange (50%)
- File analysis (20%)

## Test Data
- Use seeded database with realistic content
- Automated test data generation
- Cleanup after test execution

## Test Environment
- Staging environment (mirrors production)
- Dedicated test database
- No external rate limiting

## Reporting
- Pass/fail per scenario
- Latency distribution (p50, p95, p99)
- Error breakdown
- Resource utilization
- Comparison with previous runs

## Schedule
- Full load test: Monthly
- Smoke test: Per release
- Continuous: Subset in CI (nightly)
