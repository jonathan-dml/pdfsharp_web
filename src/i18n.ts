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
