import { useEffect, useMemo, useState } from "react";
import {
    DndContext,
    PointerSensor,
    closestCenter,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslation } from "react-i18next";
import { Document, Page, pdfjs } from "react-pdf";
import { UploadDropzone } from "./UploadDropzone";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = import.meta.env.DEV ? "/api" : API_URL;

function buildInitialGroups(pageCount: number) {
    return Object.fromEntries(
        Array.from({ length: pageCount }, (_, index) => [index + 1, index + 1]),
    ) as Record<number, number>;
}

function normalizeGroups(groups: Record<number, number>, pageCount: number) {
    const normalized: Record<number, number> = {};

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const currentGroup = groups[pageNumber] ?? pageNumber;
        normalized[pageNumber] = currentGroup;
    }

    return normalized;
}

function resequenceGroups(groups: Record<number, number>, pageCount: number) {
    const normalized = normalizeGroups(groups, pageCount);
    const renumbered: Record<number, number> = {};
    const groupMap = new Map<number, number>();
    let nextGroupNumber = 1;

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        const originalGroup = normalized[pageNumber];

        if (!groupMap.has(originalGroup)) {
            groupMap.set(originalGroup, nextGroupNumber);
            nextGroupNumber += 1;
        }

        renumbered[pageNumber] = groupMap.get(originalGroup)!;
    }

    return renumbered;
}

function getHighestGroupNumber(groups: Record<number, number>) {
    const values = Object.values(groups);
    return values.length === 0 ? 0 : Math.max(...values);
}

type SortablePageCardProps = {
    file: File;
    pageNumber: number;
};

function SortableGroup({
    groupNumber,
    pages,
    file,
}: {
    groupNumber: number;
    pages: number[];
    file: File;
}) {
    return (
        <div className="split-group">
            <div className="split-group-header">Group {groupNumber}</div>
            <div className="split-page-grid">
                {pages.map((pageNumber) => (
                    <SortablePageCard key={pageNumber} file={file} pageNumber={pageNumber} />
                ))}
            </div>
        </div>
    );
}

function SortablePageCard({ file, pageNumber }: SortablePageCardProps) {
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
            className="split-page-card"
            data-page={pageNumber}
            {...attributes}
            {...listeners}
            aria-label={`Drag page ${pageNumber}`}
        >
            <div className="split-page-preview">
                <Document
                    file={file}
                    loading={<span className="preview-status">Loading pages...</span>}
                    error={<span className="preview-status">Unable to preview this PDF</span>}
                >
                    <Page
                        pageNumber={pageNumber}
                        width={110}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="split-page-render"
                    />
                </Document>
            </div>
        </div>
    );
}

