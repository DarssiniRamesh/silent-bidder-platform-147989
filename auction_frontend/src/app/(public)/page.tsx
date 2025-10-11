"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

// Zod validators for form fields
const createEventSchema = z.object({
  eventName: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(64, "Event name must be 64 characters or fewer")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Use letters, numbers, spaces, dashes or underscores"),
  hostEmail: z.string().email("Enter a valid email address"),
});

const joinEventSchema = z.object({
  eventName: z
    .string()
    .min(3, "Event name must be at least 3 characters")
    .max(64, "Event name must be 64 characters or fewer"),
});

type CreateEventForm = z.infer<typeof createEventSchema>;
type JoinEventForm = z.infer<typeof joinEventSchema>;

/**
 * PUBLIC_INTERFACE
 * Landing page presenting public entry points: Create Event and Join Event.
 * - Create Event: validates inputs and simulates creating an event with Supabase public client; shows host link and toast.
 * - Join Event: validates event name and navigates to /event/[name].
 */
export default function PublicLandingPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);
  const { toast } = useToast();

  // Form state
  const [createData, setCreateData] = useState<CreateEventForm>({ eventName: "", hostEmail: "" });
  const [joinData, setJoinData] = useState<JoinEventForm>({ eventName: "" });

  const [createErrors, setCreateErrors] = useState<Partial<Record<keyof CreateEventForm, string>>>(
    {}
  );
  const [joinErrors, setJoinErrors] = useState<Partial<Record<keyof JoinEventForm, string>>>({});

  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingJoin, setSubmittingJoin] = useState(false);

  // Accessibility: refs for focus management
  const createEventNameRef = useRef<HTMLInputElement>(null);
  const createEmailRef = useRef<HTMLInputElement>(null);
  const joinEventNameRef = useRef<HTMLInputElement>(null);
  const createSubmitRef = useRef<HTMLButtonElement>(null);
  const joinSubmitRef = useRef<HTMLButtonElement>(null);

  // Result state for host link
  const [hostLink, setHostLink] = useState<string | null>(null);

  // Handlers
  const onCreateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCreateData((prev) => ({ ...prev, [name]: value }));
    setCreateErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onJoinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJoinData((prev) => ({ ...prev, [name]: value }));
    setJoinErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const focusFirstCreateError = useCallback((errors: Partial<Record<keyof CreateEventForm, string>>) => {
    if (errors.eventName) {
      createEventNameRef.current?.focus();
      return;
    }
    if (errors.hostEmail) {
      createEmailRef.current?.focus();
    }
  }, []);

  const focusFirstJoinError = useCallback((errors: Partial<Record<keyof JoinEventForm, string>>) => {
    if (errors.eventName) {
      joinEventNameRef.current?.focus();
    }
  }, []);

  // Mock token generation (temporary) and event creation placeholder
  const createEvent = useCallback(
    async (payload: CreateEventForm) => {
      // Placeholder: In future steps, this will call an API/RPC route.
      // For now, attempt to insert a minimal event row if a table exists; otherwise no-op.

      // Generate a local mock host token
      const mockToken = Math.random().toString(36).slice(2, 10);
      const slug = payload.eventName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
      const origin =
        typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const link = `${origin}/host/${slug}?token=${mockToken}`;

      try {
        // Try a best-effort insert (will fail silently if table doesn't exist)
        // Do not throw on error; this is a placeholder path.
        const { error } = await supabase
          .from("events" as never)
          // @ts-expect-error: Database typing may not have events defined yet; this is a placeholder.
          .insert({
            name: payload.eventName,
            host_email: payload.hostEmail,
            slug,
            // Any additional columns should be handled in a future migration
          })
          .single();

        if (error) {
          // Silently proceed; placeholder mode
          // console.warn("Insert failed (expected if table absent):", error.message);
        }

        setHostLink(link);
        toast({
          title: "Event created",
          description: "Your host link has been generated. Save it to manage your event.",
          variant: "success",
        });
        // After success, move focus to the host link button for accessibility
        setTimeout(() => {
          createSubmitRef.current?.focus();
        }, 50);
      } catch {
        toast({
          title: "Could not create event",
          description: "Please try again later.",
          variant: "error",
        });
      }
    },
    [supabase, toast]
  );

  const onSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCreate(true);
    try {
      const parsed = createEventSchema.safeParse(createData);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof CreateEventForm, string>> = {};
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof CreateEventForm;
          fieldErrors[path] = issue.message;
        });
        setCreateErrors(fieldErrors);
        focusFirstCreateError(fieldErrors);
        return;
      }
      await createEvent(parsed.data);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const onSubmitJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingJoin(true);
    try {
      const parsed = joinEventSchema.safeParse(joinData);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof JoinEventForm, string>> = {};
        parsed.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof JoinEventForm;
          fieldErrors[path] = issue.message;
        });
        setJoinErrors(fieldErrors);
        focusFirstJoinError(fieldErrors);
        return;
      }
      const slug = parsed.data.eventName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
      router.push(`/event/${slug}`);
      // for keyboard users announce success via toast
      toast({
        title: "Joining event",
        description: `Navigating to ${slug}...`,
        variant: "success",
      });
      setTimeout(() => {
        joinSubmitRef.current?.blur();
      }, 50);
    } finally {
      setSubmittingJoin(false);
    }
  };

  // Keyboard accessibility: submit with Enter handled by form; ensure refs are ready
  useEffect(() => {
    // No-op; reserved for any dynamic focus setup if needed later
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome to Silent Bidder</h1>
          <p className="text-sm text-gray-600">
            Create a new auction or join an existing one. Anonymous, real-time bidding.
          </p>
        </div>
        <Badge color="primary" aria-label="Ocean Professional theme">
          Ocean Professional
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Event Card */}
        <Card
          header={
            <div>
              <h2 id="create-event-title" className="text-lg font-semibold text-gray-900">
                Create Event
              </h2>
              <p className="text-sm text-gray-600">Set up a new silent auction as a host.</p>
            </div>
          }
        >
          <form onSubmit={onSubmitCreate} noValidate aria-labelledby="create-event-title">
            <div className="space-y-4">
                <div>
                  <label
                    htmlFor="create-event-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Event name
                  </label>
                  <Input
                    id="create-event-name"
                    name="eventName"
                    type="text"
                    placeholder="e.g., Fall Charity Auction"
                    value={createData.eventName}
                    onChange={onCreateInput}
                    ref={createEventNameRef}
                    aria-invalid={Boolean(createErrors.eventName) || undefined}
                    aria-describedby={
                      createErrors.eventName ? "create-event-name-error" : undefined
                    }
                  />
                  {createErrors.eventName ? (
                    <p id="create-event-name-error" className="mt-1 text-sm text-red-600">
                      {createErrors.eventName}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="create-host-email"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Host email
                  </label>
                  <Input
                    id="create-host-email"
                    name="hostEmail"
                    type="email"
                    placeholder="you@example.com"
                    value={createData.hostEmail}
                    onChange={onCreateInput}
                    ref={createEmailRef}
                    aria-invalid={Boolean(createErrors.hostEmail) || undefined}
                    aria-describedby={
                      createErrors.hostEmail ? "create-host-email-error" : undefined
                    }
                  />
                  {createErrors.hostEmail ? (
                    <p id="create-host-email-error" className="mt-1 text-sm text-red-600">
                      {createErrors.hostEmail}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    ref={createSubmitRef}
                    disabled={submittingCreate}
                    aria-busy={submittingCreate || undefined}
                  >
                    {submittingCreate ? "Creating..." : "Create event"}
                  </Button>

                  {hostLink ? (
                    <a
                      href={hostLink}
                      className="text-sm text-blue-600 underline underline-offset-2 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      Open host link
                    </a>
                  ) : null}
                </div>

                {hostLink ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Host link generated (temporary):{" "}
                    <span className="break-all">{hostLink}</span>
                  </div>
                ) : null}
              </div>
            </form>
        </Card>

        {/* Join Event Card */}
        <Card
          header={
            <div>
              <h2 id="join-event-title" className="text-lg font-semibold text-gray-900">
                Join Event
              </h2>
              <p className="text-sm text-gray-600">Enter the event name shared by the host.</p>
            </div>
          }
        >
          <form onSubmit={onSubmitJoin} noValidate aria-labelledby="join-event-title">
            <div className="space-y-4">
                <div>
                  <label
                    htmlFor="join-event-name"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Event name
                  </label>
                  <Input
                    id="join-event-name"
                    name="eventName"
                    type="text"
                    placeholder="e.g., Fall Charity Auction"
                    value={joinData.eventName}
                    onChange={onJoinInput}
                    ref={joinEventNameRef}
                    aria-invalid={Boolean(joinErrors.eventName) || undefined}
                    aria-describedby={
                      joinErrors.eventName ? "join-event-name-error" : undefined
                    }
                  />
                  {joinErrors.eventName ? (
                    <p id="join-event-name-error" className="mt-1 text-sm text-red-600">
                      {joinErrors.eventName}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="submit"
                    ref={joinSubmitRef}
                    disabled={submittingJoin}
                    aria-busy={submittingJoin || undefined}
                    variant="secondary"
                  >
                    {submittingJoin ? "Joining..." : "Join event"}
                  </Button>
                </div>
              </div>
            </form>
        </Card>
      </div>
    </main>
  );
}
