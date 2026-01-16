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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [timezone, setTimezone] = useState("");
  const [location, setLocation] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (me?.user) {
      setName(me.user.name);
      setEmail(me.user.email);
      setNickname(me.user.nickname ?? "");
      setTimezone(me.user.timezone ?? "");
      setLocation(me.user.location ?? "");
      setAvatar(me.user.avatar ?? "");
    }
  }, [me?.user]);

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

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        name,
        email,
        nickname,
        timezone,
        location,
        avatar,
      });
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Section>
        <Container>
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Label>Name</Label>
                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                ) : (
                  <p className="text-lg font-medium">{me?.user?.name || "-"}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Email</Label>
                {editing ? (
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                ) : (
                  <p className="text-lg">{me?.user?.email || "-"}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Nickname</Label>
                {editing ? (
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                ) : (
                  <p className="text-lg">{me?.user?.nickname || "-"}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Timezone</Label>
                {editing ? (
                  <Input
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                ) : (
                  <p className="text-lg">{me?.user?.timezone || "-"}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Location</Label>
                {editing ? (
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                ) : (
                  <p className="text-lg">{me?.user?.location || "-"}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <Label>Avatar</Label>
                {editing ? (
                  <Input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                  />
                ) : (
                  <p className="text-lg">{me?.user?.avatar || "-"}</p>
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
                      disabled={
                        updateProfile.isPending ||
                        (name === me?.user?.name &&
                          email === me?.user?.email &&
                          nickname === me?.user?.nickname &&
                          timezone === me?.user?.timezone &&
                          location === me?.user?.location &&
                          avatar === me?.user?.avatar)
                      }
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setName(me?.user?.name ?? "");
                        setEmail(me?.user?.email ?? "");
                        setNickname(me?.user?.nickname ?? "");
                        setTimezone(me?.user?.timezone ?? "");
                        setLocation(me?.user?.location ?? "");
                        setAvatar(me?.user?.avatar ?? "");
                        setEditing(false);
                      }}
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
            </CardContent>
          </Card>
        </Container>
      </Section>

      <Section>
        <Container>
          {me?.workspace && (
            <Card>
              <CardHeader>
                <CardTitle>Workspace</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p>
                  <strong>Name:</strong> {me.workspace.name}
                </p>
                <p>
                  <strong>Role:</strong> {me?.workspace?.role || "-"}
                </p>
              </CardContent>
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
}
