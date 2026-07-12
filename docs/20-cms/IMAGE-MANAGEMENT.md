# Image Management — Storage, Optimization, and Delivery

> **Document:** `20-cms/IMAGE-MANAGEMENT.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active
> **Related:** [CMS-ARCHITECTURE.md](CMS-ARCHITECTURE.md), [CONTENT-MODEL.md](CONTENT-MODEL.md)

---

## 1. Supported Formats

| Format | Use Case | Browser Support | Accepted for Upload |
|--------|----------|-----------------|---------------------|
| JPEG | Photographs, complex images | Universal | Yes |
| PNG | Screenshots, transparency | Universal | Yes |
| WebP | Modern web delivery | 95%+ | Yes (preferred) |
| AVIF | Next-gen compression | 80%+ | Yes |
| GIF | Simple animations | Universal | Yes |
| SVG | Icons, logos, illustrations | Universal | No (use code instead) |

## 2. File Size Limits

| Context | Limit | Configuration |
|---------|-------|---------------|
| Single image upload | 5 MB | Multer config in `AdminMediaController` |
| Admin UI hint | 5 MB | Displayed in `ImageUpload` component |
| Maximum resolution | 4096px on longest edge | Enforced at upload (client-side check) |

Size limits are configured in the Multer disk storage configuration at `apps/api/src/admin/controllers/media.controller.ts`. The `ImageUpload` component performs client-side validation before submitting.

## 3. Image Processing Pipeline

```
User selects file
    │
    ▼
Client-side validation (type, size, dimensions)
    │
    ▼
POST /api/admin/media/upload (multipart/form-data)
    │
    ├── Multer middleware saves to local uploads/
    │   └── UUID-based filename: {uuid}.{ext}
    │
    ├── MediaService.create()
    │   └── Writes MediaAsset record to PostgreSQL
    │       ├── fileName (original)
    │       ├── filePath (server path)
    │       ├── bucketName ("assets")
    │       ├── mimeType
    │       ├── fileSizeBytes
    │       ├── width / height (if readable)
    │       ├── altText (required, user-provided)
    │       └── variants (future: responsive image URLs)
    │
    └── Response: { data: MediaAsset }
```

### 3.1 Upload Endpoint

**`POST /api/admin/media/upload`** — Authenticated (admin/editor), accepts `multipart/form-data` with field name `file`.

Request:
```
POST /api/admin/media/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary image data>
```

Response:
```json
{
  "data": {
    "id": "uuid",
    "fileName": "screenshot.png",
    "filePath": "uploads/uuid-file.png",
    "mimeType": "image/png",
    "fileSizeBytes": 245760,
    "width": 1920,
    "height": 1080,
    "altText": null,
    "createdAt": "2026-07-11T..."
  }
}
```

### 3.2 Future Optimization Pipeline (Planned)

The current pipeline saves files to local disk directly. A planned enhancement will add:

```
Upload received
    │
    ▼
Store original in Supabase Storage (bucket: assets)
    │
    ▼
Process with sharp:
    ├── Resize to responsive variants (thumb 150px, medium 768px, large 1920px)
    ├── Generate WebP versions
    ├── Generate AVIF versions (browser support permitting)
    └── Store variant URLs in MediaAsset.variants JSONB
    │
    ▼
CDN delivery via Vercel Edge Network
```

## 4. Image Storage

### 4.1 Storage Backend

Images are stored in **Supabase Storage** under the `assets` bucket. The `MediaAsset` Prisma model tracks metadata:

```prisma
model MediaAsset {
  id            String   @id @default(uuid())
  fileName      String   @map("file_name")
  filePath      String   @map("file_path")
  bucketName    String   @default("assets") @map("bucket_name")
  mimeType      String   @map("mime_type")
  fileSizeBytes Int      @default(0) @map("file_size_bytes")
  width         Int?
  height        Int?
  altText       String?  @map("alt_text")
  uploadedBy    String?  @map("uploaded_by")
  variants      Json     @default("{}")
  createdAt     DateTime @default(now()) @map("created_at")
  deletedAt     DateTime? @map("deleted_at")

  uploader User? @relation(fields: [uploadedBy], references: [id], onDelete: SetNull)
}
```

### 4.2 Storage Buckets

| Bucket | Visibility | Purpose |
|--------|-----------|---------|
| `assets` | Public | Portfolio images (project covers, blog images, section backgrounds) |
| (future: `admin-uploads`) | Private | Draft images not yet published |

## 5. CDN Delivery

Images are served through **Vercel Edge Network** with the following caching policy:

| Asset Type | Cache-Control | CDN TTL |
|------------|--------------|---------|
| Uploaded images | `s-maxage=31536000, immutable` | 365 days |
| next/image optimized | `s-maxage=31536000, immutable` | 365 days |

Immutable caching is safe because Vercel generates unique URLs for each image variant via `next/image`.

## 6. Image Optimization

### 6.1 next/image (Frontend)

The Next.js `Image` component handles runtime optimization:

```
<Image
  src={project.coverImage}
  alt={project.title}
  width={1200}
  height={675}
  priority={isAboveFold}
