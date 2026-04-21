import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import MemberCard from "@/components/members/MemberCard";
import MemberListView from "@/components/members/MemberListView";
import MemberTimelineView from "@/components/members/MemberTimelineView";
import MemberRelationGraph from "@/components/members/MemberRelationGraph";
import ViewSwitcher, { ViewMode, SortMode } from "@/components/members/ViewSwitcher";
import MemberStats from "@/components/members/MemberStats";
import PresidentTimeline from "@/components/members/PresidentTimeline";
import AlumniMap from "@/components/members/AlumniMap";
import AuthorRanking from "@/components/members/AuthorRanking";
import PhotoWall from "@/components/members/PhotoWall";
import LiteraryTagCloud from "@/components/members/LiteraryTagCloud";
import MemoirWall from "@/components/members/MemoirWall";
import AnniversaryCard from "@/components/members/AnniversaryCard";
import RecentJoinFeed from "@/components/members/RecentJoinFeed";
import TermPyramid from "@/components/members/TermPyramid";
import GenreRoseChart from "@/components/members/GenreRoseChart";
import SelfRegistrationDialog from "@/components/members/SelfRegistrationDialog";

interface Member {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_claimed: boolean;
  city: string | null;
  literary_tags: string[] | null;
  memoir: string | null;
  birthday: string | null;
  joined_date: string | null;
  featured_quote: string | null;
  created_at: string;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [workCounts, setWorkCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("card");
  const [sort, setSort] = useState<SortMode>("term");
  const [registrationOpen, setRegistrationOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [membersRes, worksRes] = await Promise.all([
        supabase.from("members").select("id, name, term, role_title, bio, avatar_url, is_claimed, city, literary_tags, memoir, birthday, joined_date, featured_quote, created_at").order("term", { ascending: false }),
        supabase.from("member_works").select("member_id"),
      ]);
      setMembers((membersRes.data as Member[]) || []);
      const counts: Record<string, number> = {};
      (worksRes.data || []).forEach((w: any) => {
        counts[w.member_id] = (counts[w.member_id] || 0) + 1;
      });
      setWorkCounts(counts);
      setLoading(false);
    };
    fetchData();
  }, []);

  const terms = useMemo(() => [...new Set(members.map(m => m.term))].sort((a, b) => b.localeCompare(a)), [members]);
  const roleFilters = ["社长", "副社长", "部长", "社员"];

  // Aggregate literary tags
  const tagCounts = useMemo(() => {
    const c: Record<string, number> = {};
    members.forEach(m => m.literary_tags?.forEach(t => { c[t] = (c[t] || 0) + 1; }));
    return c;
  }, [members]);

  const filtered = useMemo(() => {
    let result = members;
    if (search) result = result.filter(m => m.name.includes(search));
    if (selectedTerm) result = result.filter(m => m.term === selectedTerm);
    if (selectedRole) {
      if (selectedRole === "社员") {
        result = result.filter(m => !m.role_title || (!m.role_title.includes("社长") && !m.role_title.includes("部长")));
      } else {
        result = result.filter(m => m.role_title?.includes(selectedRole));
      }
    }
    if (selectedTag) result = result.filter(m => m.literary_tags?.includes(selectedTag));
    return result;
  }, [members, search, selectedTerm, selectedRole, selectedTag]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "works":
        return arr.sort((a, b) => (workCounts[b.id] || 0) - (workCounts[a.id] || 0));
      case "name":
        return arr.sort((a, b) => a.name.localeCompare(b.name, "zh"));
      case "joined":
        return arr.sort((a, b) => new Date(b.joined_date || b.created_at).getTime() - new Date(a.joined_date || a.created_at).getTime());
      default:
        return arr.sort((a, b) => b.term.localeCompare(a.term));
    }
  }, [filtered, sort, workCounts]);

  const groupedByTerm = useMemo(() => {
    const g: Record<string, Member[]> = {};
    sorted.forEach(m => (g[m.term] = g[m.term] || []).push(m));
    return g;
  }, [sorted]);

  const sortedTerms = Object.keys(groupedByTerm).sort((a, b) => b.localeCompare(a));

  const presidents = useMemo(() =>
    members.filter(m => m.role_title?.includes("社长") && !m.role_title?.includes("副"))
      .sort((a, b) => b.term.localeCompare(a.term)), [members]);

  const cityData = useMemo(() => {
    const c: Record<string, number> = {};
    members.forEach(m => { if (m.city) c[m.city] = (c[m.city] || 0) + 1; });
    return c;
  }, [members]);

  const rankedAuthors = useMemo(() =>
    members.filter(m => (workCounts[m.id] || 0) > 0)
      .map(m => ({ id: m.id, name: m.name, term: m.term, avatar_url: m.avatar_url, works_count: workCounts[m.id] || 0 }))
      .sort((a, b) => b.works_count - a.works_count).slice(0, 10), [members, workCounts]);

  const photoGroups = useMemo(() => {
    const g: Record<string, { id: string; name: string; avatar_url: string | null }[]> = {};
    members.forEach(m => (g[m.term] = g[m.term] || []).push({ id: m.id, name: m.name, avatar_url: m.avatar_url }));
    return g;
  }, [members]);

  // Memoir wall items: prefer featured_quote > memoir > bio
  const memoirItems = useMemo(() =>
    members
      .map(m => {
        const text = m.featured_quote || m.memoir || m.bio;
        if (!text || text.length < 8) return null;
        return { id: m.id, name: m.name, term: m.term, text: text.slice(0, 180) };
      })
      .filter(Boolean) as { id: string; name: string; term: string; text: string }[],
    [members]);

  // Today's anniversaries
  const anniversaries = useMemo(() => {
    const today = new Date();
    const m = today.getMonth() + 1, d = today.getDate();
    const items: { id: string; name: string; term: string; type: "birthday" | "joined"; years?: number }[] = [];
    members.forEach(mem => {
      if (mem.birthday) {
        const b = new Date(mem.birthday);
        if (b.getMonth() + 1 === m && b.getDate() === d) {
          items.push({ id: mem.id, name: mem.name, term: mem.term, type: "birthday" });
        }
      }
      if (mem.joined_date) {
        const j = new Date(mem.joined_date);
        if (j.getMonth() + 1 === m && j.getDate() === d) {
          items.push({ id: mem.id, name: mem.name, term: mem.term, type: "joined", years: today.getFullYear() - j.getFullYear() });
        }
      }
    });
    return items;
  }, [members]);

  // Recent joins
  const recentJoins = useMemo(() =>
    [...members].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8)
      .map(m => ({ id: m.id, name: m.name, term: m.term, created_at: m.created_at })),
    [members]);

  // Term pyramid data
  const termPyramidData = useMemo(() => {
    const data: Record<string, { members: number; works: number }> = {};
    members.forEach(m => {
      data[m.term] = data[m.term] || { members: 0, works: 0 };
      data[m.term].members += 1;
      data[m.term].works += workCounts[m.id] || 0;
    });
    return Object.entries(data).map(([term, v]) => ({ term, ...v }));
  }, [members, workCounts]);

  const rolePriority = (role: string | null) => {
    if (!role) return 99;
    if (role.includes("社长") && !role.includes("副")) return 0;
    if (role.includes("副社长")) return 1;
    if (role.includes("部长")) return 2;
    return 10;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  // List items for table view
  const listItems = sorted.map(m => ({
    id: m.id, name: m.name, term: m.term, role_title: m.role_title,
    city: m.city, is_claimed: m.is_claimed || false, works_count: workCounts[m.id] || 0,
  }));

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[hsl(var(--archive-charcoal))] py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container relative mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-serif text-3xl font-bold tracking-[0.2em] text-[hsl(var(--archive-cream))] md:text-5xl"
          >
            红湖文学社 · 校友档案库
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 font-serif text-sm italic text-[hsl(var(--archive-cream))] md:text-base"
          >
            "一代人有一代人的文学，一代人有一代人的故事"
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}
            className="mx-auto mt-8 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" placeholder="搜索成员姓名..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border border-border/30 bg-background/90 py-3 pl-11 pr-4 text-sm text-foreground backdrop-blur placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.4 }}
              onClick={() => setRegistrationOpen(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--archive-cream))]/30 bg-[hsl(var(--archive-cream))]/10 px-5 py-2 text-xs font-medium text-[hsl(var(--archive-cream))] backdrop-blur transition hover:bg-[hsl(var(--archive-cream))]/20"
            >
              <UserPlus className="h-3.5 w-3.5" />
              我也是老社员 · 自助登记
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <MemberStats
        totalMembers={members.length}
        totalWorks={Object.values(workCounts).reduce((a, b) => a + b, 0)}
        totalPresidents={presidents.length}
      />

      {/* Today's Anniversary */}
      <AnniversaryCard items={anniversaries} />

      {/* Filter + View Switcher + Members */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">届别</span>
              <button onClick={() => setSelectedTerm(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${!selectedTerm ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>全部</button>
              {terms.map(t => (
                <button key={t} onClick={() => setSelectedTerm(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedTerm === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{t}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">职位</span>
              <button onClick={() => setSelectedRole(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${!selectedRole ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>全部</button>
              {roleFilters.map(r => (
                <button key={r} onClick={() => setSelectedRole(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedRole === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>{r}</button>
              ))}
            </div>
            {selectedTag && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">流派：</span>
                <button onClick={() => setSelectedTag(null)} className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground">
                  {selectedTag} ✕
                </button>
              </div>
            )}
            <ViewSwitcher view={view} onViewChange={setView} sort={sort} onSortChange={setSort} />
          </div>

          {sorted.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">暂无匹配的成员数据</p>
          ) : view === "list" ? (
            <MemberListView members={listItems} />
          ) : view === "timeline" ? (
            <MemberTimelineView members={sorted} />
          ) : view === "graph" ? (
            <MemberRelationGraph members={sorted} />
          ) : sort === "term" ? (
            sortedTerms.map(term => (
              <div key={term} className="mb-10">
                <h2 className="mb-4 font-serif text-lg font-bold text-primary">{term}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedByTerm[term]
                    .sort((a, b) => rolePriority(a.role_title) - rolePriority(b.role_title))
                    .map(m => (
                      <MemberCard key={m.id} id={m.id} name={m.name} term={m.term}
                        role_title={m.role_title} bio={m.bio} avatar_url={m.avatar_url}
                        is_claimed={m.is_claimed || false} works_count={workCounts[m.id] || 0}
                        city={m.city} literary_tags={m.literary_tags} memoir={m.memoir}
                      />
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map(m => (
                <MemberCard key={m.id} id={m.id} name={m.name} term={m.term}
                  role_title={m.role_title} bio={m.bio} avatar_url={m.avatar_url}
                  is_claimed={m.is_claimed || false} works_count={workCounts[m.id] || 0}
                  city={m.city} literary_tags={m.literary_tags} memoir={m.memoir}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Literary tag cloud */}
      {Object.keys(tagCounts).length > 0 && (
        <LiteraryTagCloud tags={tagCounts} selectedTag={selectedTag} onSelectTag={setSelectedTag} />
      )}

      {/* Memoir wall */}
      <MemoirWall items={memoirItems} />

      {/* Term pyramid */}
      <TermPyramid termCounts={termPyramidData} />

      {/* Genre rose chart */}
      {Object.keys(tagCounts).length > 0 && <GenreRoseChart tags={tagCounts} />}

      {/* President Timeline */}
      <PresidentTimeline presidents={presidents} />

      {/* Alumni Map */}
      {Object.keys(cityData).length > 0 && <AlumniMap cityData={cityData} />}

      {/* Recent Joins */}
      <RecentJoinFeed items={recentJoins} />

      {/* Photo Wall */}
      <PhotoWall termGroups={photoGroups} />

      {/* Author Ranking */}
      <AuthorRanking authors={rankedAuthors} />

      <SelfRegistrationDialog open={registrationOpen} onOpenChange={setRegistrationOpen} />
    </Layout>
  );
};

export default Members;
