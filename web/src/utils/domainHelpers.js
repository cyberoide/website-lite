export function normalizeDomainInput(value) {
  if (typeof value !== "string") return "";
  let v = value.trim();
  if (!v) return "";

  v = v.replace(/^https?:\/\//i, "");
  v = v.split("/")[0];
  v = v.toLowerCase();

  if (v.startsWith("www.")) {
    v = v.slice(4);
  }

  return v;
}
