import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";

export function usePdfPages(file: File | null) {
    const [dataUrl, setDataUrl] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState(0);

    useEffect(() => {
        if (!file) {
            setDataUrl(null);
            setPageCount(0);
            return;
        }

        let cancelled = false;
        setDataUrl(null);
        setPageCount(0);

        const reader = new FileReader();
        reader.onload = () => {
            if (cancelled || typeof reader.result !== "string") {
                return;
            }

            const result = reader.result;
            setDataUrl(result);

            pdfjs
                .getDocument(result)
                .promise.then((pdf) => {
                    if (!cancelled) setPageCount(pdf.numPages);
                })
                .catch(() => {
                    if (!cancelled) setPageCount(0);
                });
        };
        reader.readAsDataURL(file);

        return () => {
            cancelled = true;
            reader.abort();
        };
    }, [file]);

    return { dataUrl, pageCount };
}
