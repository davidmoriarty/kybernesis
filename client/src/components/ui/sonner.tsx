import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useTheme } from "@/components/app/ThemeProvider";
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      richColors
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",

          "--success-bg": "var(--state-success-muted)",
          "--success-text": "var(--state-success)",
          "--success-border": "var(--state-success-border)",

          "--error-bg": "var(--state-danger-muted)",
          "--error-text": "var(--state-danger)",
          "--error-border": "var(--state-danger-border)",

          "--warning-bg": "var(--state-warning-muted)",
          "--warning-text": "var(--state-warning)",
          "--warning-border": "var(--state-warning-border)",

          "--info-bg": "var(--state-info-muted)",
          "--info-text": "var(--state-info)",
          "--info-border": "var(--state-info-border)",

          "--border-radius": "var(--radius)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
