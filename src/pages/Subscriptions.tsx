import { Navigate } from "react-router-dom";

/** Legacy subscriptions page — redirects to unified /pricing */
export default function Subscriptions() {
  return <Navigate to="/pricing" replace />;
}
