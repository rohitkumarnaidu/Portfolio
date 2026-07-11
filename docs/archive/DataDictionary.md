# Data Dictionary

This document details the tables, columns, and data types used in the Ultimate Portfolio database.

## Table: `User`
Stores user credentials and roles for the Admin Dashboard.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier for the user. |
| `email` | String | Unique, Not Null | User's email address. |
| `role` | Enum | Not Null, Default: 'viewer' | Role for RBAC (`admin`, `editor`, `viewer`). |
| `password_hash` | String | Not Null | Bcrypt hashed password. |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |
| `updated_at` | DateTime | Updated implicitly | Timestamp of last update. |

## Table: `Project`
Stores portfolio projects showcased on the frontend.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `title` | String | Not Null | Name of the project. |
| `slug` | String | Unique, Not Null | URL-friendly identifier. |
| `description` | String | Not Null | Short summary. |
| `content` | Text | Nullable | Detailed markdown/HTML content. |
| `url` | String | Nullable | Live demo URL. |
| `github_url` | String | Nullable | Source code repository URL. |
| `image_url` | String | Nullable | Cover image URL. |
| `published` | Boolean | Default: false | Visibility toggle. |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |
| `updated_at` | DateTime | Updated implicitly | Timestamp of last update. |

## Table: `Post`
Stores blog articles.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `title` | String | Not Null | Article title. |
| `slug` | String | Unique, Not Null | URL-friendly identifier. |
| `content` | Text | Not Null | Markdown content. |
| `published` | Boolean | Default: false | Visibility toggle. |
| `author_id` | UUID | Foreign Key (User.id) | Author of the post. |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |
| `updated_at` | DateTime | Updated implicitly | Timestamp of last update. |

## Table: `Skill`
Stores technical skills for the portfolio.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `name` | String | Not Null | Name of the skill (e.g., React). |
| `category` | String | Not Null | Category (e.g., Frontend, Backend). |
| `proficiency` | Int | Not Null (1-100) | Self-assessed proficiency. |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |
| `updated_at` | DateTime | Updated implicitly | Timestamp of last update. |

## Table: `Experience`
Stores professional work history.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `company` | String | Not Null | Company name. |
| `role` | String | Not Null | Job title. |
| `start_date` | Date | Not Null | Start date of employment. |
| `end_date` | Date | Nullable | End date (null if current). |
| `description` | Text | Not Null | Job responsibilities and achievements. |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |
| `updated_at` | DateTime | Updated implicitly | Timestamp of last update. |

## Table: `Embedding`
Stores `pgvector` data for RAG (Retrieval-Augmented Generation) in the AI service.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `resource_type`| String | Not Null | E.g., "PROJECT", "POST". |
| `resource_id` | UUID | Not Null | ID of the linked resource. |
| `content` | Text | Not Null | Chunk of text that was vectorized. |
| `embedding` | Vector(1536)| Not Null | The vector embedding (OpenAI format). |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |

## Table: `AuditLog`
Stores administrative actions for security and compliance.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | Primary Key | Unique identifier. |
| `user_id` | UUID | Foreign Key (User.id) | User who performed the action. |
| `action` | String | Not Null | Type of action (e.g., CREATE, UPDATE, DELETE). |
| `resource` | String | Not Null | Target resource (e.g., POST, PROJECT). |
| `payload` | JSONB | Nullable | JSON snapshot of the changed data. |
| `created_at` | DateTime | Default: now() | Timestamp of creation. |
