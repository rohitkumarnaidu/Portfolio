# Admin User Manual — Portfolio Platform

> **Document:** `19-admin/ADMIN-USER-MANUAL.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Audience:** Portfolio Admin Users
> **Related:** [Admin Architecture](../design/AdminArchitecture.md) | [Admin Dashboard Architecture](../design/AdminDashboardArchitecture.md)

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Content Management](#2-content-management)
3. [Lead Management](#3-lead-management)
4. [Media Library](#4-media-library)
5. [AI Assistant Management](#5-ai-assistant-management)
6. [Analytics Dashboard](#6-analytics-dashboard)
7. [Settings](#7-settings)
8. [Activities & Audit Log](#8-activities--audit-log)

---

## 1. Getting Started

### 1.1 Logging In

Navigate to `/admin/login`. You have three authentication methods:

**Email & Password:**
1. Enter your registered email address and password.
2. Click **Sign In**.
3. You are redirected to the admin dashboard.

**Google OAuth:**
1. Click **Continue with Google**.
2. A Google consent screen appears. Select your account.
3. On first login, your Google profile (name, email, avatar) is linked to your admin account.
4. You are redirected to the dashboard.

**GitHub OAuth:**
1. Click **Continue with GitHub**.
2. Authorize the application in the GitHub OAuth flow.
3. Your GitHub profile is linked on first login.
4. You are redirected to the dashboard.

> If you see "Unauthorized" after login, your account may not have been granted access. Contact a super admin to assign your role.

### 1.2 Dashboard Overview

The dashboard at `/admin` is your command center. It displays:

- **Stat Cards** — Quick counts: Sections (total + live), Projects (total + featured), Skills, Leads (total + new). Each card is color-coded for easy scanning.
- **Quick Actions** — Shortcut links to common tasks: Add Project, Write Blog Post, View Leads, Manage Sections.
- **Navigation** — Left sidebar (or hamburger menu on mobile) lists all admin modules: Dashboard, Sections, Projects, Blog, Skills, Experience, Testimonials, Services, Leads, Media, Chat, Activities, Users, Settings, Feature Flags, API Keys, plus any additional modules (FAQs, Case Studies, Guest Appearances, Press Features, Achievements, Reading List, Availability, Sandbox).

### 1.3 User Roles

| Role | Permissions | Typical Access |
|------|-------------|----------------|
| **Admin** | Full CRUD on all content, user management, settings, feature flags, API keys, audit log, analytics | Portfolio owner, super admin |
| **Editor** | Create, edit, publish/unpublish content. Cannot manage users, change system settings, or view API keys. | Content contributors |
| **Viewer** | Read-only access to all modules. Cannot create, edit, or delete anything. Can export data. | Clients, stakeholders, reviewers |

Your role is displayed in the user menu (top-right avatar). Role changes are logged in the audit trail.

---

## 2. Content Management

### 2.1 Sections

Manage portfolio sections at `/admin/sections`. Sections control which parts of your portfolio are visible to visitors and in what order.

**Create a Section:**
1. Click **Add Section** (opens the section form).
2. Enter a **Section Label** (display name like "About Me") and **Section Key** (internal identifier like `about`).
3. Select the **Section Type** (e.g., `hero`, `about`, `projects`, `skills`, `experience`, `testimonials`, `services`, `contact`).
4. Toggle **Is Live** to publish immediately or leave off to save as draft.
5. Click **Save**.

**Reorder Sections:**
1. On the sections list, drag any row by the handle (six-dot icon) to a new position.
2. The order auto-saves. A success toast confirms the change.

**Toggle Visibility:**
1. Find the section in the list.
2. Click the toggle switch (green = visible, gray = hidden). `is_always_visible` sections (like Hero) cannot be hidden.

**Delete a Section:**
1. Click the trash icon on the section row.
2. Confirm deletion in the modal. This is irreversible.

### 2.2 Projects

Manage projects at `/admin/projects`. Projects are your portfolio's centerpiece — each entry can include rich media, tech stack details, and NDA controls.

**Create a Project:**
1. Click **Add Project** to open the project form.
2. Fill in the required fields:
   - **Title** — Project name (displayed publicly).
   - **Description** — Rich text description (supports HTML/markdown).
   - **Category** — Grouping label (e.g., "Web App", "Mobile", "Design System").
3. Optional fields:
   - **URL** — Live project link.
   - **GitHub URL** — Source code repository.
   - **Tech Stack** — Comma-separated list (e.g., "React, Node.js, PostgreSQL"). Each item becomes a badge.
   - **Images** — Upload project screenshots (see [Media Library](#4-media-library)).
   - **Featured** — Toggle to feature this project on the portfolio homepage.
4. **NDA Toggle** — Enable for projects under NDA. When on, project details are hidden from the public portfolio; only the title and NDA badge appear.
5. Click **Save**.

**Manage Projects:**
- **Search** — Filter by title, description, or tech stack terms.
- **Filter** — By category using the category filter buttons.
- **Sort** — Click column headers (Title, Category, Date).
- **Bulk Select** — Check multiple projects for batch delete.

### 2.3 Blog

Write blog posts at `/admin/blog`. The editor uses Tiptap, a rich text editor with a clean interface.

**Create a Blog Post:**
1. Click **Add Post** .
2. Enter the **Title**.
3. Write your content in the **Tiptap rich text editor**:
   - Format toolbar: Bold, Italic, Heading (H2/H3), Blockquote, Bullet List, Ordered List, Code Block, Link.
   - Drag-and-drop images inline (auto-uploaded to the media library).
   - Use `Cmd+Z`/`Ctrl+Z` for undo.
4. **Excerpt** — A short summary shown in blog cards and SEO meta descriptions.
5. **Tags** — Comma-separated keywords for categorization (e.g., "react, performance, optimization").
6. **Category** — Select or type a new category.
7. **Publish Date** — Leave blank to publish immediately, or set a future date for scheduled publishing. Posts with future dates show as "Scheduled" in the list.
8. Toggle **Published** to make the post visible. Scheduled posts auto-publish at their set date.
9. Click **Save**.

**Filter and Sort:**
- Search by title, excerpt, or tags.
- Filter by category.
- Sort by title, category, or published date.
- Bulk select for batch operations.

### 2.4 Skills

Manage skills at `/admin/skills`. Skills are grouped by category and displayed as proficiency bars or grid items on your portfolio.

**Create a Skill:**
1. Click **Add Skill**.
2. Enter **Name** (e.g., "TypeScript").
3. Select **Category** (e.g., "Frontend", "Backend", "DevOps", "Design", "Database"). The category groups skills on the portfolio page. New categories are auto-created when typed.
4. **Proficiency** — Use the slider (0–100) to set displayed proficiency level.
5. **Icon** — Select an icon from the picker.
6. Toggle **Featured** to highlight this skill on the homepage or hero section.
7. Click **Save**.

**Organize:**
- Grid or table view toggle controls how skills are displayed in the admin.
- Skills are grouped by category in the admin list, matching the public portfolio grouping.
- Delete a skill by clicking the trash icon.

### 2.5 Experience

Manage professional experience at `/admin/experiences`. Entries appear as a chronological timeline on your portfolio.

**Create an Experience Entry:**
1. Click **Add Experience**.
2. Fill in:
   - **Company** name.
   - **Role** / job title.
   - **Location** (city, remote, hybrid).
   - **Start Date** and **End Date** (leave end date blank for current position).
   - **Description** — Rich text detailing responsibilities and achievements.
3. Toggle **Visible** to show/hide this entry on the portfolio.
4. Click **Save**.

**Manage:**
- The list shows company, role, location, and dates.
- Entries are sorted chronologically (newest first) on the public portfolio.
- Edit any entry by clicking the pencil icon.

### 2.6 Testimonials

Manage client testimonials at `/admin/testimonials`.

**Create a Testimonial:**
1. Click **Add Testimonial**.
2. Enter:
   - **Name** — The person providing the testimonial.
   - **Company** — Their organization (optional).
   - **Role** — Their job title (optional).
   - **Content** — The testimonial text.
   - **Rating** — 1–5 star rating (displayed as stars on the portfolio).
   - **Source** — Where the testimonial came from (e.g., "LinkedIn", "Email", "Upwork", "Clutch"). Optional but useful for tracking.
3. Upload an **Avatar** image (optional).
4. Toggle **Visible** to publish.
5. Click **Save**.

### 2.7 Services

Manage service offerings at `/admin/services`. Each service describes what you offer to potential clients.

**Create a Service:**
1. Click **Add Service**.
2. Enter:
   - **Title** — Service name (e.g., "Web Application Development").
   - **Description** — Brief explanation of the service.
   - **Icon** — Select a representative icon from the picker.
   - **Features** — Comma-separated list of key features or deliverables.
3. Toggle **Highlighted** to feature this service prominently.
4. Click **Save**.

---

## 3. Lead Management

### 3.1 Viewing and Filtering Leads

The leads page at `/admin/leads` displays all contact form submissions.

**Filters:**
- **Status Tabs** — Click any status button to filter: All, New, Read, Replied, Converted, Archived.
- **Search** — Type a name, email, or company to search.

Each lead row shows: name, email, company, status badge (color-coded), priority indicator, and timestamp.

### 3.2 Lead Status Workflow

Click a lead row to open the detail panel. The status workflow follows:

```
New → Read → Replied → Converted → Archived
```

- **New** — Fresh submission, not yet reviewed.
- **Read** — You have opened and read the message.
- **Replied** — You have responded to the lead.
- **Converted** — The lead became a client or project. Marking as converted adds a conversion timestamp.
- **Archived** — No further action needed. Archived leads are hidden from the default view.

Click the status dropdown in the detail view to change status. A success toast confirms the change.

### 3.3 Internal Notes

In the lead detail panel, you can add internal notes visible only to admin users:

1. Scroll to the **Notes** section.
2. Type your note in the text area.
3. Click **Add Note**. Notes are timestamped and attributed to your account.

Internal notes are not visible to the lead or on the public portfolio.

### 3.4 Exporting Leads to CSV

1. Click **Export CSV** (top-right).
2. The browser downloads a CSV file with all leads (respecting active filters).
3. The CSV includes: name, email, company, phone, message, status, priority, source, created date, converted date, and notes.

### 3.5 Lead Activity Timeline

The lead detail panel shows a timeline of all activity: when the lead was created, when status changed, when notes were added. Each event is timestamped for full traceability.

---

## 4. Media Library

### 4.1 Uploading Images

Navigate to `/admin/media`. The media library stores all images, documents, and assets.

1. Click the **upload area** or drag-and-drop files onto it.
2. Supported formats: JPEG, PNG, GIF, WebP, AVIF, SVG, PDF, MP4, WebM.
3. Maximum file size: 10 MB per file (configurable in settings).
4. Add an optional **Alt Text** for accessibility.
5. Click **Upload**. A progress indicator shows upload status.

### 4.2 Automatic Image Optimization

Uploaded images are automatically optimized:
- **WebP conversion** — Images are served as WebP to modern browsers (Chrome, Firefox, Edge).
- **AVIF conversion** — Supported browsers receive AVIF for superior compression.
- **Responsive sizes** — Multiple resolutions are generated (thumbnail, small, medium, large).
- **Lazy loading** — All media assets use native lazy loading on the public portfolio.

### 4.3 Organizing Media

- **Grid View** — Thumbnails with file name overlay. Click any asset to view details and copy its URL.
- **Tags** — Add tags to assets for organization (e.g., "screenshot", "hero", "blog").
- **Delete** — Click the trash icon and confirm. Deleted assets are removed from storage permanently.

---

## 5. AI Assistant Management

### 5.1 Viewing Chat History

The chat admin page at `/admin/chat` shows all visitor conversations with the AI assistant.

- **Data Table** — Lists each conversation with Session ID, Start Time, and Message Count.
- **View Messages** — Click **View** to open a modal showing the full conversation transcript (user messages and AI responses).
- **Delete** — Remove unwanted or spam conversations.

### 5.2 Monitoring AI Usage and Costs

> This section requires the AI service to be fully deployed. See `/admin/analytics` for usage dashboards.

Usage metrics include: total conversations, messages per conversation, average response time, token usage per session, and estimated cost (based on LLM provider pricing).

### 5.3 Content Analysis Reports

The Sections page includes an **AI Analysis Panel** that provides automated content suggestions:
- SEO optimization recommendations for section labels.
- Content completeness checks.
- Keyword density analysis.

---

## 6. Analytics Dashboard

### 6.1 Page Views and Visitor Metrics

The analytics dashboard (at `/admin` overview or a dedicated analytics page) displays:

- **Total Visitors** — Unique visitor count over the selected period.
- **Page Views** — Total page loads.
- **Active Sections** — Which portfolio sections get the most engagement.
- **Geographic Distribution** — Visitor locations (country-level).
- **Traffic Sources** — Referral, direct, search, social breakdown.

### 6.2 Conversion Funnels

Track how visitors convert through your portfolio:

1. **Landing Page Visit** → **Portfolio Browse** → **Contact Form View** → **Form Submission**.
2. Funnel visualization shows drop-off rates between each stage.
3. Filter by date range or traffic source.

### 6.3 SEO Performance

- **Top Keywords** — Search terms driving traffic (from integrated analytics).
- **Page Rankings** — Estimated position tracking for key terms.
- **Core Web Vitals** — LCP, FID, CLS scores for all public pages.

### 6.4 Exporting Reports

- Click **Export** on any analytics view to download a CSV report of the current data.
- Report includes the applied filters and date range.

---

## 7. Settings

### 7.1 System Settings

Navigate to `/admin/settings`. Settings are organized in groups:

| Group | Examples |
|-------|----------|
| **General** | Site name, tagline, timezone, language |
| **SEO** | Default meta description, og:image, Google Analytics ID |
| **Social** | GitHub, LinkedIn, Twitter/X, YouTube, Instagram URLs |
| **Contact** | Email address, phone, location, Calendly link |
| **Appearance** | Theme color, font selection, layout options |
| **Analytics** | PostHog API key, Vercel Analytics enable |

**Edit a Setting:**
1. Find the setting in its group.
2. Click the value field to edit inline, or click the pencil icon to open the edit form.
3. Update the value and press Enter or click Save.

**Add a Setting:**
1. Click **Add Setting**.
2. Enter Key, Value, Group, Type (string/number/boolean/json), and Description.
3. Click **Save**.

### 7.2 Feature Flags

Manage feature flags at `/admin/feature-flags`. Flags let you enable or disable features without code deployments.

**Create a Flag:**
1. Click **Create Flag**.
2. Enter **Flag Key** (e.g., `new_hero_design`), **Description**, and **Rollout Percentage** (0–100).
3. Toggle **Enabled** to activate immediately.
4. Click **Save**.

**Manage:**
- Toggle any flag on/off directly from the list.
- Edit rollout percentage for gradual rollouts.
- Delete flags that are no longer needed.

### 7.3 API Keys

Manage external integration keys at `/admin/api-keys`.

**Create an API Key:**
1. Click **Create API Key**.
2. Enter a **Name** (e.g., "Production CI Integration") and optional **Permissions** (e.g., `read, write`).
3. Click **Generate Key**. The full key is shown once — copy and store it securely.
4. The key prefix is displayed in the list for identification.

**Revoke/Delete:**
- **Revoke** — Immediately invalidates the key. Revoked keys remain in the list with "Revoked" status.
- **Delete** — Permanently removes the key record.

### 7.4 Team Member Management

Manage users at `/admin/users`.

**Add a User:**
1. Click **Add User**.
2. Enter Email, Display Name, and assign a Role (Admin, Editor, Viewer).
3. Optionally set a password (users can also authenticate via OAuth).
4. Click **Save**. The user receives a welcome email (if email service is configured).

**Edit a User:**
1. Click the user's row to edit name, email, or role.
2. Role changes take effect immediately.

**Locked Accounts:**
- Accounts locked after failed login attempts show with "Locked" status.
- Click **Unlock** to restore access.

---

## 8. Activities & Audit Log

### 8.1 Viewing Admin Activity Log

The activity log at `/admin/activities` records every admin action. Each entry shows:

- **Action** — Color-coded badge: CREATE (green), UPDATE (amber), DELETE (red), RESTORE (blue), LOGIN (gray).
- **Entity Type** — The affected module (Section, Project, Skill, Lead, Experience, Testimonial, Blog, Service, FAQ, Activity, User).
- **Entity ID** — Truncated UUID for cross-referencing.
- **Changes** — Brief description of what changed (e.g., "Updated project title from 'Old' to 'New'").
- **Timestamp** — When the action occurred.
- **Actor** — Which user performed the action.

### 8.2 Audit Trail Review

The audit log is immutable — entries cannot be edited or deleted. Use it for:
- Compliance reviews (who changed what and when).
- Debugging unexpected content changes.
- Monitoring admin activity for security.

### 8.3 Export Functionality

1. Click **Export CSV** (top-right).
2. Downloads a complete CSV of all activity log entries.
3. Use for external audit tools or record-keeping.

---

*Last updated: July 2026. For questions or feature requests, contact the system administrator.*

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
