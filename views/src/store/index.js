import React, { createContext, useReducer, useContext } from "react";

const initialState = {
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
    loginModelVisible: false,
};

const store = createContext(initialState);

const { Provider } = store;

function reducer(state, action) {
    switch(action.type) {
        case 'SHOW_LOGIN_MODEL':
            return { ...state, loginModelVisible: true };
        case 'HIDE_LOGIN_MODEL':
            return { ...state, loginModelVisible: false };
        case 'LOGIN':
            localStorage.setItem('token', action.token);
            localStorage.setItem('user', action.user);
            return { ...state, loginModelVisible: false, token: action.token, user: action.user };
        case 'LOGOUT':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { ...state, loginModelVisible: false, token: null, user: null };
        default:
            throw new Error(`action.type: "${action.type}" not found`);
    }
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
        return <Component {...mapStateToProps && mapStateToProps(state)} {...props} />;
    }
}
