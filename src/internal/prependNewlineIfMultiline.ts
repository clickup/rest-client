export default function prependNewlineIfMultiline(str: string) {
  return str.trim().includes("\n") ? "\n" + str : str;
}
