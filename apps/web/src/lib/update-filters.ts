import type { UpdatePost } from "./update-posts";
export type UpdateFilters = {
  text: string;
  topic: string;
  type: string;
  from: string;
  to: string;
};
export const emptyUpdateFilters: UpdateFilters = {
  text: "",
  topic: "all",
  type: "all",
  from: "",
  to: "",
};
export function filterUpdates(posts: UpdatePost[], filters: UpdateFilters) {
  const query = filters.text.trim().toLocaleLowerCase();
  return posts
    .filter(
      (post) =>
        (!query ||
          [post.title, post.summary, post.detail, post.status]
            .join(" ")
            .toLocaleLowerCase()
            .includes(query)) &&
        (filters.topic === "all" || post.topic === filters.topic) &&
        (filters.type === "all" || post.updateType === filters.type) &&
        (!filters.from || post.date >= filters.from) &&
        (!filters.to || post.date <= filters.to),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
