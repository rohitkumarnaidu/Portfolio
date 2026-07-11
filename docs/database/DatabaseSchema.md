# Database Schema & ERD — FAANG Enterprise Data Model

> **Document:** `DatabaseSchema.md` | **Version:** 5.0 (Enterprise Upgrade) | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Principal Database Architect | **Review Cadence:** Quarterly

## 1. Executive Summary
This document visualizes the complete FAANG-level database schema for the portfolio project. It leverages Supabase PostgreSQL 15 and pgvector to support multi-LLM semantic search alongside strict role-based access control.

## 2. Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ POST : writes
    USER ||--o{ AUDIT_LOG : generates
    PROJECT ||--o{ EMBEDDING : has
    POST ||--o{ EMBEDDING : has

    USER {
        uuid id PK
        string email
        string role "admin, editor, viewer"
        string password_hash
        datetime created_at
        datetime updated_at
    }

    PROJECT {
        uuid id PK
        string title
        string description
        string content
        string url
        string github_url
        string image_url
        boolean published
        datetime created_at
        datetime updated_at
    }

    POST {
        uuid id PK
        string title
        string slug UK
        string content
        boolean published
        uuid author_id FK
        datetime created_at
        datetime updated_at
    }

    SKILL {
        uuid id PK
        string name
        string category
        integer proficiency
        datetime created_at
        datetime updated_at
    }

    EXPERIENCE {
        uuid id PK
        string company
        string role
        date start_date
        date end_date
        string description
        datetime created_at
        datetime updated_at
    }

    EMBEDDING {
        uuid id PK
        string resource_type "PROJECT, POST"
        uuid resource_id FK
        string content
        vector embedding
        datetime created_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid user_id FK
        string action
        string resource
        json payload
        datetime created_at
    }
```

## Description of Relationships

- **User & Post**: A User (Admin/Editor) can author multiple Blog Posts (1:N).
- **Project/Post & Embedding**: Each Project or Post is broken down into chunks and vectorized by the AI Service. These embeddings are stored in the `Embedding` table with a polymorphic association (`resource_type` and `resource_id`) (1:N).
- **User & Audit Log**: Administrative actions performed by users are recorded in the Audit Log for security tracking (1:N).
