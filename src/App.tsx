import * as React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import GlobalStyle from './styles/Global';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Post from './components/Post';
import Books from './pages/Books';
import Contact from './pages/Contact';
import About from './pages/About';
import NoMatch from './pages/NoMatch';

function App() {
    return(
        <div>
            <Router>
                <Navbar />
                <Switch>
                    <Route exact path='/' component={Home} />
                    <Route exact path='/blog' component={Blog} />
                    <Route path='/blog/:slug' component={Post} />
                    <Route exact path='/books' component={Books} />
                    <Route exact path='/contact' component={Contact} />
                    <Route exact path='/about' component={About} />
                    <Route component={NoMatch} />
                </Switch>
                <GlobalStyle />
            </Router>
        </div>
    );
}

export default App;
