import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui";
export default async function Settings(){await requireAdmin();return <div><h1 className="text-3xl font-bold mb-6">Settings</h1><Card><h2 className="font-bold">ApplyWise AI</h2><p className="text-sm text-gray-500 mt-2">Server-side OpenAI and Supabase credentials are configured through environment variables. Private resume files are served through short-lived signed downloads.</p></Card></div>}
