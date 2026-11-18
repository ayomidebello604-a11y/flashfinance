import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The application root element was not found.");
}

const root = createRoot(rootElement);
const missingEnvironmentVariables = [
  ["VITE_SUPABASE_URL", import.meta.env.VITE_SUPABASE_URL],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingEnvironmentVariables.length > 0) {
  root.render(
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-xl rounded-lg border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Supabase configuration required</h1>
        <p className="mt-3 text-muted-foreground">
          The app cannot connect to Supabase until these environment variables are set:
        </p>
        <ul className="mt-3 list-inside list-disc font-mono text-sm">
          {missingEnvironmentVariables.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <p className="mt-4 text-muted-foreground">
          Add them to a <code>.env</code> file in the project root, then restart the dev server.
          See the README for setup details.
        </p>
      </section>
    </main>,
  );
} else {
  void import("./App.tsx")
    .then(({ default: App }) => root.render(<App />))
    .catch((error: unknown) => {
      console.error("Failed to load the application:", error);
      root.render(
        <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
          <p role="alert">The app failed to load. Check the browser console for details.</p>
        </main>,
      );
    });
}
