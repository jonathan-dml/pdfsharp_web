import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

type PageThumbnailProps = {
    file: string;
    pageNumber: number;
    width?: number;
    rotate?: number;
    loadingLabel: string;
    errorLabel: string;
};

export function PageThumbnail({
    file,
    pageNumber,
    width = 130,
    rotate = 0,
    loadingLabel,
    errorLabel,
}: PageThumbnailProps) {
    return (
        <Document
            file={file}
            loading={<span className="preview-status">{loadingLabel}</span>}
            error={<span className="preview-status">{errorLabel}</span>}
        >
            <Page
                pageNumber={pageNumber}
                width={width}
                rotate={rotate}
                renderTextLayer={false}
                renderAnnotationLayer={false}
            />
        </Document>
    );
}
