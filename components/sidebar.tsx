"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, UserRound, BriefcaseBusiness, FileText, Settings, LogOut, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { useState } from "react";

export default function Sidebar({ role }: { role: "ADMIN"|"USER" }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open,setOpen]=useState(false);
  const items = role==="ADMIN" ? [
    ["/dashboard","Dashboard",LayoutDashboard],["/admin/users","Users",Users],["/admin/profiles","Client Profiles",UserRound],["/admin/applications","Applications",BriefcaseBusiness],["/admin/resumes","Generated Resumes",FileText],["/admin/settings","Settings",Settings]
  ] : [
    ["/dashboard","Dashboard",LayoutDashboard],["/applications","Applications",BriefcaseBusiness],["/profiles","My Profiles",UserRound]
  ];
  async function logout(){ await createClient().auth.signOut(); router.push("/login"); router.refresh(); }
  return <>
    <button className="md:hidden fixed top-4 left-4 z-50 btn btn-secondary" onClick={()=>setOpen(!open)}><Menu size={18}/></button>
    <aside className={`${open?"translate-x-0":"-translate-x-full"} md:translate-x-0 fixed z-40 left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-5 transition-transform`}>
      <div className="font-bold text-xl mb-8">ApplyWise <span className="text-gray-500">AI</span></div>
      <nav className="space-y-1">
        {items.map(([href,label,Icon]:any)=><Link key={href} href={href} onClick={()=>setOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${pathname===href?"bg-gray-900 text-white":"hover:bg-gray-100"}`}><Icon size={17}/>{label}</Link>)}
      </nav>
      <button onClick={logout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg hover:bg-gray-100"><LogOut size={17}/>Sign out</button>
    </aside>
  </>;
}
