import React, { createContext, useReducer, useContext } from "react";
import moment from "moment";
import axios from '../axios';
import Storage from './Storage';

const localStorage = new Storage(window.localStorage);

const STORE_KEY = 'renderer-storage';

let storage = null;
try {
    storage = localStorage.getItem(STORE_KEY);
    axios.defaults.headers.common['Authorization'] = `Bearer ${storage.user.token}`;
} catch(e) {}

console.log(storage);

const initialState = {
    ...storage,
    loginModelVisible: false,
};

const store = createContext(initialState);

const { Provider } = store;

function reducer(preState, action) {
    let nextState = {};
    switch(action.type) {
        case 'SHOW_LOGIN_MODEL':
            nextState = { ...preState, loginModelVisible: true };
            break;
        case 'HIDE_LOGIN_MODEL':
            nextState = { ...preState, loginModelVisible: false };
            break;
        case 'TODAY':
            nextState = { ...preState, user: { ...preState.user, pointsFree: action.data.pointsFree, today: moment().format('YYYYMMDD') } };
            break;
        case 'LOGIN':
            const user = action.data;
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
            nextState = { ...preState, loginModelVisible: false, user: {...user, today: user.today ? moment().format('YYYYMMDD') : false } };
            break;
        case 'LOGOUT':
            axios.defaults.headers.common['Authorization'] = null;
            localStorage.removeItem(STORE_KEY);
            nextState = { ...preState, loginModelVisible: false, user: null };
            break;
        default:
            throw new Error(`action.type: "${action.type}" not found`);
    }
    if (process.env.NODE_ENV === 'development') {
        console.group('store change');
        console.log('prestate', preState);
        console.log('action', action);
        console.log('nextstate', nextState);
        console.groupEnd();
    }
    localStorage.setItem(STORE_KEY, nextState);
    return nextState;
}

let mydispatch;
export function StateProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, initialState);
    mydispatch = dispatch;
    return <Provider value={state}>{children}</Provider>
}

export default store;

export function dispatch(action) {
    mydispatch(action);
}

export function connect(mapStateToProps, Component) {
    return function ConnectedComponent(props) {
        const state = useContext(store);
        return <Component {...(mapStateToProps && mapStateToProps(state))} {...props} />;
    }
}
