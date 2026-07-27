import { features } from "@packages/config/site"
import { redirect } from "next/navigation"

import App from "@/components/dashboard/app"

// The waitlist capture when the waitlist feature is on, otherwise the profile analyzer dashboard.
export default function Home() {
  if (features.waitlist) redirect("/waitlist")

  return <App />
}
