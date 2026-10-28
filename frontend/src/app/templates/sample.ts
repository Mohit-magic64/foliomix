import type { Portfolio } from "@/lib/portfolio"

export const SAMPLE_PORTFOLIO: Portfolio = {
  name: "Aarav Sharma",
  headline: "Full-stack developer building tools people enjoy using",
  about:
    "I'm a computer science student who loves turning rough ideas into polished products. I care about clean interfaces, fast apps and code that's easy to read.",
  location: "Indore, India",
  links: {
    email: "aarav@example.com",
    github: "https://github.com/aarav",
    linkedin: "https://linkedin.com/in/aarav",
    website: "https://aarav.dev",
  },
  skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS"],
  projects: [
    {
      title: "StudySync",
      description: "A shared study planner that syncs timetables and deadlines across a class group.",
      url: "https://studysync.example.com",
      repoUrl: "https://github.com/aarav/studysync",
      tech: ["Next.js", "Supabase", "Tailwind"],
    },
    {
      title: "Campus Eats",
      description: "Real-time menu and wait-time tracker for campus canteens.",
      repoUrl: "https://github.com/aarav/campus-eats",
      tech: ["React", "Node.js", "Socket.io"],
    },
  ],
  experience: [
    {
      company: "Acme Labs",
      role: "Frontend Intern",
      start: "2025",
      end: "2025",
      summary: "Rebuilt the onboarding flow in React, cutting drop-off by a third.",
    },
  ],
  education: [{ school: "Indian Institute of Technology Indore", degree: "B.Tech, Computer Science", year: "2028" }],
}