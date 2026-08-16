"use client";
import { useState } from "react";
import { Button, Card, Label } from "@/components/ui";
import { useRouter } from "next/navigation";
export default function ApplicationActions({id,status,admin}:{id:string,status:string,admin:boolean}){
 const [s,setS]=useState(status);const router=useRouter(); if(!admin)return null;
 async function save(){await fetch(`/api/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:s})});router.refresh();}
 return <Card><Label>Status</Label><select className="input mb-3" value={s} onChange={e=>setS(e.target.value)}>{["Draft","Job Extracted","Resume Ready","Applied","Interview","Rejected","Offer","Withdrawn"].map(x=><option key={x}>{x}</option>)}</select><Button onClick={save} className="w-full">Save Status</Button></Card>;
}
