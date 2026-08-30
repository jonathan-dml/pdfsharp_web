const API_URL = import.meta.env.VITE_API_URL;
export const API_BASE_URL = import.meta.env.DEV ? "/api" : API_URL;

type ApiErrorBody = { message?: string; title?: string; detail?: string };

export async function parseErrorMessage(response: Response, fallback: string) {
    const responseText = await response.text();
    try {
        const parsed = JSON.parse(responseText) as ApiErrorBody;
        return parsed.message ?? parsed.detail ?? parsed.title ?? fallback;
    } catch {
        return responseText || fallback;
    }
}

export function downloadBlob(blob: Blob, filename: string) {
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
}

export function isPdfFile(file: File) {
    return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function apiUrl(path: string) {
    return `${API_BASE_URL.replace(/\/$/, "")}${path}`;
}
