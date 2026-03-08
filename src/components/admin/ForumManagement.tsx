import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Pin, Lock, Trash2, Plus, ArrowLeft, Send } from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  category: string | null;
  is_pinned: boolean | null;
  is_locked: boolean | null;
  view_count: number | null;
  created_at: string;
  comment_count?: number;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  created_at: string;
}

const ForumManagement = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewingPost, setViewingPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const { data: postsData } = await supabase.from("forum_posts").select("*").order("is_pinned", { ascending: false }).order("created_at", { ascending: false });
    if (postsData) {
      // Get comment counts
      const postIds = postsData.map(p => p.id);
      const { data: commentsData } = await supabase.from("forum_comments").select("post_id");
      const countMap = new Map<string, number>();
      commentsData?.forEach(c => countMap.set(c.post_id, (countMap.get(c.post_id) || 0) + 1));
      setPosts(postsData.map(p => ({ ...p, comment_count: countMap.get(p.id) || 0 })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const fetchComments = async (postId: string) => {
    const { data } = await supabase.from("forum_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    setComments((data as Comment[]) || []);
  };

  const viewPost = async (post: Post) => {
    setViewingPost(post);
    fetchComments(post.id);
  };

  const togglePin = async (post: Post) => {
    await supabase.from("forum_posts").update({ is_pinned: !post.is_pinned }).eq("id", post.id);
    fetchPosts();
  };

  const toggleLock = async (post: Post) => {
    await supabase.from("forum_posts").update({ is_locked: !post.is_locked }).eq("id", post.id);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    if (!confirm("确定删除此帖子及其所有评论？")) return;
    await supabase.from("forum_posts").delete().eq("id", id);
    fetchPosts();
    if (viewingPost?.id === id) setViewingPost(null);
  };

  const deleteComment = async (id: string) => {
    if (!confirm("确定删除此评论？")) return;
    await supabase.from("forum_comments").delete().eq("id", id);
    if (viewingPost) fetchComments(viewingPost.id);
  };

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  if (viewingPost) {
    return (
      <div>
        <div className="mb-5 flex items-center gap-3">
          <button onClick={() => setViewingPost(null)} className="rounded-lg p-2 transition hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold">{viewingPost.title}</h2>
              {viewingPost.is_pinned && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">📌 置顶</span>}
              {viewingPost.is_locked && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">🔒 已锁</span>}
            </div>
            <p className="text-xs text-muted-foreground">{viewingPost.author_name} · {new Date(viewingPost.created_at).toLocaleString("zh-CN")}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{viewingPost.content}</div>
        </div>

        <h3 className="mt-6 mb-3 font-serif text-sm font-bold">评论 ({comments.length})</h3>
        <div className="space-y-2">
          {comments.map(c => (
            <div key={c.id} className="group flex items-start justify-between rounded-lg border border-border bg-card px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString("zh-CN")}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.content}</p>
              </div>
              <button onClick={() => deleteComment(c.id)} className="rounded p-1.5 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {comments.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">暂无评论</p>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-base font-bold">论坛管理 ({posts.length} 帖)</h2>
      </div>

      <div className="space-y-3">
        {posts.map(post => (
          <div key={post.id} className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => viewPost(post)}>
                <div className="flex items-center gap-2">
                  {post.is_pinned && <span className="text-xs">📌</span>}
                  {post.is_locked && <span className="text-xs">🔒</span>}
                  <h3 className="text-sm font-bold">{post.title}</h3>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{post.category}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.author_name} · {new Date(post.created_at).toLocaleDateString("zh-CN")}
                  <span className="ml-2">💬 {post.comment_count}</span>
                  <span className="ml-2">👁 {post.view_count || 0}</span>
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground/70">{post.content}</p>
              </div>
              <div className="ml-3 flex gap-1 opacity-60 group-hover:opacity-100">
                <button onClick={() => togglePin(post)} className="rounded-lg p-2 transition hover:bg-secondary" title={post.is_pinned ? "取消置顶" : "置顶"}>
                  <Pin className={`h-3.5 w-3.5 ${post.is_pinned ? "text-primary" : ""}`} />
                </button>
                <button onClick={() => toggleLock(post)} className="rounded-lg p-2 transition hover:bg-secondary" title={post.is_locked ? "解锁" : "锁帖"}>
                  <Lock className={`h-3.5 w-3.5 ${post.is_locked ? "text-amber-600" : ""}`} />
                </button>
                <button onClick={() => deletePost(post.id)} className="rounded-lg p-2 text-destructive/60 transition hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm text-muted-foreground">暂无论坛帖子</p>
            <p className="mt-1 text-xs text-muted-foreground">社员可以在论坛页面发帖交流</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumManagement;
