import React, { useState, useEffect } from "react";
import axios from "axios";
import {

  Pin,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  User,
  X,



} from "lucide-react";
import { useNotifications } from "../../services/notificationsContext";

interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  author_name: string;
  date: string;
  category: string;
}

const defaultAnnouncements: Announcement[] = [
  {
    id: "A-1",
    title: "Brightcone Q3 Town Hall & Performance Reviews",
    body: "Join us this Friday at 4:00 PM IST on Zoom for the quarterly company all-hands. Executive updates on client expansions, followed by Q&A with leadership.",
    pinned: true,
    author_name: "Ananya Rao (HR Admin)",
    date: "2026-10-14",
    category: "Townhall",
  },
  {
    id: "A-2",
    title: "Updated WFH & Broadband Reimbursement Policy 2026",
    body: "Starting this month, broadband reimbursement limit has been raised to ?1,500/month. Claims must be submitted via the Expenses portal before the 15th of each month.",
    pinned: true,
    author_name: "Finance & People Team",
    date: "2026-10-10",
    category: "Policy",
  },
  {
    id: "A-3",
    title: "Welcome 14 New Team Members to Engineering & AI Teams",
    body: "Please give a warm welcome to our October cohort joining Hyderabad and Bengaluru engineering campuses today! Check the employee directory to connect.",
    pinned: false,
    author_name: "People Ops",
    date: "2026-10-06",
    category: "Company News",
  },
];

export const CompanyFeedPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [category, setCategory] = useState("Company News");

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get("/api/announcements");
      if (res.data && Array.isArray(res.data)) {
        setAnnouncements(res.data);
      }
    } catch {
      // Local fallback
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setPinned(false);
    setCategory("Company News");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setBody(a.body);
    setPinned(a.pinned);
    setCategory(a.category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (editingId) {
      // Edit
      try {
        await axios.put(`/api/announcements/${editingId}`, {
          title,
          body,
          pinned,
          category,
        });
      } catch {
        // Fallback
      }

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingId ? { ...a, title, body, pinned, category } : a
        )
      );
    } else {
      // Create
      const newAnn: Announcement = {
        id: `A-${Math.floor(100 + Math.random() * 900)}`,
        title,
        body,
        pinned,
        author_name: "HR Admin",
        date: new Date().toISOString().split("T")[0],
        category,
      };

      try {
        const res = await axios.post("/api/announcements", {
          title,
          body,
          pinned,
          category,
        });
        if (res.data) {
          setAnnouncements((prev) => [res.data, ...prev]);
        }
      } catch {
        setAnnouncements((prev) => [newAnn, ...prev]);
      }

      addNotification({
        title: `Announcement: ${title}`,
        message: body.slice(0, 80) + (body.length > 80 ? "..." : ""),
        category: "announcement",
        actionUrl: "/engagement/feed",
      });
    }

    setIsModalOpen(false);
  };

  const handleTogglePin = async (id: string) => {
    try {
      await axios.post(`/api/announcements/${id}/toggle-pin`);
    } catch {
      // Fallback
    }

    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a))
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    try {
      await axios.delete(`/api/announcements/${id}`);
    } catch {
      // Fallback
    }

    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  // Pinned announcements first, then date descending
  const sorted = [...announcements].sort((a, b) => {
    if (b.pinned !== a.pinned) {
      return b.pinned ? 1 : -1;
    }
    return b.date.localeCompare(a.date);
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sora text-2xl font-semibold text-txt">
            Company Feed & Announcements
          </h1>
          <p className="text-xs text-txt-muted mt-1">
            Official company news, town hall broadcasts, and policy updates. Pinned announcements appear first on every employee portal.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Post Announcement</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {sorted.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-5 transition-all shadow-card bg-surface ${
              item.pinned
                ? "border-amber-400/40 bg-gradient-to-br from-surface to-amber-500/5 shadow-amber-500/5"
                : "border-line"
            }`}
          >
            {/* Top Bar with Pin indicator */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    <Pin className="w-3 h-3 fill-current rotate-45" />
                    Pinned Announcement
                  </span>
                )}
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-secondary border border-line text-txt-muted">
                  {item.category}
                </span>
                <span className="text-[11px] text-txt-faint flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTogglePin(item.id)}
                  title={item.pinned ? "Unpin from top" : "Pin to top"}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    item.pinned
                      ? "border-amber-400 bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
                      : "border-line bg-surface text-txt-muted hover:text-txt"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(item)}
                  title="Edit Announcement"
                  className="p-1.5 rounded-lg border border-line bg-surface text-txt-muted hover:text-txt transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete Announcement"
                  className="p-1.5 rounded-lg border border-line bg-surface text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title & Body */}
            <h2 className="font-sora text-base font-semibold text-txt mb-2">
              {item.title}
            </h2>
            <p className="text-xs text-txt-muted leading-relaxed whitespace-pre-line">
              {item.body}
            </p>

            {/* Footer Author */}
            <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-txt-faint">
              <span className="flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-txt-muted" />
                Posted by {item.author_name}
              </span>
              <span className="font-mono text-[10px] text-txt-faint">{item.id}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Post/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-surface border border-line rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-line flex items-center justify-between bg-surface-secondary/40">
              <div>
                <h3 className="font-sora font-semibold text-sm text-txt">
                  {editingId ? "Edit Announcement" : "Post Announcement"}
                </h3>
                <p className="text-xs text-txt-muted mt-0.5">
                  Published news is visible to all company employees immediately.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-txt-faint hover:text-txt rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-txt font-medium mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Headline of the announcement..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-txt font-medium mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand"
                  >
                    <option value="Company News">Company News</option>
                    <option value="Townhall">Townhall</option>
                    <option value="Policy">Policy</option>
                    <option value="Celebration">Celebration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-txt font-medium mb-1">Pin Status</label>
                  <label className="flex items-center gap-2 p-2 rounded-xl border border-line bg-surface cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-brand focus:ring-0"
                    />
                    <span className="font-medium text-txt">Pin to top of feed</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-txt font-medium mb-1">Message Content</label>
                <textarea
                  rows={5}
                  placeholder="Type the full announcement message here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-line text-txt outline-none focus:border-brand leading-relaxed"
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
                  {editingId ? "Save Changes" : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyFeedPage;

