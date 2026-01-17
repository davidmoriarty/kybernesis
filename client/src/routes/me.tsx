// client/src/routes/me.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogout, useMe, useUpdateProfile } from "@/hooks/auth";
import { requireAuth } from "@/utils/requireAuth";

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
      await updateProfile.mutateAsync(form);
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
      <Section>
        <Container>
          <Card>
            <CardContent className="text-center text-lg">
              <span className="animate-spin inline-block mr-2">⏳</span>
              Loading profile...
            </CardContent>
          </Card>
        </Container>
      </Section>
    );

  // Error state
  if (isError)
    return (
      <Section>
        <Container>
          <Card>
            <CardContent className="text-center text-lg text-destructive">
              Failed to load profile.
            </CardContent>
          </Card>
        </Container>
      </Section>
    );

  return (
    <>
      <Section>
        <Container>
          <Card>
            <CardHeader>
              <CardTitle className="font-black text-2xl text-center">
                Your Profile
              </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-6 md:grid-cols-[220px_1fr]">
              {/* Left column: avatar */}
              <div className="flex flex-col items-center gap-3">
                {form.avatar && !avatarError ? (
                  <img
                    src={form.avatar}
                    alt="Avatar"
                    className="h-24 w-24 rounded-full object-cover"
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
                  <p className="text-xs text-muted-foreground text-center">
                    Member since{" "}
                    {new Intl.DateTimeFormat("en-CA", {
                      year: "numeric",
                      month: "long",
                    }).format(new Date(me.user.createdAt * 1000))}
                  </p>
                )}
              </div>

              {/* Right column: fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  ["name", "email", "nickname", "location", "timezone"] as const
                ).map((field) => (
                  <div key={field} className="flex flex-col gap-1">
                    <Label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </Label>
                    {editing ? (
                      <Input
                        value={form[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                      />
                    ) : (
                      <p className="text-sm">{form[field] || "-"}</p>
                    )}
                  </div>
                ))}

                <div className="col-span-full flex gap-2 pt-4">
                  {editing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updateProfile.isPending || isUnchanged()}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" onClick={() => setEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => logout.mutate()}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Container>
      </Section>

      {me?.workspace && (
        <Section>
          <Container>
            <Card>
              <CardHeader>
                <CardTitle className="font-black text-2xl text-center">
                  Workspace
                </CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-2 text-center">
                <p>
                  <strong>Name:</strong> {me.workspace.name}
                </p>
                <p>
                  <strong>Role:</strong> {me.workspace.role}
                </p>
              </CardContent>
            </Card>
          </Container>
        </Section>
      )}
    </>
  );
}
