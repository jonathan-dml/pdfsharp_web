import { useEffect, useState } from "react";
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { API_BASE_URL, apiUrl, downloadBlob, isPdfFile, parseErrorMessage } from "./api";
import { PageThumbnail } from "./PageThumbnail";
import { UploadDropzone } from "./UploadDropzone";
import { usePdfPages } from "./usePdfPages";

function SortablePageCard({
    file,
    pageNumber,
    position,
    loadingLabel,
    errorLabel,
}: {
    file: string;
    pageNumber: number;
    position: number;
    loadingLabel: string;
    errorLabel: string;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: pageNumber,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.7 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="page-card grabbable"
            {...attributes}
            {...listeners}
            aria-label={`Drag page ${pageNumber}`}
        >
            <div className="page-card-preview">
                <PageThumbnail
                    file={file}
                    pageNumber={pageNumber}
                    loadingLabel={loadingLabel}
                    errorLabel={errorLabel}
                />
            </div>
            <span className="page-card-index">{String(pageNumber).padStart(2, "0")}</span>
            <span className="page-card-badge">{position}</span>
        </div>
    );
}

export function ReorderContent() {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [order, setOrder] = useState<number[]>([]);
    const [error, setError] = useState("");
    const [isReordering, setIsReordering] = useState(false);
    const { dataUrl, pageCount } = usePdfPages(selectedFile);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );

    useEffect(() => {
        if (pageCount === 0) {
            setOrder([]);
            return;
        }

        setOrder(Array.from({ length: pageCount }, (_, index) => index + 1));
    }, [pageCount]);

    function handleFiles(files: FileList | File[]) {
        const selected = Array.from(files).find(isPdfFile);

        if (!selected) {
            setError(t("reorderUpload.invalidFile"));
            return;
        }

        setSelectedFile(selected);
        setOrder([]);
        setError("");
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setOrder((current) => {
            const oldIndex = current.indexOf(Number(active.id));
            const newIndex = current.indexOf(Number(over.id));

            if (oldIndex === -1 || newIndex === -1) {
                return current;
            }

            return arrayMove(current, oldIndex, newIndex);
        });
    }

    const isUnchanged = order.every((pageNumber, index) => pageNumber === index + 1);

    async function reorderPdf() {
        if (!selectedFile) {
            setError(t("reorderUpload.missingFile"));
            return;
        }

        if (isUnchanged) {
            setError(t("reorderUpload.missingChanges"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("reorderUpload.missingApiUrl"));
            return;
        }

        setIsReordering(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const newOrder = Object.fromEntries(
                order.map((originalPageNumber, index) => [originalPageNumber, index + 1]),
            );
            formData.append("newOrder", JSON.stringify(newOrder));

            const response = await fetch(apiUrl("/reorder"), {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(await parseErrorMessage(response, t("reorderUpload.reorderFailed")));
            }

            downloadBlob(await response.blob(), "reordered.pdf");
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("reorderUpload.reorderFailed"));
        } finally {
            setIsReordering(false);
        }
    }

    return (
        <div className="page-select-workspace">
            <div className="page-select-top">
                <UploadDropzone
                    onFiles={handleFiles}
                    title={t("reorderUpload.dropTitle")}
                    hint={t("reorderUpload.dropHint")}
                    browseLabel={t("reorderUpload.browse")}
                    accept="application/pdf,.pdf"
                    multiple={false}
                />

                {selectedFile && (
                    <div className="page-select-editor">
                        <div className="page-select-summary">
                            <div>
                                <span className="eyebrow">{t("reorderUpload.file")}</span>
                                <strong>{selectedFile.name}</strong>
                            </div>
                            <span className="page-select-count">{pageCount} {t("reorderUpload.pages")}</span>
                        </div>

                        <p className="page-select-hint">{t("reorderUpload.selectHint")}</p>

                        {pageCount === 0 || !dataUrl ? (
                            <p className="preview-status">{t("reorderUpload.previewLoading")}</p>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={order} strategy={rectSortingStrategy}>
                                    <div className="page-grid">
                                        {order.map((pageNumber, index) => (
                                            <SortablePageCard
                                                key={pageNumber}
                                                file={dataUrl}
                                                pageNumber={pageNumber}
                                                position={index + 1}
                                                loadingLabel={t("reorderUpload.previewLoading")}
                                                errorLabel={t("reorderUpload.previewError")}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}

                        <button
                            className="page-select-action"
                            type="button"
                            disabled={isReordering || isUnchanged}
                            onClick={reorderPdf}
                        >
                            {isReordering ? t("reorderUpload.reordering") : t("reorderUpload.reorderPdf")}
                        </button>
                    </div>
                )}

                {error && <p className="upload-error" role="alert">{error}</p>}

                {!selectedFile && (
                    <div className="split-placeholder">
                        <p>{t("reorderUpload.previewEmpty")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
