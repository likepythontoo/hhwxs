import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listNews from "./tools/list_news";
import getNews from "./tools/get_news";
import listEvents from "./tools/list_events";
import listMembers from "./tools/list_members";
import listWorks from "./tools/list_works";
import getMyProfile from "./tools/get_my_profile";
import listMySubmissions from "./tools/list_my_submissions";
import createSubmission from "./tools/create_submission";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "honghu-literary-society-mcp",
  title: "红湖文学社 MCP",
  version: "0.1.0",
  instructions:
    "红湖文学社官网的工具集。可查询新闻、活动、历届成员、公开作品；登录用户可查看个人资料、投稿记录并提交新作品。",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listNews,
    getNews,
    listEvents,
    listMembers,
    listWorks,
    getMyProfile,
    listMySubmissions,
    createSubmission,
  ],
});
