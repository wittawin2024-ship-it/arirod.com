import React from "react";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  hint?: string;
  loading?: boolean;
}

export default function StatCard({
  title,
  value,
  icon,
  hint,
  loading = false,
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-[var(--cloud-gray)] shadow-xs flex items-center justify-between transition-all hover:shadow-md hover:border-gray-300">
      <div className="flex-1">
        <p className="text-xs font-semibold text-[var(--pewter)] uppercase tracking-wider mb-1.5">
          {title}
        </p>
        {loading ? (
          <div className="h-8 w-20 bg-gray-100 animate-pulse rounded mt-1" />
        ) : (
          <h3 className="text-3xl font-bold text-[var(--carbon-dark)] font-sans tracking-tight">
            {value}
          </h3>
        )}
        {hint && <p className="text-xs text-[var(--silver-fog)] mt-2">{hint}</p>}
      </div>
      <div className="text-[var(--electric-blue)] bg-blue-50 p-3.5 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}
