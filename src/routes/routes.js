

const routes = [
  // 처음 페이지 접속시 로딩되는 페이지
  { path: "/", redirect: "/calendar" },
  // 로그인 페이지
  {
    path: "/calendar",
    name: "CalendarView",
    component: () => import("@/components/CalendarMonth.vue"),
    props: true,
  },
  {
    path: "/daily",
    name: "DailyView",
    component: () => import("@/components/CalendarDaily.vue"),
    props: true,
  },
  { path: "/:pathMatch(.*)*", redirect: "/calendar" },
];

export default routes;
