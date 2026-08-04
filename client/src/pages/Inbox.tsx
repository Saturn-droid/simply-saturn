import DashboardLayout from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, ChevronRight, CircleAlert, Clock3, LockKeyhole, MessageSquareText, Send, Settings2, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const supportAcknowledgement = "Hi, this is Support. We received your message and will assist shortly. Reply with details. Test message from Twilio.";
const e164Pattern = /^\+[1-9]\d{7,14}$/;

function deliveryLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function Inbox() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [recipient, setRecipient] = useState("");
  const [contactName, setContactName] = useState("");
  const [body, setBody] = useState("");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const configurationQuery = trpc.sms.configuration.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const conversationsQuery = trpc.sms.list.useQuery(undefined, {
    enabled: isAuthenticated,
    retry: false,
  });
  const threadQuery = trpc.sms.thread.useQuery(
    { conversationId: selectedConversationId ?? 1 },
    { enabled: isAuthenticated && selectedConversationId !== null, retry: false },
  );
  const sendMutation = trpc.sms.send.useMutation({
    onSuccess: async (result) => {
      toast.success(result.idempotent ? "This message was already submitted." : "Text submitted to the delivery provider.");
      setSelectedConversationId(result.message.conversationId);
      setBody("");
      setRecipient("");
      setContactName("");
      await Promise.all([utils.sms.list.invalidate(), utils.sms.thread.invalidate()]);
    },
    onError: (error) => toast.error(error.message),
  });

  const configuration = configurationQuery.data;
  const conversations = conversationsQuery.data ?? [];
  const canSend = Boolean(isAuthenticated && configuration?.configured && recipient.trim() && body.trim() && !sendMutation.isPending);

  const submitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      toast.error("Sign in to send a text from your workspace.");
      setLocation("/login");
      return;
    }
    if (!configuration?.configured) {
      toast.error("Secure SMS configuration is required before a message can be sent.");
      return;
    }
    if (!e164Pattern.test(recipient.trim())) {
      toast.error("Use an E.164 recipient number, for example +15551234567.");
      return;
    }
    setConfirmationOpen(true);
  };

  const confirmMessage = () => {
    if (!isAuthenticated || !configuration?.configured || !e164Pattern.test(recipient.trim()) || !body.trim()) {
      setConfirmationOpen(false);
      toast.error("Review the recipient and message before submitting the text.");
      return;
    }

    setConfirmationOpen(false);
    sendMutation.mutate({
      to: recipient.trim(),
      contactName: contactName.trim() || undefined,
      body: body.trim(),
      clientMessageId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      confirmLiveSend: true,
    });
  };

  return (
    <DashboardLayout demoMode>
      <Seo title="Inbox & Text" description="Secure real estate team SMS conversations in Simply Saturn." />
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <button type="button" onClick={() => setLocation("/app")} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#6a5889] transition-colors hover:text-[#40345e]"><ArrowLeft size={15} />Workspace dashboard</button>
          <p className="mt-4 font-sans text-xs font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Inbox & text</p>
          <h1 className="mt-2 text-4xl leading-tight text-[#202547] sm:text-5xl">Keep conversations close to the work.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#697087]">Compose a verified text from Simply Saturn. Messages are submitted only after a direct confirmation and are recorded in the workspace timeline.</p>
        </div>
        <div className={cn("inline-flex items-center gap-2 self-start rounded-full border px-3 py-2 text-xs font-bold sm:self-auto", configuration?.configured ? "border-[#6f9568]/25 bg-[#edf4eb] text-[#557450]" : "border-[#b98a4f]/25 bg-[#fbf4e9] text-[#86602d]")}>{configuration?.configured ? <CheckCircle2 size={15} /> : <LockKeyhole size={15} />}{configuration?.configured ? `Configured · ${configuration.senderLabel}` : "Server-side configuration required"}</div>
      </section>

      <div className="mt-7 grid min-h-[39rem] gap-4 xl:grid-cols-[20rem_minmax(0,1fr)_21rem]">
        <aside className="rounded-[1.35rem] border border-[#171b39]/9 bg-white p-3 shadow-[0_16px_45px_rgba(26,30,59,.06)]">
          <div className="flex items-center justify-between px-2 pb-3"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Conversations</p><p className="mt-1 text-sm font-bold text-[#2e3456]">Your text activity</p></div><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f1eee6] text-[#5c4e7a]"><MessageSquareText size={16} /></span></div>
          <div className="space-y-1 border-t border-[#171b39]/8 pt-2">
            {!isAuthenticated && !loading ? <div className="px-3 py-8 text-center"><LockKeyhole className="mx-auto text-[#8a6c45]" size={22} /><p className="mt-3 text-sm font-bold text-[#3a4061]">Sign in to see your conversations.</p><button type="button" onClick={() => setLocation("/login")} className="ss-button-primary mt-4 text-xs">Sign in</button></div> : null}
            {isAuthenticated && conversationsQuery.isLoading ? <p className="px-3 py-6 text-center text-xs font-bold text-[#74798d]">Loading text activity…</p> : null}
            {isAuthenticated && !conversationsQuery.isLoading && conversations.length === 0 ? <div className="px-3 py-8 text-center"><Smartphone className="mx-auto text-[#aa9e86]" size={22} /><p className="mt-3 text-sm font-bold text-[#3a4061]">No text conversations yet.</p><p className="mt-1 text-xs leading-5 text-[#74798d]">Use the composer to start an accountable, recorded outreach thread.</p></div> : null}
            {conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => { setSelectedConversationId(conversation.id); setRecipient(conversation.contactPhone); setContactName(conversation.contactName ?? ""); }} className={cn("w-full rounded-xl px-3 py-3 text-left transition-colors", selectedConversationId === conversation.id ? "bg-[#242b52] text-white" : "hover:bg-[#f5f2eb]")}><div className="flex items-center justify-between gap-3"><span className="truncate text-sm font-extrabold">{conversation.contactName || conversation.contactPhone}</span><ChevronRight size={15} className={selectedConversationId === conversation.id ? "text-[#dfcda9]" : "text-[#999daf]"} /></div><p className={cn("mt-1 truncate text-xs", selectedConversationId === conversation.id ? "text-[#d3d2dd]" : "text-[#757b91]")}>{conversation.lastMessagePreview || conversation.contactPhone}</p></button>)}
          </div>
        </aside>

        <section className="flex min-h-[30rem] flex-col overflow-hidden rounded-[1.35rem] border border-[#171b39]/9 bg-white shadow-[0_16px_45px_rgba(26,30,59,.06)]">
          <div className="flex items-center justify-between border-b border-[#171b39]/8 px-5 py-4"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">Message timeline</p><h2 className="mt-1 text-xl text-[#282d50]">{threadQuery.data?.conversation.contactName || threadQuery.data?.conversation.contactPhone || "Select a conversation"}</h2></div><span className="rounded-full bg-[#f2efe8] px-2.5 py-1 text-[0.58rem] font-extrabold uppercase tracking-[.11em] text-[#777267]">SMS record</span></div>
          <div className="flex flex-1 flex-col justify-end gap-4 overflow-y-auto bg-[radial-gradient(circle_at_92%_8%,rgba(209,164,103,.11),transparent_25rem),linear-gradient(135deg,#fbfaf6,#f5f3ed)] p-5">
            {!selectedConversationId ? <div className="m-auto max-w-sm text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e9e6ef] text-[#5d4f7d]"><MessageSquareText size={22} /></span><h3 className="mt-4 text-xl text-[#303657]">A quiet inbox is a clear start.</h3><p className="mt-2 text-sm leading-6 text-[#74798e]">Choose an existing conversation or use the composer to begin a new verified message.</p></div> : null}
            {selectedConversationId && threadQuery.isLoading ? <p className="m-auto text-sm font-bold text-[#74798d]">Loading conversation…</p> : null}
            {threadQuery.data?.messages.map((message) => <div key={message.id} className={cn("flex", message.direction === "outbound" ? "justify-end" : "justify-start")}><div className={cn("max-w-[86%] rounded-2xl px-4 py-3 shadow-sm", message.direction === "outbound" ? "rounded-br-md bg-[#252c53] text-white" : "rounded-bl-md bg-white text-[#333957]")}><p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p><p className={cn("mt-2 flex items-center gap-1.5 text-[0.62rem] font-bold", message.direction === "outbound" ? "text-[#d9d7e1]" : "text-[#7e8395]")}><Clock3 size={11} />{deliveryLabel(message.deliveryStatus)}</p></div></div>)}
          </div>
        </section>

        <aside className="rounded-[1.35rem] border border-[#171b39]/9 bg-white p-5 shadow-[0_16px_45px_rgba(26,30,59,.06)]">
          <div className="flex items-center justify-between"><div><p className="font-sans text-[0.62rem] font-extrabold uppercase tracking-[.13em] text-[#8a6c45]">New text</p><h2 className="mt-1 text-2xl text-[#282d50]">Compose with intent.</h2></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ece8df] text-[#5c4e7a]"><Send size={17} /></span></div>
          <form className="mt-6 space-y-4" onSubmit={submitMessage}>
            <label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Recipient name <span className="font-medium text-[#8c90a1]">(optional)</span></span><input value={contactName} onChange={(event) => setContactName(event.target.value)} maxLength={160} className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="Contact name" /></label>
            <label className="block"><span className="text-xs font-extrabold text-[#4c5270]">Recipient number</span><input value={recipient} onChange={(event) => setRecipient(event.target.value)} inputMode="tel" className="mt-1.5 w-full rounded-xl border border-[#171b39]/10 bg-[#fbfaf6] px-3 py-2.5 text-sm text-[#303657] outline-none transition focus:border-[#6a5889] focus:ring-2 focus:ring-[#6a5889]/12" placeholder="+15551234567" aria-describedby="recipient-help" required /><span id="recipient-help" className="mt-1.5 block text-[0.68rem] leading-4 text-[#7d8194]">Use E.164 format. Trial accounts can message verified recipients only.</span></label>
            <label className="block"><span className="flex items-center justify-between text-xs font-extrabold text-[#4c5270]">Message <span className="font-medium text-[#8c90a1]">{body.length}/1600</span></span><Textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={1600} className="mt-1.5 min-h-36 resize-y rounded-xl border-[#171b39]/10 bg-[#fbfaf6] text-sm leading-6 text-[#303657] focus-visible:border-[#6a5889] focus-visible:ring-[#6a5889]/12" placeholder="Write a clear, helpful text…" required /></label>
            <button type="button" onClick={() => setBody(supportAcknowledgement)} className="inline-flex items-center gap-2 text-xs font-extrabold text-[#66547f] transition-colors hover:text-[#433354]"><Settings2 size={14} />Use support acknowledgement template</button>
            <button type="submit" disabled={!canSend} className="ss-button-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50">{sendMutation.isPending ? "Submitting text…" : "Review & send text"}<Send size={16} /></button>
          </form>
          <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
            <DialogContent className="border-[#171b39]/10 bg-[#fffdf9] text-[#303657] shadow-[0_24px_80px_rgba(22,26,53,.2)]">
              <DialogHeader>
                <p className="font-sans text-[0.65rem] font-extrabold uppercase tracking-[.14em] text-[#8a6c45]">Final review</p>
                <DialogTitle className="font-serif text-2xl text-[#252c53]">Confirm this text.</DialogTitle>
                <DialogDescription className="leading-6 text-[#697087]">This is the last step before Simply Saturn submits your message to the delivery provider.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 rounded-xl border border-[#171b39]/9 bg-[#f8f6f0] p-4">
                <div><p className="text-[0.65rem] font-extrabold uppercase tracking-[.12em] text-[#8a6c45]">Recipient</p><p className="mt-1 text-sm font-bold text-[#303657]">{contactName.trim() || "Unlabeled contact"} <span className="font-medium text-[#74798d]">{recipient.trim()}</span></p></div>
                <div><p className="text-[0.65rem] font-extrabold uppercase tracking-[.12em] text-[#8a6c45]">Message</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#414863]">{body.trim()}</p></div>
              </div>
              <DialogFooter>
                <DialogClose asChild><button type="button" className="ss-button-secondary justify-center">Go back</button></DialogClose>
                <button type="button" onClick={confirmMessage} disabled={sendMutation.isPending} className="ss-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">{sendMutation.isPending ? "Submitting text…" : "Confirm & send text"}<Send size={16} /></button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="mt-5 rounded-xl border border-[#d9c59f]/35 bg-[#fbf5e9] p-3"><p className="flex items-center gap-2 text-xs font-extrabold text-[#795b32]"><ShieldCheck size={15} />Delivery safeguard</p><p className="mt-1.5 text-[0.7rem] leading-5 text-[#836f50]">The sender must explicitly confirm each live text. Provider credentials remain on the server and never enter this page.</p></div>
          {!configuration?.configured && isAuthenticated ? <div className="mt-3 rounded-xl border border-[#a58258]/20 bg-[#f8f4ea] p-3"><p className="flex items-center gap-2 text-xs font-extrabold text-[#785c35]"><CircleAlert size={15} />Live sending is not configured</p><p className="mt-1.5 text-[0.7rem] leading-5 text-[#806c50]">Add fresh server-side Twilio credentials and an approved sender number to activate this composer.</p></div> : null}
        </aside>
      </div>
    </DashboardLayout>
  );
}
