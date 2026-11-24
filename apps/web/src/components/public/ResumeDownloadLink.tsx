const RESUME_PDF = '/resume/rohith-naidu-resume.pdf';

/**
 * Download entry point for the print-ready résumé. Kept as a plain anchor so
 * it stays server-renderable; interaction tracking arrives in a later task.
 */
export function ResumeDownloadLink() {
  return (
    <div className="resume__actions">
      <a className="btn" href={RESUME_PDF} download>
        Download PDF
      </a>
    </div>
  );
}
