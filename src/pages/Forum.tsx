import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Plus, Eye, Lock, Pin, ChevronLeft, Send } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  category: string | null;
  created_at: string;
  view_count: number | null;
  is_pinned: boolean | null;
  is_locked: boolean | null;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

const categories = ["全部", "自由讨论", "文学交流", "活动分享", "求助答疑"];

const Forum = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("全部");

  // Detail view
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // New post
  const [showNewPost, setShowNewPost] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("自由讨论");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single()
          .then(({ data }) => setDisplayName(data?.display_name || session.user.email || ""));
      }
    });
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data } = await supabase.from("forum_posts")
      .select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false }).limit(50);
    setPosts(data || []);
    setLoading(false);
  };

  const openPost = async (post: Post) => {
    setSelectedPost(post);
    // Increment view count
    supabase.from("forum_posts").update({ view_count: (post.view_count || 0) + 1 }).eq("id", post.id).then();
    // Load comments
    const { data } = await supabase.from("forum_comments")
      .select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    setComments(data || []);
  };

  const handleNewPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPosting(true);
    await supabase.from("forum_posts").insert({
      title: newTitle.trim(),
      content: newContent.trim(),
      author_id: user.id,
      author_name: displayName,
      category: newCategory,
    });
    setNewTitle(""); setNewContent(""); setShowNewPost(false); setPosting(false);
    loadPosts();
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost) return;
    setCommentLoading(true);
    const { data } = await supabase.from("forum_comments").insert({
      post_id: selectedPost.id,
      author_id: user.id,
      author_name: displayName,
      content: commentText.trim(),
    }).select().single();
    if (data) setComments(prev => [...prev, data]);
    setCommentText("");
    setCommentLoading(false);
  };

  const filteredPosts = activeCategory === "全部" ? posts : posts.filter(p => p.category === activeCategory);

  // Post detail view
  if (selectedPost) {
    return (
      <Layout>
        <div className="relative bg-primary py-12 text-primary-foreground">
          <div className="container mx-auto px-4">
            <button onClick={() => setSelectedPost(null)} className="mb-3 flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
              <ChevronLeft className="h-4 w-4" /> 返回列表
            </button>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">{selectedPost.title}</h1>
            <div className="mt-2 flex items-center gap-3 text-sm text-primary-foreground/70">
              <span>{selectedPost.author_name}</span>
              <span>·</span>
              <span>{new Date(selectedPost.created_at).toLocaleDateString("zh-CN")}</span>
              {selectedPost.category && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{selectedPost.category}</span>}
            </div>
          </div>
        </div>
        <section className="py-8 md:py-12">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedPost.content}</div>
            </div>

            <h3 className="mt-8 mb-4 font-serif text-sm font-bold">评论 ({comments.length})</h3>
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{c.author_name}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString("zh-CN")}</span>
                  </div>
                  <p className="mt-1.5 text-sm">{c.content}</p>
                </div>
              ))}
            </div>

            {user ? (
              <form onSubmit={handleComment} className="mt-4 flex gap-2">
                <input
                  value={commentText} onChange={e => setCommentText(e.target.value)} required
                  className="flex-1 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  placeholder="写下你的评论..."
                />
                <button type="submit" disabled={commentLoading || !commentText.trim()}
                  className="flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            ) : (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                <a href="/auth" className="text-primary hover:underline">登录</a> 后可以发表评论
              </p>
            )}
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">社员论坛</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">交流文学心得，分享创作感悟</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-3xl px-4">
          {/* Categories + New Post */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <button key={c} onClick={() => setActiveCategory(c)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${activeCategory === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                  {c}
                </button>
              ))}
            </div>
            {user ? (
              <button onClick={() => setShowNewPost(!showNewPost)}
                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> 发帖
              </button>
            ) : (
              <a href="/auth" className="text-xs text-primary hover:underline">登录后可发帖</a>
            )}
          </div>

          {/* New post form */}
          {showNewPost && (
            <form onSubmit={handleNewPost} className="mb-6 space-y-3 rounded-xl border border-border bg-card p-5 shadow-sm">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} required
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="帖子标题" maxLength={100} />
              <select value={newCategory} onChange={e => setNewCategory(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                {categories.filter(c => c !== "全部").map(c => <option key={c}>{c}</option>)}
              </select>
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} required rows={5}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="帖子内容..." maxLength={5000} />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewPost(false)} className="rounded-lg px-4 py-1.5 text-xs text-muted-foreground hover:bg-secondary">取消</button>
                <button type="submit" disabled={posting} className="rounded-lg bg-primary px-4 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {posting ? "发布中..." : "发布"}
                </button>
              </div>
            </form>
          )}

          {/* Post list */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">暂无帖子</p>
          ) : (
            <div className="space-y-2">
              {filteredPosts.map(post => (
                <button key={post.id} onClick={() => openPost(post)}
                  className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition hover:border-primary/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {post.is_pinned && <Pin className="h-3 w-3 text-primary" />}
                      {post.is_locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      <span className="font-serif text-sm font-bold truncate">{post.title}</span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{post.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                      <span>{post.author_name}</span>
                      <span>{new Date(post.created_at).toLocaleDateString("zh-CN")}</span>
                      {post.category && <span className="rounded-full bg-secondary px-1.5 py-0.5">{post.category}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span>{post.view_count || 0}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Forum;