/>
```

Optimization features:
- **Format negotiation** — Serves AVIF when the browser supports it, WebP as fallback
- **Responsive sizes** — Generates appropriately sized images based on the `sizes` attribute
- **Lazy loading** — Native `loading="lazy"` for below-fold images, `priority` for above-fold
- **Blur placeholder** — Automatic blur-up placeholder for smooth loading

### 6.2 Image Component Usage Guidelines

| Context | Width | Sizes Attribute | Priority |
|---------|-------|-----------------|----------|
| Hero/cover image | 1920px | `100vw` | Yes |
| Project thumbnail | 600px | `(max-width: 768px) 100vw, 33vw` | No |
| Blog cover | 1200px | `100vw` | Yes (above fold) |
| Avatar | 96px | `96px` | No |
| Gallery image | 800px | `(max-width: 768px) 100vw, 50vw` | No |

## 7. Admin Interface

### 7.1 ImageUpload Component

Located at `apps/web/src/components/admin/ImageUpload.tsx`, the component provides:

- **Drag-and-drop zone** — Dashed border area that accepts dragged files
- **Browse button** — Fallback file picker for non-drag users
- **Preview** — Shows uploaded image with hover overlay for change/remove
- **Upload progress** — Loading state while upload is in progress
- **Error display** — Inline error messages for validation failures
- **Accessibility** — Label association, keyboard-accessible controls

### 7.2 Media Library

The admin media library (`GET /api/admin/media`) provides:
- Paginated list of all uploaded assets
- Filter by MIME type (filter images, documents, etc.)
- Sort by upload date (newest first)
- View asset details (filename, dimensions, file size, uploader, upload date)
- Delete assets (admin only, logged to audit)

## 8. Alt Text Requirements

**Alt text is required for all uploaded images.** This serves two purposes:

1. **Accessibility** — Screen readers rely on alt text to describe images to visually impaired users
2. **SEO** — Search engines use alt text for image indexing and ranking

The `ImageUpload` component includes an alt text field that must be filled before the image URL can be saved to content. Alt text should be descriptive, concise (under 125 characters), and contextual.

## 9. Cleanup & Maintenance

### 9.1 Orphaned Media Detection

A scheduled cleanup process (cron job, `/api/admin/media/cleanup`) detects and handles orphaned media:

- **Orphaned assets:** MediaAsset records where the file no longer exists in storage
- **Unreferenced assets:** MediaAsset records not referenced by any content (project cover, blog cover, section content, etc.)
- **Old temp files:** Uploads in progress that were never finalized

### 9.2 Storage Audit

Periodic audits (quarterly) check:
- Total storage usage vs. quota
- Largest files that could be optimized
- Rarely accessed files (older than 6 months with zero references)
- Format distribution (encouraging WebP/AVIF adoption)

## 10. API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/media` | admin/editor/viewer | List all media assets (paginated, filterable) |
| `GET` | `/api/admin/media/:id` | admin/editor/viewer | Get single media asset details |
| `POST` | `/api/admin/media/upload` | admin/editor | Upload a new image (multipart) |
| `DELETE` | `/api/admin/media/:id` | admin | Delete a media asset |

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| [MASTER-INDEX.md](../MASTER-INDEX.md) | Documentation master index |
| [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) | Cross-reference mapping |
| [CMS-ARCHITECTURE.md](CMS-ARCHITECTURE.md) | CMS architecture overview |
| [CONTENT-MODEL.md](CONTENT-MODEL.md) | Content model reference |
| [SANDBOX-IDE.md](SANDBOX-IDE.md) | Sandbox IDE architecture |
| [PerformanceArchitecture.md](../15-performance/PERFORMANCE-ARCHITECTURE.md) | Performance optimization |
| [SEO-ARCHITECTURE.md](../17-seo/SEO-ARCHITECTURE.md) | SEO architecture for images |
