import { useUser } from "@repo/store/hooks";
import { Outlet, Navigate } from "react-router-dom";

function PrivateRoute() {
  const token = useUser();
  return token ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
