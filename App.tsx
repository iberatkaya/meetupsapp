import React from 'react';
import AppNav from './AppNav';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import expenseReducer from './screens/Reducer';

const store = createStore(expenseReducer);

class App extends React.Component{
  render(){
    return(
      <Provider store={ store }>
        <AppNav uriPrefix="https://"/>
      </Provider>
    );
  }
};

export default App;
