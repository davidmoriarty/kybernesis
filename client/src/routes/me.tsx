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

export default function MePage() {
  const { data: me, isLoading, isError } = useMe();
  const updateProfile = useUpdateProfile();
  const logout = useLogout();

  const [editing, setEditing] = useState(false);
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

  const handleAvatarError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = "https://via.placeholder.com/96";
  };

  const handleAvatarErrorSmall = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = "https://via.placeholder.com/48";
  };

  const isUnchanged = () =>
    me?.user &&
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
              <span className="animate-spin inline-block mr-2">⏳</span> Loading
              profile...
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
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {(
                ["name", "email", "nickname", "timezone", "location"] as const
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
                    <p className="text-lg">{form[field] || "-"}</p>
                  )}
                </div>
              ))}

              {/* Avatar input with live preview */}
              <div className="flex flex-col gap-1">
                <Label>Avatar</Label>
                {editing ? (
                  <>
                    <Input
                      value={form.avatar}
                      onChange={(e) => handleChange("avatar", e.target.value)}
                    />
                    <div className="mt-2 w-24 h-24 border rounded overflow-hidden">
                      {form.avatar ? (
                        <img
                          src={form.avatar}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => handleAvatarError(e)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          Preview
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover"
                        onError={handleAvatarErrorSmall}
                      />
                    ) : (
                      <span className="text-lg">-</span>
                    )}
                    <p className="text-lg">{form.avatar ? form.avatar : ""}</p>
                  </div>
                )}
              </div>

              {me?.user?.createdAt && !editing && (
                <p className="text-sm text-muted">
                  Member since:{" "}
                  {new Intl.DateTimeFormat("en-CA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }).format(new Date(me.user.createdAt * 1000))}
                </p>
              )}

              <div className="flex gap-2 mt-2">
                {editing ? (
                  <>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updateProfile.isPending || isUnchanged()}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>
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
            </CardContent>
          </Card>
        </Container>
      </Section>

      {me?.workspace && (
        <Section>
          <Container>
            <Card>
              <CardHeader>
                <CardTitle>Workspace</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
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
