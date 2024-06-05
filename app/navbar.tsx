import Link from 'next/link'
import { compareDesc, format, parseISO } from 'date-fns'
import { allPosts, Post } from 'contentlayer/generated'

function PostCard(post: Post) {
  return (
    <div className="mb-8">
      <h3 className="mb-1 text-l">
        <Link href={post.url} className="text-blue-700 hover:text-blue-800 dark:text-blue-400">
          {post.title}
        </Link>
      </h3>
    </div>
  )
}

export default function Navbar() {
  const posts = allPosts.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))

  return (
    <div className="p-4 bg-white bg-opacity-10">
      <h1 className="mb-8 text-center text-xl font-black">Will McKinnon's Blog</h1>
      <h2 className="mb-8 text-l font-black">Posts</h2>
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  )
}
