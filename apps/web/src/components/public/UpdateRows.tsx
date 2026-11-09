import type { UpdatePost } from "@/lib/update-posts";
export default function UpdateRows({ posts }: { posts: UpdatePost[] }) {
  return (
    <div className="updates-list">
      {posts.map((post) => (
        <a className="updates-row" href={`/updates/${post.id}`} key={post.id}>
          <time dateTime={post.date}>{post.date}</time>
          <div>
            <span className="updates-meta">{post.status}</span>
            <h3>{post.title}</h3>
          </div>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}
