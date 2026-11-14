import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "@tanstack/react-router";

import QueryProvider from "@/app/providers/QueryProvider";
import {router} from "@/app/router";
import './index.css'

async function enableMocking() {
  if(import.meta.env.VITE_ENABLE_MOCKS !== "true"){
    return;
  }

  const {worker} = await import("@/mocks/browser");

  await worker.start({
    onUnhandledFrame: "bypass",
  });
}

async function bootstrap() {
  await enableMocking();

  ReactDOM.createRoot(
  document.getElementById("root")!,
).render(
  <React.StrictMode>
    <QueryProvider>
      <RouterProvider router={router}/>
    </QueryProvider>
  </React.StrictMode>
)}


bootstrap().catch((error) => {
  console.log("Erro ao inicializar a Aplicação: ", error);
})


