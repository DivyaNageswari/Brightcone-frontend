import React, { useState, useEffect } from "react";
import axios from "axios";
import {

  Plus,
  Search,
  MessageSquare,
  CheckCircle2,
  Clock,
  UserCheck,
  Send,
  X,
  AlertTriangle,



} from "lucide-react";
import { useNotifications } from "../../services/notificationsContext";

interface TicketReply {
  id: string;
  author_name: string;
  author_role: string;
  message: string;
  created_at: string;
}

interface Ticket {
  id: string;
  employee_id: string;
  employee_name: string;
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In progress" | "Resolved";
  assigned_to?: string;
  created_at: string;
  replies: TicketReply[];
}

const defaultTickets: Ticket[] = [
  {
    id: "T-101",
    employee_id: "EMP-001",
    employee_name: "Ananya Rao",
    subject: "Salary Account Bank Change",
    category: "Payroll & tax",
    priority: "High",
    status: "In progress",
    assigned_to: "Karthik Nair",
    created_at: "2026-10-13T10:00:00Z",
    replies: [
      {
        id: "r-1",
        author_name: "Ananya Rao",
        author_role: "Employee",
        message: "I have updated my primary salary account to HDFC Bank. Attached the cancelled cheque for IFSC verification.",
        created_at: "2026-10-13T10:00:00Z",
      },
      {
        id: "r-2",
        author_name: "Karthik Nair",
        author_role: "HR Partner",
        message: "Received your document Ananya. Forwarding to the finance payroll team for verification with bank portal.",
        created_at: "2026-10-13T14:30:00Z",
      },
    ],
  },
  {
    id: "T-102",
    employee_id: "EMP-002",
    employee_name: "Rohan Patel",
    subject: "Parental Health Insurance Add-on query",
    category: "Benefits & insurance",
    priority: "Medium",
    status: "Open",
    created_at: "2026-10-14T11:20:00Z",
    replies: [
      {
        id: "r-3",
        author_name: "Rohan Patel",
        author_role: "Employee",
        message: "Is the deadline for senior citizen parents copay waiver extended till end of month?",
        created_at: "2026-10-14T11:20:00Z",
      },
    ],
  },
  {
    id: "T-103",
    employee_id: "EMP-003",
    employee_name: "Sneha Reddy",
    subject: "Loss of Pay deduction discrepancy",
    category: "Payroll & tax",
    priority: "Urgent",
    status: "Resolved",
    assigned_to: "Ananya Rao",
    created_at: "2026-10-09T08:45:00Z",
    replies: [
      {
        id: "r-4",
        author_name: "Sneha Reddy",
        author_role: "Employee",
        message: "My approved medical leave on Oct 2nd was deducted as LOP in preliminary register.",
        created_at: "2026-10-09T08:45:00Z",
      },
      {
        id: "r-5",
        author_name: "Ananya Rao",
        author_role: "HR Partner",
        message: "Verified medical certificate and regularized in attendance ledger. LOP removed.",
        created_at: "2026-10-09T16:10:00Z",
      },
    ],
  },
];

const hrPartners = ["Ananya Rao", "Karthik Nair", "Priya Sharma", "Vikram Malhotra"];

