// SettingsSection.tsx
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

interface SettingsSectionProps {
  notificationsEnabled?: boolean;
  isPublic?: boolean;
}

export default function SettingsSection({
  notificationsEnabled,
  isPublic,
}: SettingsSectionProps) {
  if (notificationsEnabled === undefined && isPublic === undefined) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <Card key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-10" />
          </Card>
        ))}
      </div>
    );
  }

  const settings = [
    { label: "Enable Notifications", value: notificationsEnabled },
    { label: "Public Project", value: isPublic },
  ];

  return (
    <div className="flex flex-col gap-4">
      {settings.map((item) => (
        <Card
          key={item.label}
          className="p-4 flex items-center justify-between"
        >
          <p className="font-medium">{item.label}</p>
          <Switch checked={item.value} />
        </Card>
      ))}
    </div>
  );
}
