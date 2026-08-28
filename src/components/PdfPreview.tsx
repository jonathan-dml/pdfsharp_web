import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

type PdfPreviewProps = {
    documents: File[];
    emptyLabel: string;
    loadingLabel: string;
    errorLabel: string;
};

function PreviewDocument({
    file,
    loadingLabel,
    errorLabel,
}: {
    file: File;
    loadingLabel: string;
    errorLabel: string;
}) {
    const [pageCount, setPageCount] = useState(0);

    return (
        <Document
            file={file}
            loading={<span className="preview-status">{loadingLabel}</span>}
            error={<span className="preview-status">{errorLabel}</span>}
            onLoadSuccess={({ numPages }) => setPageCount(numPages)}
        >
            {Array.from({ length: pageCount }, (_, pageIndex) => (
                <div className="preview-page" key={`${file.name}-${pageIndex + 1}`}>
                    <Page
                        pageNumber={pageIndex + 1}
                        width={132}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                    />
                    <span>{String(pageIndex + 1).padStart(2, "0")}</span>
                </div>
            ))}
        </Document>
    );
}

export function PdfPreview({
    documents,
    emptyLabel,
    loadingLabel,
    errorLabel,
}: PdfPreviewProps) {
    const { t } = useTranslation();

    return (
        <div className="preview-wrapper">
            <span className="eyebrow">{t("mergeUpload.previewTitle")}</span>
            <section className="pdf-preview" aria-label="PDF page preview">
                {documents.length === 0 ? (
                    <p className="preview-empty">{emptyLabel}</p>
                ) : (
                    <div className="preview-grid">
                        {documents.map((file, index) => (
                            <PreviewDocument
                                key={`${file.name}-${file.lastModified}-${index}`}
                                file={file}
                                loadingLabel={loadingLabel}
                                errorLabel={errorLabel}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}