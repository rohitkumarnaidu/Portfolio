# Entity Relationship Diagram (ERD)

> **Note:** This is a standalone ERD reference. The full database schema with ERD is in docs/database/DatabaseSchema.md.

`mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ LeadNote : writes
    User ||--o{ LeadActivity : performs
    User ||--o{ MediaAsset : uploads
    User ||--o{ AuditLog : generates
    User ||--o{ AdminActivity : performs
    Project ||--o{ ProjectImage : contains
    Project ||--o{ CaseStudy : has
    BlogPost ||--o{ PostTag : tagged
    Lead ||--o{ LeadNote : has
    Lead ||--o{ LeadActivity : has
    ChatConversation ||--o{ ChatMessage : contains
`

See docs/database/DatabaseSchema.md for the complete schema.

## Cross-References
- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system