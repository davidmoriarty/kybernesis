// client/src/lib/semantic-colors.ts

export type SemanticColor =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "danger";

export const semanticColorVars = {
  primary:
    "[--ui-surface:var(--primary)] [--ui-color:var(--primary)] [--ui-foreground:var(--primary-foreground)] [--ui-muted:color-mix(in_oklch,var(--primary)_10%,transparent)] [--ui-border:var(--primary)]",

  secondary:
    "[--ui-surface:var(--secondary)] [--ui-color:var(--secondary-foreground)] [--ui-foreground:var(--secondary-foreground)] [--ui-muted:var(--secondary)] [--ui-border:var(--border)]",

  info: "[--ui-surface:var(--state-info)] [--ui-color:var(--state-info)] [--ui-foreground:var(--state-info-foreground)] [--ui-muted:var(--state-info-muted)] [--ui-border:var(--state-info-border)]",

  success:
    "[--ui-surface:var(--state-success)] [--ui-color:var(--state-success)] [--ui-foreground:var(--state-success-foreground)] [--ui-muted:var(--state-success-muted)] [--ui-border:var(--state-success-border)]",

  warning:
    "[--ui-surface:var(--state-warning)] [--ui-color:var(--state-warning)] [--ui-foreground:var(--state-warning-foreground)] [--ui-muted:var(--state-warning-muted)] [--ui-border:var(--state-warning-border)]",

  danger:
    "[--ui-surface:var(--state-danger)] [--ui-color:var(--state-danger)] [--ui-foreground:var(--state-danger-foreground)] [--ui-muted:var(--state-danger-muted)] [--ui-border:var(--state-danger-border)]",
} satisfies Record<SemanticColor, string>;
