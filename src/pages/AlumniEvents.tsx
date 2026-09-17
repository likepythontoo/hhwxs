import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import AlumniGatherings from "@/components/members/AlumniGatherings";
import AlumniLookupBoard from "@/components/members/AlumniLookupBoard";
import MemberMessageBoard from "@/components/members/MemberMessageBoard";

const AlumniEvents = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Layout>
      <div className="relative overflow-hidden bg-[hsl(var(--archive-charcoal))] py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="container relative mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-serif text-3xl font-bold tracking-[0.2em] text-[hsl(var(--archive-cream))] md:text-4xl"
          >
            校友互动 · 聚会与寻人
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 font-serif text-sm italic text-[hsl(var(--archive-cream))]"
          >
            "文字散落各地，人也终会重逢"
          </motion.p>
        </div>
      </div>

      <AlumniGatherings currentUserId={userId} />
      <AlumniLookupBoard currentUserId={userId} />

      <section className="bg-[hsl(var(--archive-cream))]/40 py-12">
        <div className="container mx-auto max-w-3xl px-4">
          <MemberMessageBoard currentUserId={userId} title="校友公共留言板" />
        </div>
      </section>
    </Layout>
  );
};

export default AlumniEvents;
