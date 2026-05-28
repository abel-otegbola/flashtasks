import BlurReveal from "../../../components/animations/blurReveal";
import Animate from "../../../components/animations/animate";

const blogPosts = [
  {
    title: "How to keep a task system simple as your team grows",
    excerpt: "A practical guide for reducing clutter while keeping momentum high.",
    tag: "Productivity",
    readTime: "5 min read",
  },
  {
    title: "Why automation works best when it stays invisible",
    excerpt: "The best automation is the one that removes friction without adding new decisions.",
    tag: "Automation",
    readTime: "4 min read",
  },
  {
    title: "A better way to manage follow-ups across multiple tools",
    excerpt: "Bring messages, tasks, and reminders together so nothing falls through the cracks.",
    tag: "Integrations",
    readTime: "6 min read",
  },
];

function BlogPage() {
  return (
    <main className="dark:bg-dark-bg dark:text-gray-100 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <BlurReveal preset="slide-up"><h1 className="text-[clamp(2.8rem,7vw,5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">Blog</h1></BlurReveal>
          <BlurReveal preset="slide-up"><p className="mt-4 text-gray-500 dark:text-gray-300">Short reads on productivity, automation, and team workflows.</p></BlurReveal>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {blogPosts.map((post, index) => (
            <Animate key={post.title} preset="zoomIn" duration={2} delay={index * 0.1} className="rounded-2xl border border-gray-500/20 bg-white p-6 dark:bg-dark/[0.4]">
              <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <span>{post.tag}</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{post.title}</h2>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-300">{post.excerpt}</p>
            </Animate>
          ))}
        </div>
      </div>
    </main>
  );
}

export default BlogPage;