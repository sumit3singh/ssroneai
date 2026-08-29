/**
 * The ssrone – Root App Component
 */
import { RouterProvider } from "@tanstack/react-router";
import { Providers } from "@/app/providers";
import { router } from "@/app/routes";

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
