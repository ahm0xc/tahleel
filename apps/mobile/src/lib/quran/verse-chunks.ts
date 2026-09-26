export const MAX_LINES_PER_CHUNK = 4;

/**
 * Identifies the current chunking behaviour, so callers that memoise splits can
 * drop the ones an earlier version produced. Bump it whenever the cuts below
 * change: the memo outlives the module that fills it, so a stale split would
 * otherwise keep being served for verses already seen.
 */
export const CHUNKING_VERSION = 2;

export interface MeasuredLine {
  text: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Splits a verse into chunks of at most `maxLines` rendered lines.
 *
 * `lines` are the line boxes React Native reported for the *full* verse text at
 * the same width and font used for rendering, so every cut lands on a real line
 * break. Each cut is then pulled back to the nearest word boundary, which keeps
 * a chunk within its line budget instead of spilling onto a fifth line, and
 * never splits a word across two chunks.
 *
 * A trailing chunk of a single line is merged into the one before it, so the
 * budget is a soft ceiling rather than a guarantee: a stub line is not worth a
 * page of its own.
 *
 * Falls back to a single unsplit chunk whenever the text is short or the
 * reported lines cannot be reconciled with the source, so callers can treat
 * "one chunk" and "not chunked" as the same case.
 */
export function chunkVerseText(
  text: string,
  lines: MeasuredLine[],
  maxLines: number = MAX_LINES_PER_CHUNK
): string[] {
  const renderedLines = lines.filter((line) => line.text.trim().length > 0);

  if (maxLines < 1 || renderedLines.length <= maxLines) {
    return [text];
  }

  const boundaries = resolveLineEnds(text, renderedLines);

  if (boundaries === null) {
    return [text];
  }

  const chunks: string[] = [];
  // Where each chunk starts, in the source text and in rendered lines, so the
  // final chunk can be folded back into the one before it.
  const origins: { offset: number; line: number }[] = [];
  let start = 0;
  let startLine = 0;

  while (startLine < boundaries.length) {
    // A chunk may begin mid-line, because the previous chunk's cut was pulled
    // back from the end of its last line. Budget from the line the chunk
    // actually starts on, otherwise the carried-over remainder is free and the
    // chunk spills onto a fifth line.
    const lastLine = Math.min(startLine + maxLines - 1, boundaries.length - 1);
    const cut = Math.max(
      findWordBoundary(text, start, boundaries[lastLine]),
      start + 1
    );
    const body = text.slice(start, cut).trim();

    if (body.length > 0) {
      origins.push({ offset: start, line: startLine });
      chunks.push(body);
    }

    const nextLine = lineIndexAt(boundaries, cut);

    if (nextLine <= startLine) {
      // The cut never reached the next line, so the rest of the text still
      // belongs to the chunk just pushed. Leave `start` where it is: the tail
      // below then extends that chunk instead of repeating it.
      break;
    }

    start = cut;
    startLine = nextLine;
  }

  if (chunks.length > 0 && start <= origins[chunks.length - 1].offset) {
    // The loop stopped early, so the tail is not a chunk of its own.
    chunks[chunks.length - 1] = text
      .slice(origins[chunks.length - 1].offset)
      .trim();
  } else {
    const tail = text.slice(start).trim();

    if (tail.length > 0) {
      origins.push({ offset: start, line: startLine });
      chunks.push(tail);
    }
  }

  if (chunks.length === 0) {
    return [text];
  }

  const last = chunks.length - 1;
  // Line boxes the final chunk covers. Text sitting past the last reported box
  // wraps onto a line of its own once re-rendered, hence the floor of one.
  const lastLines = Math.max(1, boundaries.length - origins[last].line);

  // A final chunk of a single line is a stub that would cost a whole page, so
  // fold it back into the chunk before it. Re-slice from that chunk's own start
  // rather than joining the two strings, so the source spacing between them
  // survives untouched.
  if (last > 0 && lastLines === 1) {
    chunks[last - 1] = text.slice(origins[last - 1].offset).trim();
    chunks.pop();
  }

  return chunks.length > 0 ? chunks : [text];
}

/** Index of the line box that contains `offset`. */
function lineIndexAt(boundaries: number[], offset: number) {
  let index = 0;

  while (index < boundaries.length && boundaries[index] <= offset) {
    index += 1;
  }

  return index;
}

/**
 * Maps each rendered line back to its exclusive end offset in the source text.
 *
 * Returns `null` when the reported lines cannot be reconciled with the source
 * (bidi reordering, ligatures, or a stale measurement), so callers can fall
 * back to showing the verse unsplit rather than corrupting it.
 */
function resolveLineEnds(text: string, lines: MeasuredLine[]): number[] | null {
  const ends: number[] = [];
  let cursor = 0;

  for (const line of lines) {
    // Platforms report line text with ragged trailing whitespace, and a chunk
    // that cuts *after* a space would otherwise swallow the next word.
    const fragment = line.text.trim();
    const start = text.indexOf(fragment, cursor);

    if (start === -1) {
      return null;
    }

    const end = start + fragment.length;

    if (end <= cursor) {
      return null;
    }

    cursor = end;
    ends.push(end);
  }

  return ends[ends.length - 1] > text.length ? null : ends;
}

/**
 * Largest cut in `(start, end]` that leaves the chunk ending on a complete word,
 * so the next chunk resumes on one too.
 *
 * A cut is valid when the character it lands on is whitespace, or when it is the
 * end of the text and nothing follows. Pulling the cut back is what keeps a
 * chunk inside its line budget; extending it forward would push the overflow
 * onto an extra line.
 */
function findWordBoundary(text: string, start: number, end: number) {
  const limit = Math.min(end, text.length);

  for (let cut = limit; cut > start; cut -= 1) {
    const next = text[cut];

    if (next === undefined || /\s/.test(next)) {
      return cut;
    }
  }

  return limit;
}
