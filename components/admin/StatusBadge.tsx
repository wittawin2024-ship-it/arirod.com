import React from "react";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normStatus = status.toLowerCase();

  let bgClass = "bg-gray-100 text-gray-700 border-gray-200";
  let dotClass = "bg-gray-400";
  let label = status;

  if (normStatus === "published" || normStatus === "active") {
    bgClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    dotClass = "bg-emerald-500";
    label = normStatus === "published" ? "เผยแพร่แล้ว" : "ใช้งานอยู่";
  } else if (normStatus === "draft" || normStatus === "inactive") {
    bgClass = "bg-amber-50 text-amber-700 border-amber-200";
    dotClass = "bg-amber-500";
    label = normStatus === "draft" ? "แบบร่าง" : "ปิดใช้งาน";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${bgClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}
