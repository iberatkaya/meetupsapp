import React from 'react';
import { NavigationStackProp } from 'react-navigation-stack';

type Props = {
    navigation: NavigationStackProp<{}>
};

type State = {
};

class DeepLinkProxy extends React.Component<Props, State>{
    
    componentDidMount(){
        let key = this.props.navigation.getParam("key")
        this.props.navigation.navigate("Home");
        this.props.navigation.navigate("JoinRoom", {key: key});
    }

    render(){
        return(<></>)
    }
}

export default DeepLinkProxy;