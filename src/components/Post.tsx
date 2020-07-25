import * as React from 'react';
import { Redirect } from 'react-router-dom';

import { getFirebase } from '../firebase';

const Post = ({ match }) => {
    const slug = match.params.slug;

    const [loading, setLoading] = React.useState(true);
    const [currentPost, setCurrentPost] = React.useState({
        coverImage: null,
        coverImageAlt: null,
        title: null,
        date: null,
        slug: null,
        content: null
    });

    if (loading && !currentPost.title) {
        getFirebase()
            .database()
            .ref()
            .child(`/posts/${slug}`)
            .once('value')
            .then(snapshot => {
                if (snapshot.val()) {
                    setCurrentPost(snapshot.val());
                }
                setLoading(false);
            });
    }

    const postDoesNotExist = !currentPost.title;

    if (loading) {
        return <div></div>;
    }

    if (postDoesNotExist) {
        return <Redirect to='/404' />;
    }

    return (
        <div>
            <img src={currentPost.coverImage} alt={currentPost.coverImageAlt} />
            <h1>{currentPost.title}</h1>
            <em>{currentPost.date}</em>
            <p dangerouslySetInnerHTML={{ __html: currentPost.content }}></p>
        </div>
    );
};

export default Post;
