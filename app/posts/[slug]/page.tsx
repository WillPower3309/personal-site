import { format, parseISO } from 'date-fns'
import { allPosts } from 'contentlayer/generated'

export const generateStaticParams = async () => allPosts.map((post) => ({ slug: post._raw.flattenedPath }))

export const generateMetadata = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) throw new Error(`Post not found for slug: ${params.slug}`)
  return { title: post.title }
}

const PostLayout = ({ params }: { params: { slug: string } }) => {
  const post = allPosts.find((post) => post._raw.flattenedPath === params.slug)
  if (!post) {
    // TODO: 404 page
    throw new Error(`Post not found for slug: ${params.slug}`)
  }

  return (
    <div>
      <article className="p-8 h-full w-full">
        <div className="mb-8 text-center text-white">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <time dateTime={post.date} className="mb-1 text-xs text-gray-600">
            {format(parseISO(post.date), 'LLLL d, yyyy')}
          </time>
        </div>
        <div
            className="[&>*]:text-white
                       [&>*]:mb-3
                       [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: post.body.html }}
        />
      </article>
    </div>
  )
}

export default PostLayout
