import { useLocation } from "react-router-dom";
import Button from "../../../components/button/button";

function NotFound() {
  const location = useLocation();

  return (
    <main className="relative flex min-h-[calc(100vh-120px)] items-center justify-center overflow-hidden px-6 py-20 dark:bg-dark-bg dark:text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.16),_transparent_42%),linear-gradient(180deg,_rgba(246,246,246,0.65),_rgba(246,246,246,0.25))] dark:bg-[radial-gradient(circle_at_top,_rgba(69,180,75,0.18),_transparent_42%),linear-gradient(180deg,_rgba(28,28,32,0.95),_rgba(28,28,32,0.75))]" />
      <div className="absolute left-[-8rem] top-[-6rem] h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-6rem] h-72 w-72 rounded-full bg-black/5 blur-3xl dark:bg-white/10" />

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-gray-500/20 bg-white/70 px-5 py-2 text-sm font-medium shadow-sm backdrop-blur dark:bg-dark/60">
          <span className="h-2 w-2 rounded-full bg-primary" />
          404 error
        </div>

        <p className="text-[clamp(4rem,12vw,8rem)] font-semibold leading-none tracking-[-0.08em] text-primary">
          404
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          We couldn’t find that page.
        </h1>

        <p className="mt-4 max-w-xl text-base text-gray-500 dark:text-gray-300 sm:text-lg">
          The route <span className="font-medium text-black dark:text-white">{location.pathname}</span> does not exist or may have moved.
        </p>

        <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
          <Button href="/" className="w-full sm:w-auto">
            Go home
          </Button>
          <Button href="/auth/login" variant="secondary" className="w-full sm:w-auto">
            Sign in
          </Button>
        </div>

        <p className="mt-8 max-w-lg text-sm text-gray-500 dark:text-gray-400">
          If you were trying to open a task or account page, double-check the URL or head back to the dashboard after signing in.
        </p>
      </section>
    </main>
  );
}

export default NotFound;