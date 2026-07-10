import { redirect } from "next/navigation";

/**
 * Root page - redirects to login
 * This is the entry point for unauthenticated users
 */
export default function Home() {
  // Redirect to login page
  redirect("/login");
}
