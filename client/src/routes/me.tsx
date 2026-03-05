// client/src/routes/me.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/Section";
import { Container } from "@/components/Container";
import { PageCard } from "@/components/PageCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogout, useMe, useUpdateProfile } from "@/hooks/auth";
import { requireAuth } from "@/utils/requireAuth";

const PROFILE_FIELDS = [
  "name",
  "email",
  "nickname",
  "location",
  "timezone",
] as const;

export const Route = createFileRoute("/me")({
  beforeLoad: requireAuth,
  component: MePage,
});

function AvatarFallback({ size = 96 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-muted text-muted-foreground"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 21c0-4-4-7-8-7s-8 3-8 7" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

function formatLabel(field: string) {
  // Capitalize first letter and replace underscores with spaces
  return field.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

export default function MePage() {
  const { data: me, isLoading, isError } = useMe();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const [editing, setEditing] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    nickname: "",
    timezone: "",
    location: "",
    avatar: "",
  });

  useEffect(() => {
    if (me?.user) {
      setForm({
        name: me.user.name,
        email: me.user.email,
        nickname: me.user.nickname ?? "",
        timezone: me.user.timezone ?? "",
        location: me.user.location ?? "",
        avatar: me.user.avatar ?? "",
      });
    }
  }, [me?.user]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name: form.name,
        email: form.email,
        nickname: form.nickname || undefined,
        timezone: form.timezone || undefined,
        location: form.location || undefined,
        avatar: form.avatar || undefined,
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (me?.user) {
      setForm({
        name: me.user.name,
        email: me.user.email,
        nickname: me.user.nickname ?? "",
        timezone: me.user.timezone ?? "",
        location: me.user.location ?? "",
        avatar: me.user.avatar ?? "",
      });
    }
    setEditing(false);
  };

  const isUnchanged = () =>
    !!me?.user &&
    form.name === me.user.name &&
    form.email === me.user.email &&
    form.nickname === (me.user.nickname ?? "") &&
    form.timezone === (me.user.timezone ?? "") &&
    form.location === (me.user.location ?? "") &&
    form.avatar === (me.user.avatar ?? "");

  // Loading state
  if (isLoading)
    return (
      <PageCard>
        <p className="text-center text-lg">
          <span className="animate-spin inline-block mr-2">⏳</span>
          Loading profile...
        </p>
      </PageCard>
    );

  // Error state
  if (isError)
    return (
      <PageCard>
        <p className="text-center text-lg text-destructive">
          Failed to load profile.
        </p>
      </PageCard>
    );

  return (
    <>
      <Section padding="py-32">
        <Container>
          <header className="mb-8">
            <h2 className="font-black text-4xl text-center">Your Profile</h2>
          </header>

          <div className="max-w-7xl mx-auto p-4 border rounded-lg grid gap-3 md:grid-cols-[220px_1fr]">
            {/* Left column: avatar */}
            <figure className="flex flex-col items-center justify-center gap-3">
              {form.avatar && !avatarError ? (
                <img
                  src={form.avatar}
                  alt="Avatar"
                  className="h-24 w-24 mx-auto rounded-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <AvatarFallback size={96} />
              )}

              {editing && (
                <Input
                  placeholder="Avatar URL"
                  value={form.avatar}
                  onChange={(e) => handleChange("avatar", e.target.value)}
                />
              )}

              {me?.user?.createdAt && !editing && (
                <figcaption className="py-2 text-sm text-center">
                  Member since{" "}
                  {new Intl.DateTimeFormat("en-CA", {
                    year: "numeric",
                    month: "long",
                  }).format(new Date(me.user.createdAt))}
                </figcaption>
              )}
            </figure>

            {/* Right column: fields + buttons */}
            <div className="grid gap-6 ml-0 md:grid-cols-2 md:ml-20">
              {PROFILE_FIELDS.map((field) => (
                <div key={field} className="flex flex-col gap-1">
                  <Label className="font-bold text-base">
                    {formatLabel(field)}
                  </Label>
                  {editing ? (
                    <Input
                      value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                    />
                  ) : (
                    <p className="text-base">{form[field] || "-"}</p>
                  )}
                </div>
              ))}

              <div className="col-span-full flex flex-wrap gap-4 pt-4">
                {editing ? (
                  <>
                    <Button
                      variant="default"
                      size="default"
                      onClick={handleSave}
                      disabled={updateProfile.isPending || isUnchanged()}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="default"
                    size="default"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="default"
                  onClick={() => logout.mutate()}
                >
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {me?.workspace && (
        <Section>
          <Container>
            <div className="flex flex-col gap-3 text-center">
              <header>
                <h2 className="font-black text-2xl text-center">Workspace</h2>
              </header>

              <p>
                <strong>Name:</strong> {me.workspace.name}
              </p>
              <p>
                <strong>Role:</strong> {me.workspace.role}
              </p>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
