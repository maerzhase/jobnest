import { Suspense } from "react";
import { ApplicationTracker } from "../components/application-tracker";

export default function Home() {
  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden">
      <Suspense fallback={null}>
        <ApplicationTracker />
      </Suspense>
    </main>
  );
}
