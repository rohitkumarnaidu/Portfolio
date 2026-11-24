'use client';

import { track } from '@/lib/analytics';

const RESUME_PDF = '/resume/rohith-naidu-resume.pdf';

/**
 * Download entry point for the print-ready résumé. Stays a plain anchor so
 * the browser owns the download; the click also records one cookieless
 * `resume_download` event before navigation.
 */
export function ResumeDownloadLink() {
  return (
    <div className="resume__actions">
      <a
        className="btn"
        href={RESUME_PDF}
        download
        onClick={() => track('resume_download', { format: 'pdf' })}
      >
        Download PDF
      </a>
    </div>
  );
}
