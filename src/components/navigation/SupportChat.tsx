import { useState } from "react";
import { Bot, MessageCircle, Send, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = { id: number; role: "assistant" | "user"; text: string };

const portalSuggestions = [
  "How do I create a work order?",
  "Where can I see preventive maintenance?",
  "How do I assign a technician?",
];
const publicSuggestions = [
  "What is MaintainPro?",
  "Which teams can use it?",
  "How do I get started?",
];

function answerFor(message: string, publicMode: boolean) {
  const question = message.toLowerCase();
  if (publicMode) {
    if (question.includes("what") || question.includes("maintainpro"))
      return "MaintainPro is a facility maintenance operations platform for facilities, locations, assets, work orders, preventive maintenance, inventory, and vendors.";
    if (question.includes("team") || question.includes("use"))
      return "Administrators, facility managers, technicians, staff, finance teams, and vendors each get role-aware workflows.";
    if (question.includes("start") || question.includes("sign"))
      return "Choose Get Started to create an organization or vendor account. For enterprise onboarding, our contact team can help.";
    if (question.includes("price"))
      return "Review the available plans on the Pricing page, or ask for an enterprise conversation for organization-specific requirements.";
    return "I can answer questions about MaintainPro, supported teams, features, pricing, and getting started.";
  }
  if (question.includes("work order"))
    return "Open Work Orders from the sidebar, then select Create Work Order. You can link the facility, location, asset, priority, and technician before submitting.";
  if (question.includes("preventive") || question.includes("maintenance"))
    return "Preventive Maintenance is in the sidebar. Open a schedule to review its next due date, occurrences, approvals, and technician assignments.";
  if (question.includes("technician") || question.includes("assign"))
    return "Open the work order or PM occurrence, choose Assign Technician, select an eligible technician, and confirm the assignment.";
  if (question.includes("asset") || question.includes("inventory"))
    return "Assets and Inventory are separate records. Assets represent maintainable equipment; inventory represents parts and supplies held at a facility and location.";
  return "I can help you find a MaintainPro workflow. Try asking about work orders, preventive maintenance, technician assignment, assets, or inventory.";
}

export function SupportChat({
  open,
  onOpenChange,
  publicMode = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  publicMode?: boolean;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: publicMode
        ? "Hi! I’m the MaintainPro assistant. Ask me about the platform, teams, pricing, or getting started."
        : "Hi! I’m the MaintainPro assistant. What would you like help with?",
    },
  ]);

  const send = (value = input) => {
    const text = value.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", text },
      { id: Date.now() + 1, role: "assistant", text: answerFor(text, publicMode) },
    ]);
    setInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:bottom-6 sm:right-6 sm:top-auto sm:left-auto sm:h-[min(680px,calc(100dvh-3rem))] sm:w-[410px] sm:max-w-[calc(100vw-2rem)] sm:translate-x-0 sm:translate-y-0">
        <DialogHeader className="shrink-0 rounded-none px-5 py-4 pr-12 before:hidden">
          <DialogTitle className="flex items-center gap-3 text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-5 w-5" />
            </span>
            <span>
              <span className="block">MaintainPro Assistant</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Ready to help
              </span>
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Get quick guidance without leaving your workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-3 bg-muted/20 p-4">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border bg-card text-foreground shadow-sm"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(publicMode ? publicSuggestions : portalSuggestions).map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full bg-card text-xs"
                onClick={() => send(suggestion)}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" />
                {suggestion}
              </Button>
            ))}
          </div>
          <form
            className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 shadow-sm"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask anything about MaintainPro..."
              aria-label="Ask MaintainPro Assistant"
              className="border-0 shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-lg"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            For account or technical issues, contact your organization administrator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
