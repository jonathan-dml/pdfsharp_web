import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, apiUrl, downloadBlob, isPdfFile, parseErrorMessage } from "./api";
import { PageThumbnail } from "./PageThumbnail";
import { UploadDropzone } from "./UploadDropzone";
import { usePdfPages } from "./usePdfPages";

export function CopyContent() {
    const { t } = useTranslation();
    const [sourceFile, setSourceFile] = useState<File | null>(null);
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isCopying, setIsCopying] = useState(false);
    const { dataUrl: sourceDataUrl, pageCount: sourcePageCount } = usePdfPages(sourceFile);

    function handleSourceFiles(files: FileList | File[]) {
        const selected = Array.from(files).find(isPdfFile);

        if (!selected) {
            setError(t("copyUpload.invalidFile"));
            return;
        }

        setSourceFile(selected);
        setSelectedPages([]);
        setError("");
    }

    function handleTargetFiles(files: FileList | File[]) {
        const selected = Array.from(files).find(isPdfFile);

        if (!selected) {
            setError(t("copyUpload.invalidFile"));
            return;
        }

        setTargetFile(selected);
        setError("");
    }

    function togglePage(pageNumber: number) {
        setSelectedPages((current) =>
            current.includes(pageNumber)
                ? current.filter((page) => page !== pageNumber)
                : [...current, pageNumber],
        );
    }

    async function copyPages() {
        if (!sourceFile || !targetFile) {
            setError(t("copyUpload.missingFiles"));
            return;
        }

        if (selectedPages.length === 0) {
            setError(t("copyUpload.missingPages"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("copyUpload.missingApiUrl"));
            return;
        }

        setIsCopying(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("fileToCopy", sourceFile);
            formData.append("targetFile", targetFile);
            selectedPages.forEach((pageNumber) => formData.append("selectedPages", String(pageNumber)));

            const response = await fetch(apiUrl("/copy"), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await parseErrorMessage(response, t("copyUpload.copyFailed")));
            }

            downloadBlob(await response.blob(), "copied-pages.pdf");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("copyUpload.copyFailed"));
        } finally {
            setIsCopying(false);
        }
    }

    return (
        <div className="page-select-workspace">
            <div className="page-select-top">
                <div className="two-file-row">
                    <div className="two-file-column">
                        <span className="eyebrow">{t("copyUpload.sourceLabel")}</span>
                        <UploadDropzone
                            onFiles={handleSourceFiles}
                            title={t("copyUpload.sourceDropTitle")}
                            hint={t("copyUpload.dropHint")}
                            browseLabel={t("copyUpload.browse")}
                            accept="application/pdf,.pdf"
                            multiple={false}
                        />
                        {sourceFile && (
                            <div className="two-file-summary">
                                <strong title={sourceFile.name}>{sourceFile.name}</strong>
                                <span className="page-select-count">{sourcePageCount} {t("copyUpload.pages")}</span>
                            </div>
                        )}
                    </div>
                    <div className="two-file-column">
                        <span className="eyebrow">{t("copyUpload.targetLabel")}</span>
                        <UploadDropzone
                            onFiles={handleTargetFiles}
                            title={t("copyUpload.targetDropTitle")}
                            hint={t("copyUpload.dropHint")}
                            browseLabel={t("copyUpload.browse")}
                            accept="application/pdf,.pdf"
                            multiple={false}
                        />
                        {targetFile && (
                            <div className="two-file-summary">
                                <strong title={targetFile.name}>{targetFile.name}</strong>
                            </div>
                        )}
                    </div>
                </div>

                {sourceFile && (
                    <div className="page-select-editor">
                        <div className="page-select-summary">
                            <span className="eyebrow">{t("copyUpload.selectFromSource")}</span>
                            <span className="page-select-count">
                                {t("copyUpload.selectedCount", { count: selectedPages.length, total: sourcePageCount })}
                            </span>
                        </div>

                        <p className="page-select-hint">{t("copyUpload.selectHint")}</p>

                        {sourcePageCount === 0 || !sourceDataUrl ? (
                            <p className="preview-status">{t("copyUpload.previewLoading")}</p>
                        ) : (
                            <div className="page-grid">
                                {Array.from({ length: sourcePageCount }, (_, index) => index + 1).map((pageNumber) => {
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
                                                    file={sourceDataUrl}
                                                    pageNumber={pageNumber}
                                                    loadingLabel={t("copyUpload.previewLoading")}
                                                    errorLabel={t("copyUpload.previewError")}
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
                            disabled={isCopying || !targetFile || selectedPages.length === 0}
                            onClick={copyPages}
                        >
                            {isCopying ? t("copyUpload.copying") : t("copyUpload.copyPages")}
                        </button>
                    </div>
                )}

                {error && <p className="upload-error" role="alert">{error}</p>}

                {!sourceFile && (
                    <div className="split-placeholder">
                        <p>{t("copyUpload.previewEmpty")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
