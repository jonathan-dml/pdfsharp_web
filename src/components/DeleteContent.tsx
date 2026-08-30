import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, apiUrl, downloadBlob, isPdfFile, parseErrorMessage } from "./api";
import { PageThumbnail } from "./PageThumbnail";
import { UploadDropzone } from "./UploadDropzone";
import { usePdfPages } from "./usePdfPages";

export function DeleteContent() {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pagesToDelete, setPagesToDelete] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const { dataUrl, pageCount } = usePdfPages(selectedFile);

    function handleFiles(files: FileList | File[]) {
        const selected = Array.from(files).find(isPdfFile);

        if (!selected) {
            setError(t("deleteUpload.invalidFile"));
            return;
        }

        setSelectedFile(selected);
        setPagesToDelete([]);
        setError("");
    }

    function togglePage(pageNumber: number) {
        setPagesToDelete((current) =>
            current.includes(pageNumber)
                ? current.filter((page) => page !== pageNumber)
                : [...current, pageNumber],
        );
    }

    async function deletePages() {
        if (!selectedFile) {
            setError(t("deleteUpload.missingFile"));
            return;
        }

        if (pagesToDelete.length === 0) {
            setError(t("deleteUpload.missingPages"));
            return;
        }

        if (pagesToDelete.length >= pageCount) {
            setError(t("deleteUpload.mustKeepOne"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("deleteUpload.missingApiUrl"));
            return;
        }

        setIsDeleting(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            pagesToDelete.forEach((pageNumber) => formData.append("selectedPages", String(pageNumber)));

            const response = await fetch(apiUrl("/delete"), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await parseErrorMessage(response, t("deleteUpload.deleteFailed")));
            }

            downloadBlob(await response.blob(), "deleted-pages-removed.pdf");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("deleteUpload.deleteFailed"));
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="page-select-workspace">
            <div className="page-select-top">
                <UploadDropzone
                    onFiles={handleFiles}
                    title={t("deleteUpload.dropTitle")}
                    hint={t("deleteUpload.dropHint")}
                    browseLabel={t("deleteUpload.browse")}
                    accept="application/pdf,.pdf"
                    multiple={false}
                />

                {selectedFile && (
                    <div className="page-select-editor">
                        <div className="page-select-summary">
                            <div>
                                <span className="eyebrow">{t("deleteUpload.file")}</span>
                                <strong>{selectedFile.name}</strong>
                            </div>
                            <span className="page-select-count">
                                {t("deleteUpload.markedCount", { count: pagesToDelete.length, total: pageCount })}
                            </span>
                        </div>

                        <p className="page-select-hint">{t("deleteUpload.selectHint")}</p>

                        {pageCount === 0 || !dataUrl ? (
                            <p className="preview-status">{t("deleteUpload.previewLoading")}</p>
                        ) : (
                            <div className="page-grid">
                                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
                                    const isMarked = pagesToDelete.includes(pageNumber);
                                    return (
                                        <button
                                            key={pageNumber}
                                            type="button"
                                            className={`page-card selectable${isMarked ? " marked-remove" : ""}`}
                                            onClick={() => togglePage(pageNumber)}
                                            aria-pressed={isMarked}
                                        >
                                            <div className="page-card-preview">
                                                <PageThumbnail
                                                    file={dataUrl}
                                                    pageNumber={pageNumber}
                                                    loadingLabel={t("deleteUpload.previewLoading")}
                                                    errorLabel={t("deleteUpload.previewError")}
                                                />
                                                {isMarked && (
                                                    <span className="page-card-remove-mark" aria-hidden="true">&#10005;</span>
                                                )}
                                            </div>
                                            <span className="page-card-index">{String(pageNumber).padStart(2, "0")}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            className="page-select-action"
                            type="button"
                            disabled={isDeleting || pagesToDelete.length === 0}
                            onClick={deletePages}
                        >
                            {isDeleting ? t("deleteUpload.deleting") : t("deleteUpload.deletePdf")}
                        </button>
                    </div>
                )}

                {error && <p className="upload-error" role="alert">{error}</p>}

                {!selectedFile && (
                    <div className="split-placeholder">
                        <p>{t("deleteUpload.previewEmpty")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
