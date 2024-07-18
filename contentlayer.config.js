import { defineDocumentType, makeSource } from 'contentlayer/source-files'
import rehypeExternalLinks from 'rehype-external-links'

export const Post = defineDocumentType(() => ({
    name: 'Post',
    filePathPattern: '**/*.md',
    fields: {
        title: { type: 'string', required: true },
        date: { type: 'date', required: true },
    },
    computedFields: {
        url: { type: 'string', resolve: (post) => `/posts/${post._raw.flattenedPath}` },
    },
}))

export default makeSource({
    contentDirPath: 'posts', documentTypes: [Post],
    markdown: { rehypePlugins: [
        [ rehypeExternalLinks, { target: "_blank" } ],
    ]},
})

