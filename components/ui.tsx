"use client";
import React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"danger" }) {
  const { variant="primary", className="", ...rest } = props;
  return <button className={`btn btn-${variant} ${className}`} {...rest} />;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input className="input" {...props}/>; }
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea className="input min-h-28" {...props}/>; }
export function Label({children}:{children:React.ReactNode}) { return <label className="block text-sm font-semibold mb-1.5">{children}</label>; }
export function Card({children,className=""}:{children:React.ReactNode,className?:string}) { return <div className={`card p-5 ${className}`}>{children}</div>; }
export function Badge({children}:{children:React.ReactNode}) { return <span className="badge">{children}</span>; }
