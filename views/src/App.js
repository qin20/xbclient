import React from 'react'
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
import { Layout } from './components';
import Cut from './pages/Cut';
import Dashboard from './pages/Dashboard';
import ProjectAdd from './pages/ProjectAdd';
import ProjectEdit from './pages/ProjectEdit';
import Bg from './pages/Bg';
import Dy from './pages/Dy';
import PosterClip from './pages/PosterClip';

export default class App extends React.Component {
    render() {
        return (
            <Router>
                <Layout>
                    <Layout.Sider />
                    <Layout id="app-main" style={{ marginLeft: 200 }}>
                        <Switch>
                            <Redirect from="/" to="/projects" exact strict></Redirect>

                            <Route path="/projects" exact component={Dashboard} />
                            <Route path="/projects/add" component={ProjectAdd} />
                            <Route path="/projects/edit/:id" exact component={ProjectEdit} />
                            <Route path="/projects/:id" exact component={Cut} />

                            <Route path="/dy" exact component={Dy} />
                            <Route path="/poster-clip" exact component={PosterClip} />
                            <Route path="/project/:project/bg" exact component={Bg} />
                        </Switch>
                    </Layout>
                </Layout>
            </Router>
        );
    }
};
