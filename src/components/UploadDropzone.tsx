import { useRef, useState } from "react";

type UploadDropzoneProps = {
    onFiles: (files: FileList) => void;
    title: string;
    hint: string;
    browseLabel: string;
    accept?: string;
    multiple?: boolean;
};

export function UploadDropzone({
    onFiles,
    title,
    hint,
    browseLabel,
    accept = "application/pdf,.pdf",
    multiple = true,
}: UploadDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files) {
            onFiles(event.target.files);
        }
        event.target.value = "";
    }

    function handleDrop(event: React.DragEvent<HTMLDivElement>) {
        event.preventDefault();
        setIsDragging(false);
        onFiles(event.dataTransfer.files);
    }

    return (
        <div
            className={`upload-dropzone${isDragging ? " dragging" : ""}`}
            onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
                if (event.currentTarget === event.target) setIsDragging(false);
            }}
            onDrop={handleDrop}
        >
            <span className="upload-mark" aria-hidden="true">+</span>
            <strong>{title}</strong>
            <span>{hint}</span>
            <button className="browse-button" type="button" onClick={() => inputRef.current?.click()}>
                {browseLabel}
            </button>
            <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={handleFileChange} />
        </div>
    );
}