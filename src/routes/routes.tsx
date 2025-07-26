import React from "react";
import { RouteObject } from "react-router-dom";
import { HomePage } from "@/pages/HomePage/HomePage";
import { RegisterPage } from "@/pages/register/RegisterPage";
//import LoginPage from "../pages/login/LoginPage";


const routes: RouteObject[] = [
  { path: "/", element: <HomePage /> },
 // { path: "/register", element: <RegisterPage /> },
  { path: "/register", element: <RegisterPage /> },
];

export default routes;
