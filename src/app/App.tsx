/** 
 * This is the main entry point of your React application. 
 * The React application is a React component like any other react components. 
 */
import * as React from 'react';
import { Home } from './pages/home/Home';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Header } from './shared-components/header/Header';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import { services } from './services/services';

export class App extends React.PureComponent {

  async componentDidMount() {

    const doesPagesTableExist = await services.pagesService.tableExists();
    const doesSetionsTableExist = await services.sectionsService.tableExists();
    const doesNotificationsTableExist = await services.notificationService.tableExists();

    if (doesPagesTableExist == false) {
      await services.pagesService.createTable();
    }

    if (doesSetionsTableExist == false) {
      await services.sectionsService.createTable();
    }

    if (doesNotificationsTableExist == false) {
      await services.notificationService.createTable();
    }
  }

  render() {
    return <React.Fragment>
      <Header />
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      </Router>
    </React.Fragment>
  }
}