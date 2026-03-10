// client/src/components/shared/FormLayout.tsx
import type { FormEvent, ReactNode } from "react";

interface FormLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}

export function FormLayout({
  children,
  title,
  description,
  className = "",
  onSubmit,
}: FormLayoutProps) {
  return (
    <div className={`max-w-md mx-auto px-4 ${className}`}>
      {title && (
        <h1 className="text-4xl font-black mb-2 text-center">{title}</h1>
      )}
      {description && <p className="text-center text-md mb-6">{description}</p>}
      <form className="space-y-4" onSubmit={onSubmit}>
        {children}
      </form>
    </div>
  );
}
