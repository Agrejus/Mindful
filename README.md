# Getting Started
Before you start, make sure you have NodeJS installed on your PC.

Next, install the npm packages by doing the following:
1. Navigate to the project folder in the console.
2. Execute the following command: `npm install`
3. Start the App by executing the following command: `npm start`

# Understanding the App Structure
The app is layed out much like an asp.net MVC application.  Please check out the structure below:
- Pages => src/app/pages/(your page)
    - Example: src/app/pages/home
- Page Sub Components => src/app/pages/(your page)/sub-components
    - Example: src/app/pages/home/sub-components
- Shared Components => src/shared-components/(your component)
    - Example: src/shard-components/header

The app structure relative to routing is pretty simple as well.  Let's say we have the following routes:
1. http://localhost:8080/#/Content
2. http://localhost:8080/#/Content/Detail

From the above example

    src
    ├── app
    |   ├── pages
    |   |   ├── content
    |   |   |    ├── content.tsx 
    |   |   |    ├── content.scss 
    |   |   |    ├── sub-components (empty)
    |   |   |    └── detail 
    |   |   └──         ├── detail.tsx 
    |   └──             ├── detail.scss 
    └──                 └── sub-components (empty)


# Creating a new component
Creating a component is very easy.  Depending whether its a page or sub component, simply create a .tsx page in your location.  If your file does not have styling, you can omit the sass (.scss) file.  If your component does have styling, import your sass file in the file it is being used:

home.tsx
```
import * as React from 'react';
import './Home.scss';

export class Home extends React.Component {

}
```

# Routing
This react application uses the react [Hash Router](https://github.com/ReactTraining/react-router/blob/master/packages/react-router-dom/docs/api/HashRouter.md).  To add a new Route, go to the app.tsx file (src/app/app.tsx) and add a new route like shown below.

```
    ...
        <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/test" component={Test} />

            // New Route Below
            <Route path="/mynewpath" component={MyNewComponent} />
        </Switch>
    ...
```

# Using the context api
Using the new context api is very powerful.  For more information, please visit [react context docs](https://reactjs.org/docs/context.html).  There is a `StateProvider` class to help creating a context provider as well. 

## Creating a new context
This example creates our context for the type of `IAppState`.
```
import * as React from 'react';
import { StateProvider, update } from '../common/context/StateProvider';

// This is the default state of the application, state is IAppState
const defaultContext: IReactContext<IAppState> = {
    state: {
        Id: "Id",
        Name: ""
    },
    update: update
};

// Here is our app context, it is created by passing in a default context like the one we create above.
// As you can see, we are creating context with a generic whose type is IAppState
export const AppContext: React.Context<IReactContext<IAppState>> = React.createContext(defaultContext);

// This is the actual provider.  It extends `StateProvider` to abstract away boilerplate code.  
// Again, the generic is IAppState
export class AppStateProvider extends StateProvider<IAppState> {

    constructor(props: any) {
        /// props: must be passed through otherwise react will error
        /// AppContext: from AppContext above
        /// defaultContext.state: from our default context above
        super(props, AppContext, defaultContext.state);
    }

}
```

## Using the Context
Below is an example of a component consuming the context api

```
import * as React from 'react';
import { AppContext } from '../../../AppStateProvider';
import './HomePageSubComponent.scss';

export class HomePageSubComponent extends React.Component {

    // AppContext should look familiar, it is from our app state provider we created above
    static contextType = AppContext;

    // IAppState should look familiar as well, it is from our app state provider again
    context!: IReactContext<IAppState>;

    onClick = () => {

        // to update state on our context, make the below call
        this.context.update({
            Id: "100"
        });
    }

    onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.context.update({
            Id: e.target.value
        });
    }

    render() {
        return (
            <div id="home-page-sub-component">
                <div className="row">
                    <div className="col-sm-4">
                        Type to Change State
                        <!-- Using a value from the context api -->
                        <input value={this.context.state.Id} onChange={e => this.onInputChange(e)} className="form-control" />
                    </div>
                </div>
                <br />
                <br />
                Or
                <br />
                <br />
                <div className="row">
                    <div className="col-sm-4">
                        Click to Change State
                    <div>
                            <button className="btn btn-primary" onClick={this.onClick}><i className="fa fa-check"></i>&nbsp;Change Parent State Id Value</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
```

# Configuration
Configuration was setup to mirror asp.net mvc applications.  There is a main app settings file and transforms for each environment if needed.  

## Accessing Settings
Application settings can be accessed from any .ts or .tsx file by using `appSettings`.

```

export class Test {

    someProperty: string = appSettings.apiEndpoint;

    someFunction() {
        console.log(appSettings.apiEndpoint);
    }
}

```

## Adding new setting
To add a new setting, add a property to the `IAppSettings` interface under config/appsettings.d.ts.  Once that property is added, the setting must be added to the concrete implementation of `IAppSettings`, which is called `AppSettings` located at config/appsettings.ts.  Thats it, now there will be a new setting available.

## Transforming settings
Often times, app settings are different between environments for things like api endpoints.  One way to handle the different api endpoints is transforming the app settings per environment.  

This app contains default application settings described above (`AppSettings`), which can be transformed by modifying the transform config per environment.  

NOTE: If no transform value is supplied, the value from config/appsettings.ts will be used.


In this example, we will transform the apiEndpoint for the development environment

config/appsettings.d.ts
```
declare interface IAppSettings {
    apiEndpoint: string;
}

```

config/appsettings.ts
```
export const appSettings: IAppSettings = {
    apiEndpoint: 'some default endpoint url'
}
```

config/dev/dev.appsettings.transform.ts
```
/// <reference path="../appsettings.d.ts" />
/// <reference path="../../src/common-types.d.ts" />

export const developmentAppSettings: DeepPartial<IAppSettings> = {
    apiEndpoint: 'our dev endpoint'
}
```

When we run the dev build, the api endpoint will now be transformed to according to our config/dev/dev.appsettings.transform.ts file.

# NPM Commands
- `npm start` Starts the app in development mode
- `npm run start:stage` Starts the app in staging mode
- `npm run start:prod` Starts the app in production mode
- `npm run build:dev` Builds the app in development mode
- `npm run build:stage` Builds the app in staging mode
- `npm build` Builds the app in production mode
- `npm run clean` Destroys the dist folder where the app is served from