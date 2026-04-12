import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export const EmptyState = ({ icon: Icon, title, description, actionLabel, actionHref }: EmptyStateProps) => (
  <div className="text-center py-12 animate-[fadeUp_0.3s_ease]">
    <div className="w-16 h-16 rounded-2xl bg-border-l mx-auto mb-4 flex items-center justify-center">
      <Icon size={28} className="text-muted" />
    </div>
    <p className="text-sm font-semibold text-sub mb-1">{title}</p>
    {description && <p className="text-xs text-muted mb-4">{description}</p>}
    {actionLabel && actionHref && (
      <Link
        href={actionHref}
        className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-sm no-underline"
      >
        {actionLabel}
      </Link>
    )}
  </div>
);
