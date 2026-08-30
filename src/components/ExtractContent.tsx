import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, apiUrl, downloadBlob, isPdfFile, parseErrorMessage } from "./api";
import { PageThumbnail } from "./PageThumbnail";
import { UploadDropzone } from "./UploadDropzone";
import { usePdfPages } from "./usePdfPages";

export function ExtractContent() {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const { dataUrl, pageCount } = usePdfPages(selectedFile);

    function handleFiles(files: FileList | File[]) {
        const selected = Array.from(files).find(isPdfFile);

        if (!selected) {
            setError(t("extractUpload.invalidFile"));
            return;
        }

        setSelectedFile(selected);
        setSelectedPages([]);
        setError("");
    }

    function togglePage(pageNumber: number) {
        setSelectedPages((current) =>
            current.includes(pageNumber)
                ? current.filter((page) => page !== pageNumber)
                : [...current, pageNumber],
        );
    }

    async function extractPages() {
        if (!selectedFile) {
            setError(t("extractUpload.missingFile"));
            return;
        }

        if (selectedPages.length === 0) {
            setError(t("extractUpload.missingPages"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("extractUpload.missingApiUrl"));
            return;
        }

        setIsExtracting(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            selectedPages.forEach((pageNumber) => formData.append("selectedPages", String(pageNumber)));

            const response = await fetch(apiUrl("/extract"), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await parseErrorMessage(response, t("extractUpload.extractFailed")));
            }

            downloadBlob(await response.blob(), "extracted.pdf");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("extractUpload.extractFailed"));
        } finally {
            setIsExtracting(false);
        }
    }

    return (
        <div className="page-select-workspace">
            <div className="page-select-top">
                <UploadDropzone
                    onFiles={handleFiles}
                    title={t("extractUpload.dropTitle")}
                    hint={t("extractUpload.dropHint")}
                    browseLabel={t("extractUpload.browse")}
                    accept="application/pdf,.pdf"
                    multiple={false}
                />

                {selectedFile && (
                    <div className="page-select-editor">
                        <div className="page-select-summary">
                            <div>
                                <span className="eyebrow">{t("extractUpload.file")}</span>
                                <strong>{selectedFile.name}</strong>
                            </div>
                            <span className="page-select-count">
                                {t("extractUpload.selectedCount", { count: selectedPages.length, total: pageCount })}
                            </span>
                        </div>

                        <p className="page-select-hint">{t("extractUpload.selectHint")}</p>

                        {pageCount === 0 || !dataUrl ? (
                            <p className="preview-status">{t("extractUpload.previewLoading")}</p>
                        ) : (
                            <div className="page-grid">
                                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
                                    const selectionIndex = selectedPages.indexOf(pageNumber);
                                    const isSelected = selectionIndex !== -1;
                                    return (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            className={`page-card selectable${isSelected ? " selected" : ""}`}
                                            onClick={() => togglePage(pageNumber)}
                                            aria-pressed={isSelected}
                                        >
                                            <div className="page-card-preview">
                                                <PageThumbnail
                                                    file={dataUrl}
                                                    pageNumber={pageNumber}
                                                    loadingLabel={t("extractUpload.previewLoading")}
                                                    errorLabel={t("extractUpload.previewError")}
                                                />
                                            </div>
                                            <span className="page-card-index">{String(pageNumber).padStart(2, "0")}</span>
                                            {isSelected && <span className="page-card-badge">{selectionIndex + 1}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            className="page-select-action"
                            type="button"
                            disabled={isExtracting || selectedPages.length === 0}
                            onClick={extractPages}
                        >
                            {isExtracting ? t("extractUpload.extracting") : t("extractUpload.extractPdf")}
                        </button>
                    </div>
                )}

                {error && <p className="upload-error" role="alert">{error}</p>}

                {!selectedFile && (
                    <div className="split-placeholder">
                        <p>{t("extractUpload.previewEmpty")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
