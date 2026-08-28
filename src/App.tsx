import { useState } from "react";
import "./App.css";
import { EndpointContent } from "./components/EndpointContent";
import { EndpointSidebar } from "./components/EndpointSidebar";
import { endpoints } from "./components/endpoints";
import { LanguageSelector } from "./components/LanguageSelector";
import { useTranslation } from "react-i18next";

function App() {
    const { t } = useTranslation();
    const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0].id);
    const activeEndpoint =
        endpoints.find(({ id }) => id === selectedEndpoint) ?? endpoints[0];

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand" aria-label="PDF# home">
                    <span className="brand-mark">#</span>
                    <span className="brand-name">
                        PDF<span>#</span>
                    </span>
                </div>
                <LanguageSelector />
            </header>

            <div className="workspace">
                <EndpointSidebar
                    endpoints={endpoints}
                    selectedEndpoint={selectedEndpoint}
                    onSelect={setSelectedEndpoint}
                />
                <main className="main-content">
                    <EndpointContent endpoint={activeEndpoint} />
                </main>
            </div>

            <footer className="footer">
                <span>PDF#</span> {t("madeBy")}
            </footer>
        </div>
    );
}

export default App;
