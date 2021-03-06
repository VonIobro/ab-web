/**
 * Create the store with asynchronously loaded reducers
 */

import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import { routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';

import createReducer from './reducers';
import { setAuthState } from './containers/AccountProvider/actions';
import { formActionSaga } from './services/reduxFormSaga';
import workers from './workers';

import * as storageService from './services/localStorage';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}, history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    ...workers,
    sagaMiddleware,
    routerMiddleware(history),
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    fromJS(initialState),
    composeEnhancers(...enhancers)
  );

  sagaMiddleware.run(
    formActionSaga,
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.asyncReducers = {}; // Async reducer registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('./reducers', () => {
      import('./reducers').then((reducerModule) => {
        const createReducers = reducerModule.default;
        const nextReducers = createReducers(store.asyncReducers);

        store.replaceReducer(nextReducers);
      });
    });
  }

  if (isLoggedIn()) {
    store.dispatch(setAuthState({
      loggedIn: true,
      privKey: storageService.getItem('privKey'),
      email: storageService.getItem('email'),
      accountId: storageService.getItem('accountId'),
      proxyAddr: storageService.getItem('proxyAddr'),
    }));
  } else {
    store.dispatch(setAuthState({ loggedIn: false }));
  }

  return store;
}

function isLoggedIn() {
  const privKey = storageService.getItem('privKey');
  return (privKey !== undefined && privKey.length > 32);
}
