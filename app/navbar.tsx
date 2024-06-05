import Link from 'next/link'
import { compareDesc, format, parseISO } from 'date-fns'
import { allPosts, Post } from 'contentlayer/generated'

function PostCard(post: Post) {
  return (
    <div className="mb-8">
      <h3 className="mb-1 text-l text-white">
        <Link href={post.url} className="">
          {post.title}
        </Link>
      </h3>
    </div>
  )
}

export default function Navbar() {
  const posts = allPosts.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))

  return (
    <div className="p-4">
      <Link href="/" className="flex text-center text-2xl text-white m-2">
        <h1>Will</h1><h1 className="font-black">McKinnon</h1>
      </Link>
      <hr className="h-1 bg-gray-700 border-0 rounded md:my-4" />
      <h2 className="mt-16 mb-8 text-l font-black text-gray-400">POSTS</h2>
      {posts.map((post, idx) => (
        <PostCard key={idx} {...post} />
      ))}
    </div>
  )
}
