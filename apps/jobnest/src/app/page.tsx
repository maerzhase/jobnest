import { AppHeader } from "../components/app-header";
import { ApplicationTracker } from "../components/application-tracker";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <AppHeader />
      <ApplicationTracker />
    </main>
  );
}
