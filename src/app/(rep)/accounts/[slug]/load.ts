import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getAccountDetail, type AccountDetail } from "@/db/queries";

/** Shared by every account tab: request-time load, 404 if the slug doesn't exist. */
export async function loadAccount(params: Promise<{ slug: string }>): Promise<AccountDetail> {
  await connection();
  const { slug } = await params;
  const detail = await getAccountDetail(slug);
  if (!detail) notFound();
  return detail;
}
