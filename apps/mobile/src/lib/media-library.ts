import { Asset, AssetField, MediaType, Query } from "expo-media-library";

export async function getRecentImages(count = 50): Promise<Asset[]> {
  return new Query()
    .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
    .orderBy({ key: AssetField.CREATION_TIME, ascending: false })
    .limit(count)
    .exe();
}

/** Alias for getRecentImages */
export const getRecent = getRecentImages;

export async function getImagesInRange(
  startMs: number,
  endMs: number
): Promise<Asset[]> {
  return new Query()
    .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
    .gte(AssetField.CREATION_TIME, startMs)
    .lt(AssetField.CREATION_TIME, endMs)
    .orderBy(AssetField.CREATION_TIME)
    .exe();
}

export type MonthParam =
  | "jan"
  | "feb"
  | "mar"
  | "apr"
  | "may"
  | "jun"
  | "jul"
  | "aug"
  | "sep"
  | "oct"
  | "nov"
  | "dec";

const MONTH_MAP: Record<MonthParam, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

export async function getImagesForMonth(
  year: number,
  month: string
): Promise<Asset[]> {
  if (!month) throw new Error("Month is required");
  const normalized = month.toLowerCase().slice(0, 3) as MonthParam;
  const monthIndex = MONTH_MAP[normalized];
  if (monthIndex === undefined) {
    throw new Error(
      `Invalid month "${month}". Expected one of: jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec`
    );
  }
  const start = Date.UTC(year, monthIndex, 1);
  const end = Date.UTC(year, monthIndex + 1, 1);
  return getImagesInRange(start, end);
}

function fisherYates<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j]!;
    result[j] = temp!;
  }
  return result;
}

async function getAllImageIds(): Promise<string[]> {
  const metadata = await new Query()
    .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
    .exeForMetadata();
  return metadata.map((item) => item.id);
}

export class RandomImageQueue {
  private remaining: string[] = [];
  total = 0;

  async init(limit: number): Promise<void> {
    this.remaining = fisherYates(await getAllImageIds()).slice(0, limit);
    this.total = this.remaining.length;
  }

  take(count: number): Asset[] {
    return this.remaining.splice(0, count).map((id) => new Asset(id));
  }

  get exhausted(): boolean {
    return this.remaining.length === 0;
  }
}

export async function hasImagesForMonth(
  year: number,
  month: string
): Promise<boolean> {
  if (!month) return false;
  const normalized = month.toLowerCase().slice(0, 3) as MonthParam;
  const monthIndex = MONTH_MAP[normalized];
  if (monthIndex === undefined) return false;
  const start = Date.UTC(year, monthIndex, 1);
  const end = Date.UTC(year, monthIndex + 1, 1);
  const results = await new Query()
    .eq(AssetField.MEDIA_TYPE, MediaType.IMAGE)
    .gte(AssetField.CREATION_TIME, start)
    .lt(AssetField.CREATION_TIME, end)
    .limit(1)
    .exe();
  return results.length > 0;
}
