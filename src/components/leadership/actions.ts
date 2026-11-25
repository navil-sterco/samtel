"use server";

import { apiFetch } from "@/lib/api";
import type { LeadershipResponse } from "./Leaderships";

export async function fetchLeadershipPage(
  page: number,
): Promise<LeadershipResponse> {
  if (!Number.isSafeInteger(page) || page < 1) {
    throw new Error("Invalid leadership page");
  }

  const { data, error } = await apiFetch(`leadership?page=${page}`);
  if (error || !data) {
    throw new Error(`Failed to fetch leadership: ${error ?? "No data returned"}`);
  }

  return data as LeadershipResponse;
}
