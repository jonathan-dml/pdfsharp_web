import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export const supportedLanguages = {
    en: "English",
    pt: "Português",
} as const;

const browserLanguage =
    typeof navigator !== "undefined" ? navigator.language.toLowerCase() : "en";
const initialLanguage = browserLanguage.startsWith("pt") ? "pt" : "en";

const resources = {
    en: {
        translation: {
            language: "Language",
            tools: "Tools",
            pdfOperations: "PDF operations",
            endpointWorkspace: "Endpoint workspace",
            workspaceReady: "Workspace ready",
            madeBy: "made by Jonathan Lopes",
            mergeUpload: {
                dropTitle: "Drop your PDFs here",
                dropHint: "PDF files only · up to 2 documents",
                browse: "Choose files",
                previewEmpty: "PDF pages will appear here",
                previewTitle: "Preview",
                previewLoading: "Loading pages...",
                previewError: "Unable to preview this PDF",
                documents: "Documents",
                empty: "Your selected documents will appear here",
                swap: "Swap order",
                remove: "Remove {{name}}",
                invalidFile: "Only PDF files can be added.",
                limit: "You can upload up to 2 PDF documents.",
                mergePdf: "Merge PDFs",
                merging: "Merging...",
                mergeRequiresTwo: "Select 2 PDF documents before merging.",
                missingApiUrl: "The API URL is not configured.",
                mergeFailed: "The PDF could not be merged.",
            },
            splitUpload: {
                dropTitle: "Drop your PDF here",
                dropHint: "PDF file only",
                browse: "Choose file",
                previewEmpty: "Your PDF pages will appear here",
                previewTitle: "Page preview",
                previewLoading: "Loading PDF...",
                previewError: "Unable to preview this PDF",
                invalidFile: "Only one PDF file can be uploaded.",
                missingFile: "Select a PDF before splitting.",
                missingApiUrl: "The API URL is not configured.",
                splitPdf: "Split PDF",
                splitting: "Splitting...",
                splitFailed: "The PDF could not be split.",
                file: "File",
            },
            endpoints: {
                merge: {
                    name: "Merge PDFs",
                    description: "Combine two PDFs in the received order.",
                },
                split: {
                    name: "Split PDF",
                    description: "Group pages into multiple PDF files.",
                },
                extract: {
                    name: "Extract Pages",
                    description: "Create a PDF from selected pages.",
                },
                delete: {
                    name: "Delete Pages",
                    description: "Remove selected pages from a PDF.",
                },
                rotate: {
                    name: "Rotate Pages",
                    description: "Rotate specific pages by angle.",
                },
                reorder: {
                    name: "Reorder Pages",
                    description: "Change the order of every page.",
                },
                copy: {
                    name: "Copy Pages",
                    description: "Append selected pages to another PDF.",
                },
            },
        },
    },
    pt: {
        translation: {
            language: "Idioma",
            tools: "Ferramentas",
            pdfOperations: "Operações PDF",
            endpointWorkspace: "Área de trabalho da ferramenta",
            workspaceReady: "Área de trabalho pronta",
            madeBy: "feito por Jonathan Lopes",
            mergeUpload: {
                dropTitle: "Solte seus PDFs aqui",
                dropHint: "Apenas arquivos PDF · até 2 documentos",
                browse: "Escolher arquivos",
                previewEmpty: "As páginas PDF aparecerão aqui",
                previewTitle: "Pré-visualização",
                previewLoading: "Carregando páginas...",
                previewError: "Não foi possível visualizar este PDF",
                documents: "Documentos",
                empty: "Seus documentos selecionados aparecerão aqui",
                swap: "Trocar ordem",
                remove: "Remover {{name}}",
                invalidFile: "Apenas arquivos PDF podem ser adicionados.",
                limit: "Você pode enviar até 2 documentos PDF.",
                mergePdf: "Juntar PDFs",
                merging: "Juntando...",
                mergeRequiresTwo: "Selecione 2 documentos PDF antes de juntar.",
                missingApiUrl: "A URL da API não está configurada.",
                mergeFailed: "Não foi possível juntar os PDFs.",
            },
            splitUpload: {
                dropTitle: "Solte seu PDF aqui",
                dropHint: "Apenas um arquivo PDF",
                browse: "Escolher arquivo",
                previewEmpty: "As páginas do PDF aparecerão aqui",
                previewTitle: "Pré-visualização",
                previewLoading: "Carregando PDF...",
                previewError: "Não foi possível visualizar este PDF",
                invalidFile: "Apenas um arquivo PDF pode ser enviado.",
                missingFile: "Selecione um PDF antes de dividir.",
                missingApiUrl: "A URL da API não está configurada.",
                splitPdf: "Dividir PDF",
                splitting: "Dividindo...",
                splitFailed: "Não foi possível dividir o PDF.",
                file: "Arquivo",
            },
            endpoints: {
                merge: {
                    name: "Jutar PDFs",
                    description: "Combina dois PDFs na ordem recebida.",
                },
                split: {
                    name: "Separar PDF",
                    description: "Agrupa páginas em vários arquivos PDF.",
                },
                extract: {
                    name: "Extrair páginas",
                    description: "Cria um PDF com as páginas selecionadas.",
                },
                delete: {
                    name: "Excluir páginas",
                    description: "Remove páginas selecionadas de um PDF.",
                },
                rotate: {
                    name: "Girar páginas",
                    description: "Gira páginas específicas por ângulo.",
                },
                reorder: {
                    name: "Reordenar páginas",
                    description: "Altera a ordem de todas as páginas.",
                },
                copy: {
                    name: "Copiar páginas",
                    description: "Anexa páginas selecionadas a outro PDF.",
                },
            },
        },
    },
};

void i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: initialLanguage,
        fallbackLng: "en",
        interpolation: { escapeValue: false },
    });

export default i18n;
