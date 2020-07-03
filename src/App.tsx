import * as React from 'react';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import Navbar from './Navbar';
import Home from './Home';
import Blog from './Blog';
import NoMatch from './NoMatch';

function App() {
    return(
        <Router>
            <Navbar />
            <Switch>
                <Route exact path='/' component={Home} />
                <Route exact path='/blog' component={Blog} />
                <Route component={NoMatch} />
            </Switch>
        </Router>
    );
}

export default App;
