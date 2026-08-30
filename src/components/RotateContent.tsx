import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, apiUrl, downloadBlob, isPdfFile, parseErrorMessage } from "./api";
import { PageThumbnail } from "./PageThumbnail";
import { UploadDropzone } from "./UploadDropzone";
import { usePdfPages } from "./usePdfPages";

type RotationAngle = 0 | 90 | 180 | 270;

function nextAngle(angle: RotationAngle): RotationAngle {
    return ((angle + 90) % 360) as RotationAngle;
}

export function RotateContent() {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [rotations, setRotations] = useState<Record<number, RotationAngle>>({});
    const [error, setError] = useState("");
    const [isRotating, setIsRotating] = useState(false);
    const { dataUrl, pageCount } = usePdfPages(selectedFile);

    useEffect(() => {
        if (pageCount === 0) {
            setRotations({});
            return;
        }

        setRotations((current) => {
            const next: Record<number, RotationAngle> = {};
            for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
                next[pageNumber] = current[pageNumber] ?? 0;
            }
            return next;
        });
    }, [pageCount]);

    function handleFiles(files: FileList | File[]) {
        const selected = Array.from(files).find(isPdfFile);

        if (!selected) {
            setError(t("rotateUpload.invalidFile"));
            return;
        }

        setSelectedFile(selected);
        setRotations({});
        setError("");
    }

    function rotatePage(pageNumber: number) {
        setRotations((current) => ({
            ...current,
            [pageNumber]: nextAngle(current[pageNumber] ?? 0),
        }));
    }

    const hasChanges = Object.values(rotations).some((angle) => angle !== 0);

    async function rotatePdf() {
        if (!selectedFile) {
            setError(t("rotateUpload.missingFile"));
            return;
        }

        if (!hasChanges) {
            setError(t("rotateUpload.missingRotations"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("rotateUpload.missingApiUrl"));
            return;
        }

        setIsRotating(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("rotationAngles", JSON.stringify(rotations));

            const response = await fetch(apiUrl("/rotate"), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await parseErrorMessage(response, t("rotateUpload.rotateFailed")));
            }

            downloadBlob(await response.blob(), "rotated.pdf");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("rotateUpload.rotateFailed"));
        } finally {
            setIsRotating(false);
        }
    }

    return (
        <div className="page-select-workspace">
            <div className="page-select-top">
                <UploadDropzone
                    onFiles={handleFiles}
                    title={t("rotateUpload.dropTitle")}
                    hint={t("rotateUpload.dropHint")}
                    browseLabel={t("rotateUpload.browse")}
                    accept="application/pdf,.pdf"
                    multiple={false}
                />

                {selectedFile && (
                    <div className="page-select-editor">
                        <div className="page-select-summary">
                            <div>
                                <span className="eyebrow">{t("rotateUpload.file")}</span>
                                <strong>{selectedFile.name}</strong>
                            </div>
                            <span className="page-select-count">{pageCount} {t("rotateUpload.pages")}</span>
                        </div>

                        <p className="page-select-hint">{t("rotateUpload.selectHint")}</p>

                        {pageCount === 0 || !dataUrl ? (
                            <p className="preview-status">{t("rotateUpload.previewLoading")}</p>
                        ) : (
                            <div className="page-grid">
                                {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => {
                                    const angle = rotations[pageNumber] ?? 0;
                                    return (
                                        <div key={pageNumber} className={`page-card${angle !== 0 ? " selected" : ""}`}>
                                            <div className="page-card-preview">
                                                <PageThumbnail
                                                    file={dataUrl}
                                                    pageNumber={pageNumber}
                                                    rotate={angle}
                                                    loadingLabel={t("rotateUpload.previewLoading")}
                                                    errorLabel={t("rotateUpload.previewError")}
                                                />
                                            </div>
                                            <span className="page-card-index">{String(pageNumber).padStart(2, "0")}</span>
                                            {angle !== 0 && <span className="rotate-card-angle">{angle}&deg;</span>}
                                            <div className="rotate-card-controls">
                                                <button
                                                    type="button"
                                                    className="rotate-button"
                                                    onClick={() => rotatePage(pageNumber)}
                                                    aria-label={t("rotateUpload.rotatePage", { page: pageNumber })}
                                                >
                                                    <span aria-hidden="true">&#8635;</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <button
                            className="page-select-action"
                            type="button"
                            disabled={isRotating || !hasChanges}
                            onClick={rotatePdf}
                        >
                            {isRotating ? t("rotateUpload.rotating") : t("rotateUpload.rotatePdf")}
                        </button>
                    </div>
                )}

                {error && <p className="upload-error" role="alert">{error}</p>}

                {!selectedFile && (
                    <div className="split-placeholder">
                        <p>{t("rotateUpload.previewEmpty")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
