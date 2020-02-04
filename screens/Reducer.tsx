import { combineReducers } from 'redux';

const INITIAL_STATE: State = [];

interface State {}

interface Action {
    type: string,
    payload: object
}

const keyReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case 'ADD_KEY':
            let keys = [...state];
            keys.push(action.payload);
            return keys;
        case 'SET_KEYS':
            let setkeys = action.payload;
            return setkeys;
        default:
            return state;
    }
};


export default combineReducers({
    keys: keyReducer
});