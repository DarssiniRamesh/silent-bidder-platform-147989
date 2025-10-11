"use client";

import React from "react";
import Shell from "@/components/layout/Shell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Tabs from "@/components/ui/Tabs";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Loader from "@/components/ui/Loader";
import { useToast } from "@/components/ui/Toast";

export default function Home() {
  const { show } = useToast();
  const [open, setOpen] = React.useState(false);

  return (
    <Shell
      topbar={{ start: <div className="font-semibold">Silent Auction</div>, end: <Badge variant="primary">Ocean</Badge> }}
      sidebar={{ items: [{ href: "/", label: "Home" }, { href: "/auctions", label: "Auctions" }, { href: "/admin", label: "Admin" }] }}
    >
      <div className="grid gap-4">
        <Card header={<div className="text-lg font-semibold">Get Started</div>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Your name" placeholder="Jane Doe" />
            <Input label="Bid amount" placeholder="$100" />
          </div>
          <div className="mt-3 flex gap-2 items-center">
            <Button onClick={() => show("success", "Saved!")}>Primary</Button>
            <Button variant="secondary" onClick={() => show("info", "Secondary clicked")}>Secondary</Button>
            <Button variant="outline" onClick={() => setOpen(true)}>Open Modal</Button>
            <Button variant="danger" onClick={() => show("error", "Something went wrong")}>Danger</Button>
            <Loader className="ml-2" />
          </div>
        </Card>

        <Card header={<div className="text-lg font-semibold">Tabs</div>}>
          <Tabs
            tabs={[
              { id: "t1", label: "Overview", content: <p>Overview content.</p> },
              { id: "t2", label: "Details", content: <p>Details content.</p> },
              { id: "t3", label: "History", content: <p>Bid history content.</p> },
            ]}
          />
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Example Modal" description="This is a modal with focus trap.">
        <p className="mb-3">Keyboard navigation and Escape to close are supported.</p>
        <div className="flex gap-2">
          <Button onClick={() => setOpen(false)}>Close</Button>
          <Button variant="outline">Secondary Action</Button>
        </div>
      </Modal>
    </Shell>
  );
}
