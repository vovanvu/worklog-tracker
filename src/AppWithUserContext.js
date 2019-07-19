import React, { Component } from 'react';
import { UserProvider, UserContext } from "./contexts/User";
class App extends Component {
    render() {
        const NumberContext = React.createContext();
        return (
            <div>
                <UserProvider>
                    <UserContext.Consumer>
                        {(currentUser) => (<p>{currentUser}</p>)}
                    </UserContext.Consumer>
                </UserProvider>
            </div>);
    }
}
export default App