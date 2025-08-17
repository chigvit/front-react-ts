import React from "react";
import { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/HomePage/HomePage";
import { RegisterPage } from "@/pages/register/RegisterPage";
import { ConfirmEmailPage } from "@/pages/ConfirmEmail/ui/ConfirmEmailPage";
import { DashboardProviderPage } from "@/pages/DashboardProvider/DashboardProviderPage";

//import LoginPage from "../pages/login/LoginPage";

// select pages for routing
const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/confirm-email", element: <ConfirmEmailPage /> },
  { path: "/dashboard_provider", element: <DashboardProviderPage/> },
];

export default routes;
