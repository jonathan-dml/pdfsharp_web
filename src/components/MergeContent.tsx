import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PdfPreview } from "./PdfPreview";
import { UploadDropzone } from "./UploadDropzone";

const MAX_DOCUMENTS = 2;
const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = import.meta.env.DEV ? "/api" : API_URL;

function isPdf(file: File) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function MergeContent() {
    const { t } = useTranslation();
    const [documents, setDocuments] = useState<File[]>([]);
    const [error, setError] = useState("");
    const [isMerging, setIsMerging] = useState(false);

    function addDocuments(files: FileList | File[]) {
        const pdfs = Array.from(files).filter(isPdf);
        const availableSlots = MAX_DOCUMENTS - documents.length;

        if (pdfs.length === 0) {
            setError(t("mergeUpload.invalidFile"));
        } else if (pdfs.length > availableSlots) {
            setError(t("mergeUpload.limit"));
        } else {
            setError("");
        }

        setDocuments((current) => [...current, ...pdfs.slice(0, Math.max(availableSlots, 0))]);
    }

    function removeDocument(index: number) {
        setDocuments((current) => current.filter((_, documentIndex) => documentIndex !== index));
        setError("");
    }

    function swapDocuments() {
        setDocuments((current) => current.length === 2 ? [current[1], current[0]] : current);
    }

    async function mergeDocuments() {
        if (documents.length !== MAX_DOCUMENTS) {
            setError(t("mergeUpload.mergeRequiresTwo"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("mergeUpload.missingApiUrl"));
            return;
        }

        setIsMerging(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file1", documents[0]);
            formData.append("file2", documents[1]);

            const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/merge`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                let message = t("mergeUpload.mergeFailed");
                const responseText = await response.text();
                try {
                    const responseError = JSON.parse(responseText) as { message?: string; title?: string; detail?: string };
                    message = responseError.message ?? responseError.detail ?? responseError.title ?? message;
                } catch {
                    if (responseText) message = responseText;
                }
                throw new Error(message);
            }

            const downloadUrl = URL.createObjectURL(await response.blob());
            const downloadLink = document.createElement("a");
            downloadLink.href = downloadUrl;
            downloadLink.download = "merged.pdf";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("mergeUpload.mergeFailed"));
        } finally {
            setIsMerging(false);
        }
    }

    return (
        <div className="merge-workspace">
            <div className="merge-top-row">
                <div className="merge-file-column">
                    <UploadDropzone
                        onFiles={addDocuments}
                        title={t("mergeUpload.dropTitle")}
                        hint={t("mergeUpload.dropHint")}
                        browseLabel={t("mergeUpload.browse")}
                    />

                    <div className="document-list" aria-live="polite">
                        <div className="document-list-heading">
                            <span>{t("mergeUpload.documents")}</span>
                            <span>{documents.length}/{MAX_DOCUMENTS}</span>
                        </div>
                        {documents.length === 0 ? (
                            <p className="document-empty">{t("mergeUpload.empty")}</p>
                        ) : (
                            documents.map((document, index) => (
                                <div className="document-row" key={`${document.name}-${document.lastModified}-${index}`}>
                                    <span className="document-number">0{index + 1}</span>
                                    <span className="document-icon" aria-hidden="true">PDF</span>
                                    <span className="document-name" title={document.name}>{document.name}</span>
                                    <span className="document-size">{(document.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <button className="icon-button" type="button" aria-label={t("mergeUpload.remove", { name: document.name })} onClick={() => removeDocument(index)}>
                                        <span aria-hidden="true">x</span>
                                    </button>
                                </div>
                            ))
                        )}
                        <button className="swap-button" type="button" disabled={documents.length !== 2} onClick={swapDocuments}>
                            <span aria-hidden="true">&#8646;</span>
                            {t("mergeUpload.swap")}
                        </button>
                        <button className="merge-button" type="button" disabled={isMerging || documents.length !== MAX_DOCUMENTS} onClick={mergeDocuments}>
                            {isMerging ? t("mergeUpload.merging") : t("mergeUpload.mergePdf")}
                        </button>
                        {error && <p className="upload-error" role="alert">{error}</p>}
                    </div>
                </div>
                <PdfPreview
                    documents={documents}
                    emptyLabel={t("mergeUpload.previewEmpty")}
                    loadingLabel={t("mergeUpload.previewLoading")}
                    errorLabel={t("mergeUpload.previewError")}
                />
            </div>
        </div>
    );
}