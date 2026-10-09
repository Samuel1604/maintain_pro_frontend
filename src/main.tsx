import ReactDOM from "react-dom/client";
import { Providers } from "./app/provider/providers";
import "@/styles/tailwind.css";
import { startDeploymentRefresh } from "@/lib/deployment-refresh";

startDeploymentRefresh();

ReactDOM.createRoot(document.getElementById("root")!).render(<Providers />);
