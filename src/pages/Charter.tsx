import Layout from "@/components/Layout";
import { Download, BookOpen, Shield, Users, Award, Gavel, Building2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Charter = () => {
  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">社团章程</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            河北科技学院红湖文学社活动章程 · 规范管理 · 民主运行
          </p>
        </div>
      </div>

      {/* Download Bar */}
      <div className="bg-secondary py-4">
        <div className="container mx-auto flex items-center justify-center gap-3 px-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">需要完整章程文档？</span>
          <a
            href="/files/红湖文学社活动章程.doc"
            download
            className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            下载章程原文（.doc）
          </a>
        </div>
      </div>

      {/* 社团宗旨 */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-6">社团宗旨</h2>
          <div className="mx-auto max-w-3xl rounded border border-border bg-card p-6 text-center">
            <Shield className="mx-auto mb-3 h-8 w-8 text-primary" />
            <p className="leading-relaxed text-muted-foreground">
              让大学生走向文学，让文学走进大学生活。通过形式多样的活动开展，提高校园人文气氛，培养文学素养，提高文学创作与欣赏水平。丰富同学们的第二课堂，给予文学爱好者一个充分锻炼和展示自我的舞台，为创建富有活力的和谐校园奉献自己的力量。
            </p>
          </div>
        </div>
      </section>

      {/* 管理细则 - Accordion */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">社团管理细则</h2>
          <div className="mx-auto max-w-3xl">
            <Accordion type="multiple" className="space-y-3">
              {/* 社规 */}
              <AccordionItem value="rules" className="rounded border border-border bg-card px-5">
                <AccordionTrigger className="font-serif font-semibold">
                  <span className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-primary" />
                    （一）社规
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li><strong>第一条</strong>　社员要处处维护"红湖文学社"的名誉。</li>
                    <li><strong>第二条</strong>　品行端正，作风正派，努力学习，遵守校纪校规，维护学校的形象。</li>
                    <li><strong>第三条</strong>　密切关注并严格遵守文学社的活动时间，积极参加各项活动。</li>
                    <li><strong>第四条</strong>　自觉遵守文学社纪律，服从工作安排，认真、按时完成相应的任务。</li>
                    <li><strong>第五条</strong>　社员应心怀社团，密切关注红湖文学社的发展建设，积极对社团相关工作建言献策。</li>
                    <li><strong>第六条</strong>　有组织有计划、有目标的完成各项工作，要有时间观念，办事不拖、不惰、不虚、不浮。</li>
                    <li><strong>第七条</strong>　社员都应尊重和团结其他社员，维护社团的团结友爱，以促进彼此的共同进步。</li>
                    <li><strong>第八条</strong>　社员投稿不准抄袭，一经发现即作退社处理。</li>
                    <li><strong>第九条</strong>　社员可以推荐他人加入社团，不得在文学社以外使用社团名义参加一切不适合的活动。</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* 社员权利 */}
              <AccordionItem value="rights" className="rounded border border-border bg-card px-5">
                <AccordionTrigger className="font-serif font-semibold">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    （二）社员权利
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li><strong>第一条</strong>　享有选举与被选举权。</li>
                    <li><strong>第二条</strong>　享有接受指导及参加本社的一切活动，对本社的工作提出建议和批评的权利。</li>
                    <li><strong>第三条</strong>　有权对社团干部工作进行监督，提出建议。</li>
                    <li><strong>第四条</strong>　社员有参加社团会议、活动和讨论的权利。</li>
                    <li><strong>第五条</strong>　社员对于本社发表的一切作品享有批评和被批评的权利。</li>
                    <li><strong>第六条</strong>　社员优秀作品在同等条件下优先推荐校内外报刊杂志。</li>
                    <li><strong>第七条</strong>　文学社给予优秀社员一定的奖励和获奖证明。</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* 社员义务 */}
              <AccordionItem value="duties" className="rounded border border-border bg-card px-5">
                <AccordionTrigger className="font-serif font-semibold">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    （三）社员义务
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li><strong>第一条</strong>　有努力学习、遵守校纪校规、维护学校形象的义务。</li>
                    <li><strong>第二条</strong>　有自觉遵守文学社纪律，严格执行文学社决议，热心本职工作，努力完成文学社交派的义务。</li>
                    <li><strong>第三条</strong>　有宣传文学社、维护文学社形象的义务。</li>
                    <li><strong>第四条</strong>　有推荐文学爱好者加入文学社的义务。</li>
                    <li><strong>第五条</strong>　有按期向文学社交递个人作品、推荐社外学生优秀作品的义务。</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* 奖惩制度 */}
              <AccordionItem value="rewards" className="rounded border border-border bg-card px-5">
                <AccordionTrigger className="font-serif font-semibold">
                  <span className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-primary" />
                    （四）奖惩制度
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="list-inside space-y-2 text-sm leading-relaxed text-muted-foreground">
                    <li><strong>第一条</strong>　能积极参加社内组织的活动，遵守社内的章程，履行社员的义务，在社员中起带头作用的，并在量化评比中高分者，可评为"最佳文学社社员"。</li>
                    <li><strong>第二条</strong>　社团开会活动迟到早退，开展活动不认真，违反社内章程有关规定情节轻者，给予社内警告处分。</li>
                    <li><strong>第三条</strong>　无故不参加或社员大会累计三次，无故欠交稿件累计三次者，文学社将责令其退社。</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              {/* 社团变更与经费 */}
              <AccordionItem value="misc" className="rounded border border-border bg-card px-5">
                <AccordionTrigger className="font-serif font-semibold">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    （五~六）社团变更与经费
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p><strong>（五）社团变更程序：</strong>填写社团变更程序申请表。</p>
                    <p><strong>（六）社团经费来源：</strong>社员缴纳社费和外联。</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* 组织设置 */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">组织设置与负责人职权</h2>
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded border border-border bg-card p-6">
              <h3 className="mb-3 font-serif text-base font-bold">基本原则</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li>本社是按照平等、自由、民主的原则组织起来的统一整体。</li>
                <li>本社设社长、副社长、组织部、话剧部、编辑部、国学部、网宣部。</li>
                <li>负责人包括社长一名、副社长两名和各部门部长若干名。</li>
              </ul>
            </div>

            <div className="rounded border border-border bg-card p-6">
              <h3 className="mb-3 font-serif text-base font-bold">负责人任命</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                <li>本社采用社长负责制，由本社全体成员会议产生社长和副社长，再由社长、副社长在上任一月内选定各部门负责人名单并提交全体成员会议表决。</li>
                <li>前任推荐人选，经部门负责人会议提交全体成员会议表决通过（到会者应在半数以上且2/3成员赞成），任期为一年。</li>
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded border border-border bg-card p-5">
                <h4 className="mb-2 font-serif text-sm font-bold text-primary">社长职权</h4>
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                  <li>负责文学社全面工作正常开展</li>
                  <li>制定文学社新学期工作计划</li>
                  <li>主持召开全体成员会议</li>
                  <li>有权撤换不称职的部门负责人</li>
                  <li>有权开除违反文学社章程的成员</li>
                </ul>
              </div>
              <div className="rounded border border-border bg-card p-5">
                <h4 className="mb-2 font-serif text-sm font-bold text-primary">副社长职权</h4>
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
                  <li>协助社长做好各方面工作</li>
                  <li>特殊情况下代行社长职权</li>
                  <li>重点抓好分管部门工作</li>
                </ul>
              </div>
            </div>

            <div className="rounded border border-border bg-card p-6">
              <h4 className="mb-3 font-serif text-sm font-bold text-primary">各部门职权</h4>
              <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
                <li><strong>组织部：</strong>保管文学社文件，做好会议记录，整理现成员和离退成员详细资料。</li>
                <li><strong>话剧部：</strong>写话剧、排话剧，办好有意义的话剧专场。</li>
                <li><strong>编辑部：</strong>负责本社稿源的去向及刊物的出版工作。</li>
                <li><strong>国学部：</strong>组织相关活动，必须按期组织。</li>
                <li><strong>网宣部：</strong>为社团各方面做好宣传，管理微信公众号发布文章。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 会议制度 */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">会议制度</h2>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "全体会议", desc: "每周一次，社长副社长作全社工作报告，各部门负责人作部门工作报告。" },
              { title: "部长会议", desc: "每周召开一次，由副社长召集，各部门作工作报告并做统筹安排。" },
              { title: "单部会议", desc: "各部门轮流召开，每月三次，做好专业化学习和交流工作。" },
              { title: "单部自主会议", desc: "各部门负责人可根据需要自行召集本部门会议，完成部门任务。" },
              { title: "临时会议", desc: "为解决临时出现的问题，可临时召开各类会议。" },
              { title: "会议纪律", desc: "成员在会议上必须遵守基本纪律，不得扰乱会场秩序，不得打断他人发言。" },
            ].map((item) => (
              <div key={item.title} className="rounded border border-border bg-card p-5 transition-shadow hover:shadow-md">
                <h4 className="mb-2 font-serif text-sm font-bold">{item.title}</h4>
                <p className="text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 工作原则 */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-6">工作原则</h2>
          <div className="mx-auto max-w-3xl rounded border border-border bg-card p-6">
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              文学社工作原则实行部门负责人集体领导下的个人分工负责制。
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>领导集体作出决定之前要充分发扬民主，广泛听取社员意见，注意决策的科学性。</li>
              <li>领导集体作出的决定每位成员必须无条件执行，如有不同意见可提请复议。</li>
              <li>各负责人在处理突发事件时应及时向社长报告，召集集体讨论。严禁借集体名义自作主张。</li>
              <li>各负责人需经常沟通情况，交流信息，统一思想，依靠集体力量开展工作。</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Charter;
