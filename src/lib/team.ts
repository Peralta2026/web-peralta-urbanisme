import fs from "fs";
import path from "path";
import type { TeamMember } from "./types";

const teamDir = path.join(process.cwd(), "content", "team");

export function getAllTeamMembers(): TeamMember[] {
  if (!fs.existsSync(teamDir)) return [];

  const files = fs.readdirSync(teamDir).filter((f) => f.endsWith(".json"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(teamDir, file), "utf-8");
      return JSON.parse(raw) as TeamMember;
    })
    .sort((a, b) => a.order - b.order);
}
