// client/src/components/projects/detail/settings/ProjectSettingRow.tsx

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type StateTone = "info" | "success" | "warning" | "danger";

interface ProjectSettingRowProps {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftTone: StateTone;
  rightTone: StateTone;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const textToneClasses: Record<StateTone, string> = {
  info: "text-state-info",
  success: "text-state-success",
  warning: "text-state-warning",
  danger: "text-state-danger",
};

const switchToneClasses: Record<StateTone, string> = {
  info: "bg-state-info",
  success: "bg-state-success",
  warning: "bg-state-warning",
  danger: "bg-state-danger",
};

export function ProjectSettingRow({
  label,
  leftLabel,
  rightLabel,
  leftTone,
  rightTone,
  checked,
  disabled = false,
  onCheckedChange,
}: ProjectSettingRowProps) {
  const activeLabel = checked ? rightLabel : leftLabel;
  const activeTone = checked ? rightTone : leftTone;

  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="font-medium text-foreground">{label}</span>

      <div className="flex shrink-0 items-center justify-end gap-3">
        <span
          className={cn(
            "min-w-24 text-end text-sm font-medium",
            textToneClasses[activeTone],
          )}
        >
          {activeLabel}
        </span>

        <Switch
          checked={checked}
          disabled={disabled}
          uncheckedTone={leftTone}
          checkedTone={rightTone}
          onCheckedChange={onCheckedChange}
          aria-label={`${label}: ${activeLabel}`}
          className={switchToneClasses[activeTone]}
        />
      </div>
    </div>
  );
}
