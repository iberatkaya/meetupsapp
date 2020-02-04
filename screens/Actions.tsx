export const addKey = (key: object) => (
    {
      type: 'ADD_KEY',
      payload: key
    }
);

export const setKeys = (key: Array<object>) => (
  {
    type: 'SET_KEYS',
    payload: key
  }
);
