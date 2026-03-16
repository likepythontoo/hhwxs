import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { User, BookOpen, Quote, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Member {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
}

interface MemberWork {
  id: string;
  submission_id: string;
  submissions: {
    id: string;
    title: string;
    genre: string | null;
    author_name: string;
    content: string;
  };
}

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [works, setWorks] = useState<MemberWork[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await supabase
        .from("members")
        .select("*")
        .order("term", { ascending: false });
      setMembers(data || []);
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const terms = [...new Set(members.map(m => m.term))];
  const filteredMembers = selectedTerm
    ? members.filter(m => m.term === selectedTerm)
    : members;

  const groupedByTerm = filteredMembers.reduce<Record<string, Member[]>>((acc, m) => {
    (acc[m.term] = acc[m.term] || []).push(m);
    return acc;
  }, {});

  const sortedTerms = Object.keys(groupedByTerm).sort((a, b) => b.localeCompare(a));

  const openMemberDetail = async (member: Member) => {
    setSelectedMember(member);
    setWorksLoading(true);
    const { data } = await supabase
      .from("member_works")
      .select("id, submission_id, submissions(id, title, genre, author_name, content)")
      .eq("member_id", member.id) as any;
    setWorks(data || []);
    setWorksLoading(false);
  };

  // Role priority for sorting within a term
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
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">历届成员风采</h1>
          <p className="mt-3 text-sm opacity-80">每一届的故事，每一个人的光芒</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Term filter */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedTerm(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                !selectedTerm ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
              }`}
            >
              全部
            </button>
            {terms.sort((a, b) => b.localeCompare(a)).map(term => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  selectedTerm === term ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {term}
              </button>
            ))}
          </div>

          {sortedTerms.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">暂无成员数据</p>
          ) : (
            sortedTerms.map(term => (
              <div key={term} className="mb-10">
                <h2 className="mb-4 font-serif text-lg font-bold text-primary">{term}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {groupedByTerm[term]
                    .sort((a, b) => rolePriority(a.role_title) - rolePriority(b.role_title))
                    .map(member => (
                      <button
                        key={member.id}
                        onClick={() => openMemberDetail(member)}
                        className="group rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary/30 hover:shadow-md"
                      >
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                          {member.avatar_url ? (
                            <img src={member.avatar_url} alt={member.name} className="h-full w-full rounded-full object-cover" />
                          ) : (
                            member.name[0]
                          )}
                        </div>
                        <p className="font-serif text-sm font-bold">{member.name}</p>
                        {member.role_title && (
                          <p className="mt-0.5 text-[10px] text-primary">{member.role_title}</p>
                        )}
                        {member.bio && (
                          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground italic">
                            "{member.bio}"
                          </p>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 font-serif">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {selectedMember?.avatar_url ? (
                  <img src={selectedMember.avatar_url} alt={selectedMember.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  selectedMember?.name[0]
                )}
              </div>
              <div>
                <p>{selectedMember?.name}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {selectedMember?.term} {selectedMember?.role_title && `· ${selectedMember.role_title}`}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Bio */}
            {selectedMember?.bio && (
              <div className="rounded-lg bg-secondary/50 p-4">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-primary">
                  <Quote className="h-3.5 w-3.5" /> 个性签名
                </div>
                <p className="text-sm leading-relaxed text-foreground italic">
                  {selectedMember.bio}
                </p>
              </div>
            )}

            {/* Works */}
            <div>
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> 作品集
              </h4>
              {worksLoading ? (
                <p className="text-xs text-muted-foreground animate-pulse">加载中...</p>
              ) : works.length === 0 ? (
                <p className="text-xs text-muted-foreground">暂无关联作品</p>
              ) : (
                <div className="space-y-2">
                  {works.map(w => (
                    <div key={w.id} className="rounded-lg border border-border bg-card p-3">
                      <p className="text-sm font-medium">{w.submissions?.title}</p>
                      {w.submissions?.genre && (
                        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                          {w.submissions.genre}
                        </span>
                      )}
                      <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                        {w.submissions?.content?.replace(/<[^>]*>/g, "").slice(0, 150)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Members;
