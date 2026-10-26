"use client";

import { Suspense } from "react";
import { DashboardContainer } from "@/features/dashboard/containers/dashboard";

export default function DashboardPage() {
  // useSearchParams (the ?tab= switch) needs a Suspense boundary.
  return (
    <Suspense>
      <DashboardContainer />
    </Suspense>
  );
}
