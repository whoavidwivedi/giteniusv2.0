import { features, site } from "@packages/config/site"
import { redirect } from "next/navigation"

import App from "@/components/dashboard/app"

// Fresh fork: the waitlist capture when the waitlist feature is on, otherwise a plain landing page. Replace this with your real home when ready.
export default function Home() {
  if (features.waitlist) redirect("/waitlist")

  return <App />
}
