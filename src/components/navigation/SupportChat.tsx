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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            MaintainPro Assistant
          </DialogTitle>
          <DialogDescription>Get quick guidance without leaving your workspace.</DialogDescription>
        </DialogHeader>
        <div className="flex h-[28rem] flex-col gap-4">
          <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card text-foreground shadow-sm"}`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(publicMode ? publicSuggestions : portalSuggestions).map((suggestion) => (
              <Button key={suggestion} variant="outline" size="sm" onClick={() => send(suggestion)}>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                {suggestion}
              </Button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
          >
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about MaintainPro..."
              aria-label="Ask MaintainPro Assistant"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5" />
            For account or technical issues, contact your organization administrator.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
