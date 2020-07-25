import * as React from 'react';
import { Link } from 'react-router-dom';

import { getFirebase } from '../firebase';

const Blog = () => {
    const [loading, setLoading] = React.useState(true);
    const [blogPosts, setBlogPosts] = React.useState([]);

    if (loading && !blogPosts.length) {
        getFirebase()
            .database()
            .ref('/posts')
            .orderByChild('date')
            .once('value')
            .then(snapshot => {
                let posts = [];
                const snapshotVal = snapshot.val();
                for (let slug in snapshotVal) {
                    posts.push(snapshotVal[slug]);
                }

                const newestFirst = posts.reverse();
                setBlogPosts(newestFirst);
                setLoading(false);
            });
    }

    if (loading) {
        return <div></div>;
    }

    return (
        <div>
            <h1>Blog posts</h1>
            {blogPosts.map(blogPost => (
                <section key={blogPost.slug} className='card'>
                    <img src={blogPost.coverImage} alt={blogPost.coverImageAlt} />
                    <div className='card-content'>
                        <h2>
                            {blogPost.title} &mdash;{' '}
                            <span style={{ color: '#5e5e5e' }}>{blogPost.datePretty}</span>
                        </h2>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: `${blogPost.content.substring(0, 200)}...`
                            }}
                        ></p>
                        <Link to={`/blog/${blogPost.slug}`}>Continue reading...</Link>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Blog;
