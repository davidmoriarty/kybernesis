// client/src/routes/me.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/app";
import { PageState, LoadingState, ErrorState } from "@/components/shared";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMe, useUpdateProfile } from "@/hooks/auth";
import { requireAuth } from "@/utils/requireAuth";

type EditableProfileKey =
  | "name"
  | "email"
  | "nickname"
  | "location"
  | "timezone";

type ProfileItem =
  | {
      key: EditableProfileKey;
      label: string;
      editable: true;
    }
  | {
      key: "workspace" | "role";
      label: string;
      editable: false;
    };

const PROFILE_ITEMS: ProfileItem[] = [
  { key: "name", label: "Name", editable: true },
  { key: "nickname", label: "Nickname", editable: true },
  { key: "email", label: "Email", editable: true },
  { key: "workspace", label: "Workspace", editable: false },
  { key: "role", label: "Role", editable: false },
  { key: "location", label: "Location", editable: true },
  { key: "timezone", label: "Timezone", editable: true },
] as const;

export const Route = createFileRoute("/me")({
  beforeLoad: requireAuth,
  component: MePage,
});

export default function MePage() {
  const { data: me, isLoading, isError } = useMe();
  const updateProfile = useUpdateProfile();
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

  if (isLoading) {
    return (
      <PageState>
        <LoadingState message="Loading profile..." />
      </PageState>
    );
  }

  if (isError) {
    return (
      <PageState>
        <ErrorState message="Failed to load profile." />
      </PageState>
    );
  }

  return (
    <Section className="pt-6 lg:pt-8">
      <Container>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Your Profile</CardTitle>
            <CardDescription>
              View and manage your account information &amp; preferences.
            </CardDescription>
          </CardHeader>

          <CardContent className="w-full mx-auto lg:mt-4">
            <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-start lg:gap-12">
              <figure className="flex w-full flex-col items-start gap-3 lg:items-center">
                <Avatar className="size-32 lg:size-36">
                  <AvatarImage
                    src={form.avatar}
                    alt={form.name ? `${form.name}'s avatar` : "Profile avatar"}
                  />

                  <AvatarFallback>
                    {form.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>

                {editing && (
                  <Input
                    placeholder="Avatar URL"
                    value={form.avatar}
                    onChange={(e) => handleChange("avatar", e.target.value)}
                  />
                )}

                {me?.user?.createdAt && !editing && (
                  <figcaption className="py-2 text-center text-sm">
                    Member since{" "}
                    {new Intl.DateTimeFormat("en-CA", {
                      year: "numeric",
                      month: "long",
                    }).format(new Date(me.user.createdAt))}
                  </figcaption>
                )}
              </figure>

              <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
                {PROFILE_ITEMS.map((item) => {
                  const value = item.editable
                    ? form[item.key]
                    : item.key === "workspace"
                      ? me?.workspace?.name
                      : me?.workspace?.role;

                  return (
                    <div key={item.key} className="flex flex-col gap-1">
                      {editing && item.editable ? (
                        <>
                          <Label className="text-base font-bold">
                            {item.label}
                          </Label>
                          <Input
                            value={value ?? ""}
                            onChange={(e) =>
                              handleChange(item.key, e.target.value)
                            }
                          />
                        </>
                      ) : (
                        <p className="text-base">
                          <span className="font-bold">{item.label}</span>{" "}
                          {value || "-"}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>

          <CardFooter className="py-2">
            <div className="mx-auto w-full max-w-5xl">
              <ButtonGroup className="w-full lg:w-auto">
                {editing ? (
                  <>
                    <Button
                      variant="solid"
                      color="primary"
                      size="md"
                      onClick={handleSave}
                      disabled={updateProfile.isPending || isUnchanged()}
                    >
                      Save
                    </Button>

                    <Button
                      variant="outline"
                      color="secondary"
                      size="md"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="solid"
                    color="primary"
                    size="md"
                    className="w-full lg:w-auto"
                    onClick={() => setEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </ButtonGroup>
            </div>
          </CardFooter>
        </Card>
      </Container>
    </Section>
  );
}
