import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import MemberCard from "@/components/members/MemberCard";
import MemberStats from "@/components/members/MemberStats";
import PresidentTimeline from "@/components/members/PresidentTimeline";
import AlumniMap from "@/components/members/AlumniMap";
import AuthorRanking from "@/components/members/AuthorRanking";
import PhotoWall from "@/components/members/PhotoWall";

interface Member {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_claimed: boolean;
  city: string | null;
}

interface WorkCount {
  member_id: string;
  count: number;
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [workCounts, setWorkCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [membersRes, worksRes] = await Promise.all([
        supabase.from("members").select("id, name, term, role_title, bio, avatar_url, is_claimed, city").order("term", { ascending: false }),
        supabase.from("member_works").select("member_id"),
      ]);
      setMembers((membersRes.data as Member[]) || []);

      // Count works per member
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
    return result;
  }, [members, search, selectedTerm, selectedRole]);

  const groupedByTerm = useMemo(() => {
    const g: Record<string, Member[]> = {};
    filtered.forEach(m => (g[m.term] = g[m.term] || []).push(m));
    return g;
  }, [filtered]);

  const sortedTerms = Object.keys(groupedByTerm).sort((a, b) => b.localeCompare(a));

  // Presidents for timeline
  const presidents = useMemo(() =>
    members
      .filter(m => m.role_title?.includes("社长") && !m.role_title?.includes("副"))
      .sort((a, b) => b.term.localeCompare(a.term)),
    [members]
  );

  // City distribution
  const cityData = useMemo(() => {
    const c: Record<string, number> = {};
    members.forEach(m => { if (m.city) c[m.city] = (c[m.city] || 0) + 1; });
    return c;
  }, [members]);

  // Top authors
  const rankedAuthors = useMemo(() =>
    members
      .filter(m => (workCounts[m.id] || 0) > 0)
      .map(m => ({ id: m.id, name: m.name, term: m.term, avatar_url: m.avatar_url, works_count: workCounts[m.id] || 0 }))
      .sort((a, b) => b.works_count - a.works_count)
      .slice(0, 10),
    [members, workCounts]
  );

  // Photo wall groups
  const photoGroups = useMemo(() => {
    const g: Record<string, { id: string; name: string; avatar_url: string | null }[]> = {};
    members.forEach(m => (g[m.term] = g[m.term] || []).push({ id: m.id, name: m.name, avatar_url: m.avatar_url }));
    return g;
  }, [members]);

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

  return (
    <Layout>
      {/* Hero */}
      <div className="relative overflow-hidden bg-[hsl(var(--archive-charcoal))] py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container relative mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-3xl font-bold tracking-[0.2em] text-[hsl(var(--archive-cream))] md:text-5xl"
          >
            红湖文学社 · 校友档案库
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 font-serif text-sm italic text-[hsl(var(--archive-cream))] md:text-base"
          >
            "一代人有一代人的文学，一代人有一代人的故事"
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mx-auto mt-8 max-w-md"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索成员姓名..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-full border border-border/30 bg-background/90 py-3 pl-11 pr-4 text-sm text-foreground backdrop-blur placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <MemberStats
        totalMembers={members.length}
        totalWorks={Object.values(workCounts).reduce((a, b) => a + b, 0)}
        totalPresidents={presidents.length}
      />

      {/* Filters + Cards */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Filter bar */}
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">届别</span>
              <button
                onClick={() => setSelectedTerm(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${!selectedTerm ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
              >全部</button>
              {terms.map(t => (
                <button key={t} onClick={() => setSelectedTerm(t)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedTerm === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                >{t}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">职位</span>
              <button
                onClick={() => setSelectedRole(null)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${!selectedRole ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
              >全部</button>
              {roleFilters.map(r => (
                <button key={r} onClick={() => setSelectedRole(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${selectedRole === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                >{r}</button>
              ))}
            </div>
          </div>

          {/* Cards */}
          {sortedTerms.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">暂无匹配的成员数据</p>
          ) : (
            sortedTerms.map(term => (
              <div key={term} className="mb-10">
                <h2 className="mb-4 font-serif text-lg font-bold text-primary">{term}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedByTerm[term]
                    .sort((a, b) => rolePriority(a.role_title) - rolePriority(b.role_title))
                    .map(m => (
                      <MemberCard
                        key={m.id}
                        id={m.id}
                        name={m.name}
                        term={m.term}
                        role_title={m.role_title}
                        bio={m.bio}
                        avatar_url={m.avatar_url}
                        is_claimed={m.is_claimed || false}
                        works_count={workCounts[m.id] || 0}
                      />
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* President Timeline */}
      <PresidentTimeline presidents={presidents} />

      {/* Alumni Map */}
      {Object.keys(cityData).length > 0 && <AlumniMap cityData={cityData} />}

      {/* Photo Wall */}
      <PhotoWall termGroups={photoGroups} />

      {/* Author Ranking */}
      <AuthorRanking authors={rankedAuthors} />
    </Layout>
  );
};

export default Members;