export const HelpdeskQueuePage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(defaultTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string>("T-101");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [replyText, setReplyText] = useState("");
  const { addNotification } = useNotifications();

  // Create Ticket Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Payroll & tax");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [initialMessage, setInitialMessage] = useState("");

  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/helpdesk/tickets");
      if (res.data && Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch {
      // Keep local state
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) return;

    const payload = {
      subject,
      category,
      priority,
      message: initialMessage,
    };

    try {
      const res = await axios.post("/api/helpdesk/tickets", payload);
      if (res.data) {
        setTickets((prev) => [res.data, ...prev]);
        setSelectedTicketId(res.data.id);
      }
    } catch {
      const newTicket: Ticket = {
        id: `T-${Math.floor(100 + Math.random() * 900)}`,
        employee_id: "EMP-001",
        employee_name: "Ananya Rao",
        subject,
        category,
        priority,
        status: "Open",
        created_at: new Date().toISOString(),
        replies: [
          {
            id: `r-${Date.now()}`,
            author_name: "Ananya Rao",
            author_role: "Employee",
            message: initialMessage,
            created_at: new Date().toISOString(),
          },
        ],
      };
      setTickets((prev) => [newTicket, ...prev]);
      setSelectedTicketId(newTicket.id);
    }

    addNotification({
      title: "Helpdesk Ticket Raised",
      message: `Your ticket "${subject}" has been queued. An HR partner will respond shortly.`,
      category: "helpdesk",
      actionUrl: "/engagement/helpdesk",
    });

    setIsModalOpen(false);
    setSubject("");
    setInitialMessage("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const replyObj: TicketReply = {
      id: `r-${Date.now()}`,
      author_name: "Ananya Rao",
      author_role: "HR Partner",
      message: replyText.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      await axios.post(`/api/helpdesk/tickets/${selectedTicketId}/reply`, {
        author_name: "Ananya Rao",
        author_role: "HR Partner",
        message: replyText.trim(),
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? { ...t, replies: [...t.replies, replyObj] }
          : t
      )
    );
    setReplyText("");
  };

  const handleAssign = async (partner: string) => {
    try {
      await axios.post(`/api/helpdesk/tickets/${selectedTicketId}/assign`, {
        assigned_to: partner,
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? {
              ...t,
              assigned_to: partner,
              status: t.status === "Open" ? "In progress" : t.status,
            }
          : t
      )
    );
  };

  const handleStatusChange = async (newStatus: "Open" | "In progress" | "Resolved") => {
    try {
      await axios.post(`/api/helpdesk/tickets/${selectedTicketId}/status`, {
        status: newStatus,
      });
    } catch {
      // Local fallback
    }

    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicketId ? { ...t, status: newStatus } : t))
    );
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter((t) => t.status === "In progress").length;
  const unassignedCount = tickets.filter((t) => !t.assigned_to && t.status !== "Resolved").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === "All" ? true : t.status === statusFilter;
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.employee_name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-semibold text-txt">
            HR Helpdesk & Support Queue
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Track, assign, and answer employee queries. Threaded conversations are retained for resolution auditing.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
            <span>Open Tickets</span>
          </div>
          <div className="font-sora text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {openCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Awaiting response</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300">
              <UserCheck className="w-4 h-4" />
            </span>
            <span>In Progress</span>
          </div>
          <div className="font-sora text-2xl font-bold text-brand mt-2">
            {inProgressCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Being resolved by HR</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
            <span>Unassigned</span>
          </div>
          <div className="font-sora text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {unassignedCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Needs partner assignment</div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-line shadow-card">
          <div className="flex items-center gap-2 text-txt-muted text-xs">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
            <span>Resolved</span>
          </div>
          <div className="font-sora text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {resolvedCount}
          </div>
          <div className="text-[11px] text-txt-faint mt-1">Completed successfully</div>
        </div>
      </div>

      {/* Main Split Layout: Tickets List vs Active Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Status Filter */}
          <div className="space-y-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-txt-faint absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search ticket subject, employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface border border-line text-xs text-txt outline-none focus:border-brand"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {["All", "Open", "In progress", "Resolved"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === tab
                      ? "bg-brand text-white font-semibold"
                      : "text-txt-muted hover:text-txt hover:bg-surface-secondary"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Items */}
          <div className="bg-surface border border-line rounded-2xl shadow-card divide-y divide-line/60 overflow-hidden max-h-[580px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-txt-faint">
                No tickets matching criteria.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-brand-soft/30 border-l-4 border-l-brand"
                        : "hover:bg-surface-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-txt">{t.id}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                            t.priority === "Urgent"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                              : t.priority === "High"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                              : "bg-surface-secondary text-txt-muted border border-line"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          t.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : t.status === "In progress"
                            ? "bg-blue-50 text-brand dark:bg-blue-950/40 dark:text-blue-300"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-txt truncate">{t.subject}</h4>

                    <div className="flex items-center justify-between text-[11px] text-txt-faint mt-2">
                      <span>{t.employee_name} ? {t.category}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {t.replies.length}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Workspace (7 cols) */}
        {selectedTicket ? (
          <div className="lg:col-span-7 bg-surface border border-line rounded-2xl shadow-card overflow-hidden flex flex-col h-[640px]">
            {/* Top Workspace Bar */}
            <div className="p-4 border-b border-line bg-surface-secondary/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-brand">{selectedTicket.id}</span>
                    <span className="text-txt-faint">?</span>
                    <span className="text-txt-muted">{selectedTicket.category}</span>
                  </div>
                  <h2 className="font-sora text-base font-semibold text-txt mt-1">
                    {selectedTicket.subject}
                  </h2>
                  <div className="text-xs text-txt-muted mt-0.5">
                    Raised by <b>{selectedTicket.employee_name}</b> on {selectedTicket.created_at.slice(0, 10)}
                  </div>
                </div>

                {/* Status Switcher Actions */}
                <div className="flex items-center gap-2">
                  {selectedTicket.status !== "Resolved" ? (
                    <button
                      onClick={() => handleStatusChange("Resolved")}
                      className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve Ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange("In progress")}
                      className="px-3 py-1 rounded-xl border border-line text-xs text-txt-muted hover:text-txt bg-surface hover:bg-surface-secondary font-medium transition-colors"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Selector */}
              <div className="mt-3 pt-3 border-t border-line flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-txt-muted font-medium">Assigned HR Partner:</span>
                  <select
                    value={selectedTicket.assigned_to || ""}
                    onChange={(e) => handleAssign(e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-surface border border-line text-xs text-txt outline-none focus:border-brand font-medium"
                  >
                    <option value="">-- Unassigned --</option>
                    {hrPartners.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[11px] text-txt-faint">Priority: {selectedTicket.priority}</span>
              </div>
            </div>

            {/* Conversation Timeline */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedTicket.replies.map((reply) => {
                const isHr = reply.author_role === "HR Partner";
                return (
                  <div
                    key={reply.id}
                    className={`flex gap-3 text-xs ${isHr ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        isHr
                          ? "bg-brand text-white"
                          : "bg-surface-secondary border border-line text-txt"
                      }`}
                    >
                      {reply.author_name[0]}
                    </div>
                    <div
                      className={`max-w-[78%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                        isHr
                          ? "bg-brand text-white rounded-tr-sm"
                          : "bg-surface-secondary border border-line text-txt rounded-tl-sm"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-semibold ${isHr ? "text-white" : "text-txt"}`}>
                          {reply.author_name}
                        </span>
                        <span className={`text-[10px] ${isHr ? "text-white/70" : "text-txt-faint"}`}>
                          {reply.author_role}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{reply.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <div className="p-3 border-t border-line bg-surface flex items-center gap-2">
              <input
                type="text"
                placeholder={`Reply to ${selectedTicket.employee_name}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendReply();
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface-secondary border border-line text-xs text-txt outline-none focus:border-brand"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="p-2 rounded-xl bg-brand text-white hover:bg-brand/90 disabled:opacity-50 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-surface border border-line rounded-2xl p-12 text-center text-txt-faint text-xs">
            Select a ticket from the left queue to open details.
          </div>
        )}
      </div>

      {/* Raise Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h3 className="font-sora font-semibold text-sm text-txt">
                  Raise an HR Support Request
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Most requests are reviewed and answered within 24 working hours.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-txt-faint hover:text-txt rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-txt font-medium mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="Summary of your question or issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-txt font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  >
                    <option value="Payroll & tax">Payroll & tax</option>
                    <option value="Leave & attendance">Leave & attendance</option>
                    <option value="Benefits & insurance">Benefits & insurance</option>
                    <option value="IT & assets">IT & assets</option>
                    <option value="General HR">General HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-txt font-medium mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Detailed Message</label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 border-t border-line flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-line text-txt-muted hover:text-txt hover:bg-surface-secondary font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 shadow-sm"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskQueuePage;

