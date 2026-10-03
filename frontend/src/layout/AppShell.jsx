import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  FolderKanban,
  Home,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Shield,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../auth";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  {
    label: "Academics",
    icon: BookOpen,
    children: [
      { to: "/academics/attendance", label: "Attendance" },
      { to: "/academics/calculator", label: "Attendance Calculator" },
      { to: "/academics/bunk", label: "Planned Bunk Calculator" },
      { to: "/academics/todo", label: "Attendance To-Do" },
      { to: "/academics/sgpa", label: "SGPA Calculator" },
      { to: "/academics/timetable", label: "Timetable" },
      { to: "/academics/calendar", label: "Academic Calendar" },
    ],
  },
  {
    label: "Resources",
    icon: Newspaper,
    children: [
      { to: "/resources/papers", label: "Question Papers" },
      { to: "/resources/materials", label: "Course Materials" },
      { to: "/resources/textbooks", label: "Textbooks" },
      { to: "/resources/notes", label: "Short Notes" },
      { to: "/resources/handwritten", label: "Handwritten Notes" },
      { to: "/resources/youtube", label: "YouTube References" },
    ],
  },
  {
    label: "Opportunities",
    icon: Briefcase,
    children: [
      { to: "/opportunities/placements", label: "Placements" },
      { to: "/opportunities/internships", label: "Internships" },
      { to: "/opportunities/vacancies", label: "Company Vacancies" },
      { to: "/opportunities/higher-studies", label: "Higher Studies" },
    ],
  },
  {
    label: "Campus",
    icon: Calendar,
    children: [
      { to: "/campus/events", label: "Events" },
      { to: "/campus/news", label: "News" },
      { to: "/campus/achievements", label: "Achievements" },
      { to: "/campus/buzz", label: "Campus Buzz" },
    ],
  },
  {
    label: "Projects",
    icon: FolderKanban,
    children: [
      { to: "/projects/problems", label: "Problem Statements" },
      { to: "/projects/mini", label: "Mini Projects" },
      { to: "/projects/research", label: "Research Papers" },
    ],
  },
  {
    label: "Community",
    icon: Users,
    children: [
      { to: "/community/alumni", label: "Alumni" },
      { to: "/community/network", label: "Student Network" },
    ],
  },
  { to: "/lost-found", label: "Lost and Found", icon: Search },
  { to: "/profile", label: "Profile", icon: UserRound },
  {
    label: "About",
    icon: Newspaper,
    children: [{ to: "/about/credits", label: "Developer Credits" }],
  },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const links = useMemo(() => {
    const extra = user?.role === "admin" ? [{ to: "/admin", label: "Admin", icon: Shield }] : [];
    return [...NAV, ...extra];
  }, [user]);

  function onSearch(e) {
    e.preventDefault();
    const value = q.trim().toLowerCase();
    if (!value) return;
    if (value.includes("attend") || value.includes("bunk")) navigate("/academics/attendance");
    else if (value.includes("sgpa") || value.includes("grade")) navigate("/academics/sgpa");
    else if (value.includes("time")) navigate("/academics/timetable");
    else if (value.includes("paper")) navigate("/resources/papers");
    else if (value.includes("place") || value.includes("job")) navigate("/opportunities/placements");
    else if (value.includes("alumni")) navigate("/community/alumni");
    else if (value.includes("lost")) navigate("/lost-found");
    else navigate("/campus/buzz");
  }

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">SC</div>
          <div>
            <h1>Sahyadri Portal</h1>
            <p>Student ecosystem</p>
          </div>
        </div>
        {links.map((item) =>
          item.children ? (
            <NavGroup key={item.label} item={item} pathname={location.pathname} onNavigate={() => setOpen(false)} />
          ) : (
            <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={() => setOpen(false)}>
              <item.icon size={16} /> {item.label}
            </NavLink>
          )
        )}
        <button className="nav-link" onClick={logout} style={{ marginTop: "1rem" }}>
          <LogOut size={16} /> Sign out
        </button>
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="btn ghost mobile-toggle" onClick={() => setOpen((v) => !v)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
          <form className="search" onSubmit={onSearch}>
            <Search size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search attendance, papers, placements…" />
          </form>
          <div className="row">
            <span className="badge neutral">
              <Bell size={12} /> {user?.department} · Sem {user?.semester} {user?.section}
            </span>
            <div className="user-chip">
              <div className="avatar">{user?.name?.slice(0, 2).toUpperCase()}</div>
              <div>
                <strong style={{ display: "block", fontSize: "0.85rem" }}>{user?.name}</strong>
                <span className="muted" style={{ fontSize: "0.72rem" }}>{user?.usn}</span>
              </div>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

function NavGroup({ item, pathname, onNavigate }) {
  const open = item.children.some((c) => pathname.startsWith(c.to.split("/").slice(0, 2).join("/") || c.to));
  const [show, setShow] = useState(open);
  return (
    <div className="nav-group">
      <button className="nav-parent" onClick={() => setShow((v) => !v)}>
        <item.icon size={16} /> {item.label}
      </button>
      {show && (
        <div className="subnav">
          {item.children.map((child) => (
            <NavLink key={child.to} to={child.to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} onClick={onNavigate}>
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}