export function SplitContent() {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pageCount, setPageCount] = useState(0);
    const [pageGroups, setPageGroups] = useState<Record<number, number>>({});
    const [error, setError] = useState("");
    const [isSplitting, setIsSplitting] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
    );
    const { setNodeRef: setGroupListRef } = useDroppable({
        id: "split-group-list",
    });

    useEffect(() => {
        if (!selectedFile) {
            setPageCount(0);
            setPageGroups({});
            return;
        }

        if (pageCount > 0) {
            setPageGroups(resequenceGroups(buildInitialGroups(pageCount), pageCount));
        }
    }, [selectedFile, pageCount]);

    function resetDocument(nextDocument: File | null) {
        setSelectedFile(nextDocument);
        setPageCount(0);
        setPageGroups({});
        setError("");
    }

    function handleFiles(files: FileList | File[]) {
        const selected = Array.from(files).find((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

        if (!selected) {
            setError(t("splitUpload.invalidFile"));
            return;
        }

        resetDocument(selected);
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!selectedFile || active.id === over?.id) {
            return;
        }

        const draggedPage = Number(active.id);
        const targetPage = Number(over?.id);

        if (!Number.isFinite(draggedPage)) {
            return;
        }

        setPageGroups((current) => {
            const currentGroup = current[draggedPage] ?? draggedPage;
            const isDetachedMove = !over || String(over.id) === "split-group-list" || !Number.isFinite(targetPage);
            const targetGroup = isDetachedMove
                ? getHighestGroupNumber(current) + 1
                : current[targetPage] ?? targetPage;

            if (currentGroup === targetGroup) {
                return current;
            }

            const nextGroups = { ...current, [draggedPage]: targetGroup };
            return resequenceGroups(nextGroups, pageCount);
        });
    }

    async function splitPdf() {
        if (!selectedFile) {
            setError(t("splitUpload.missingFile"));
            return;
        }

        if (!API_BASE_URL) {
            setError(t("splitUpload.missingApiUrl"));
            return;
        }

        setIsSplitting(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const payload = Object.fromEntries(
                Array.from({ length: pageCount }, (_, index) => [String(index + 1), pageGroups[index + 1] ?? index + 1]),
            );

            formData.append("pageGroups", JSON.stringify(payload));

            const response = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/split`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                let message = t("splitUpload.splitFailed");
                const responseText = await response.text();
                try {
                    const parsed = JSON.parse(responseText) as { message?: string; title?: string; detail?: string };
                    message = parsed.message ?? parsed.detail ?? parsed.title ?? message;
                } catch {
                    if (responseText) message = responseText;
                }
                throw new Error(message);
            }

            const downloadUrl = URL.createObjectURL(await response.blob());
            const downloadLink = document.createElement("a");
            downloadLink.href = downloadUrl;
            downloadLink.download = "split-pdfs.zip";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
            URL.revokeObjectURL(downloadUrl);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t("splitUpload.splitFailed"));
        } finally {
            setIsSplitting(false);
        }
    }

    const pageNumbers = useMemo(
        () => Array.from({ length: pageCount }, (_, index) => index + 1),
        [pageCount],
    );

    const groupedPages = useMemo(() => {
        const groups = new Map<number, number[]>();

        for (const pageNumber of pageNumbers) {
            const groupNumber = pageGroups[pageNumber] ?? pageNumber;
            const current = groups.get(groupNumber) ?? [];
            current.push(pageNumber);
            groups.set(groupNumber, current);
        }

        return Array.from(groups.entries()).sort(([left], [right]) => left - right);
    }, [pageGroups, pageNumbers]);

    return (
        <div className="split-workspace">
            <div className="split-top-row">
                <div className="split-file-column">
                    <UploadDropzone
                        onFiles={handleFiles}
                        title={t("splitUpload.dropTitle")}
                        hint={t("splitUpload.dropHint")}
                        browseLabel={t("splitUpload.browse")}
                        accept="application/pdf,.pdf"
                        multiple={false}
                    />

                    {selectedFile && (
                        <div className="split-editor">
                            <div className="split-summary">
                                <div>
                                    <span className="eyebrow">{t("splitUpload.file")}</span>
                                    <strong>{selectedFile.name}</strong>
                                </div>
                                <span className="split-count">{pageCount} pages</span>
                            </div>

                            <div className="split-preview-shell">
                                <span className="eyebrow">{t("splitUpload.previewTitle")}</span>
                                <p className="split-group-help">
                                    {t("splitUpload.groupingHelp")}
                                </p>
                                <Document
                                    file={selectedFile}
                                    loading={<span className="preview-status">{t("splitUpload.previewLoading")}</span>}
                                    error={<span className="preview-status">{t("splitUpload.previewError")}</span>}
                                    onLoadSuccess={({ numPages }) => setPageCount(numPages)}
                                >
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                        <SortableContext items={pageNumbers} strategy={rectSortingStrategy}>
                                            <div ref={setGroupListRef} id="split-group-list" className="split-group-list">
                                                {groupedPages.map(([groupNumber, pages]) => (
                                                    <SortableGroup
                                                        key={groupNumber}
                                                        groupNumber={groupNumber}
                                                        pages={pages}
                                                        file={selectedFile}
                                                    />
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </DndContext>
                                </Document>
                            </div>

                            <button
                                className="split-button"
                                type="button"
                                disabled={isSplitting || pageCount === 0}
                                onClick={splitPdf}
                            >
                                {isSplitting ? t("splitUpload.splitting") : t("splitUpload.splitPdf")}
                            </button>
                        </div>
                    )}

                    {error && <p className="upload-error" role="alert">{error}</p>}
                </div>
            </div>

            {!selectedFile && (
                <div className="split-placeholder">
                    <p>{t("splitUpload.previewEmpty")}</p>
                </div>
            )}

            {selectedFile && pageCount === 0 && (
                <div className="split-placeholder">
                    <p>{t("splitUpload.previewLoading")}</p>
                </div>
            )}
        </div>
    );
}
