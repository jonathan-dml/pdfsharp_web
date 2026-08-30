import type { Endpoint } from "./endpoints";
import { useTranslation } from "react-i18next";
import { MergeContent } from "./MergeContent";
import { SplitContent } from "./SplitContent";

export function EndpointContent({ endpoint }: { endpoint: Endpoint }) {
    const { t } = useTranslation();
    return (
        <section className="tool-content" aria-labelledby="tool-title">
            <h1 id="tool-title">
                {t(`endpoints.${endpoint.translationKey}.name`)}
            </h1>
            <p className="tool-description">
                {t(`endpoints.${endpoint.translationKey}.description`)}
            </p>
            {endpoint.id === "merge" && <MergeContent />}
            {endpoint.id === "split" && <SplitContent />}
        </section>
    );
}
