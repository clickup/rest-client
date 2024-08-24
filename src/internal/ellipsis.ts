const ELLIPSIS = "…";

/**
 * The fastest possible version of truncation. Lodash'es truncate() messes up
 * with unicode a lot, so for e.g. logging purposes, it's super-slow.
 */
export default function ellipsis(string: any, length: number) {
  string = ("" + string).trimEnd();
  length = Math.max(length, ELLIPSIS.length);

  if (string.length <= length) {
    return string;
  }

  return string.substring(0, length - ELLIPSIS.length) + ELLIPSIS;
}
