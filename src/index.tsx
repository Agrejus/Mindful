import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app/App';
import 'whatwg-fetch';// polyfill window.fetch
import './index.scss';

let topics: any = {};

// register pub sub
window.publish = (topic, info) => {

  if (topics.hasOwnProperty(topic) === false) {
    return;
  }

  for (var item of topics[topic]) {
    item(info);
  }
};

window.hasSubscribed = (topic) => {
  return topics.hasOwnProperty(topic);
}

window.subscribe = (topic, listener) => {
  if (topics.hasOwnProperty(topic) === false) {
    topics[topic] = [];
  }

  var index = topics[topic].push(listener) - 1;

  return {
    remove: () => {
      delete topics[topic][index];
    }
  }
};

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);