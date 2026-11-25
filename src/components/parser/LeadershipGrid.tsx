import { fetchLeadershipPage } from "../leadership/actions";
import Leaderships from "../leadership/Leaderships";

export default async function LeadershipGrid({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const { page } = (await searchParams) ?? {};
  const requestedPage = Number(page ?? 1);
  const currentPage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const leadershipData = await fetchLeadershipPage(currentPage);

  return <Leaderships pageData={leadershipData} />;
}
