import React, { Component } from "react";
import axios from 'axios'
//firebase
import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/auth';
import firebaseConfig from '../firebaseConfig';
//initialize
const firebaseApp = firebase.initializeApp(firebaseConfig);
//setup provider
const firebaseAppAuth = firebaseApp.auth();
const providers = {
    googleProvider: new firebase.auth.GoogleAuthProvider(),
};
export const UserContext = React.createContext();

export class UserProvider extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //init for render value, otherwise render() get null
            currentUser: {},
            listRecord: []
        }
        firebase.auth().onAuthStateChanged((user) => {
            firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then((idToken) => {
                // Send token to your backend via HTTPS
                // Access REST API with idToken, config rule in database rule
                //console.log(idToken);
                //khong co quyen tao user voi uid cua minh
                //let queryString = `https://firstfirebase-ffcda.firebaseio.com/user.json`;
                let uid = user.uid;
                let recordString = `https://firstfirebase-ffcda.firebaseio.com/record/${uid}.json?auth=${idToken}`;
                let userString = `https://firstfirebase-ffcda.firebaseio.com/user/${uid}.json?auth=${idToken}`;
                axios.all([
                    axios.get(userString),
                    axios.get(recordString)
                ])
                    .then(axios.spread((userRes, recordRes) => {
                        //convert record response json to array
                        let records = recordRes.data;
                        let recordArray = [];
                        for (let key in records) {
                            if (records.hasOwnProperty(key)) {
                                recordArray.push([key, records[key]]);
                            }
                        }
                        this.setState({
                            currentUser: userRes.data,
                            listRecord: recordArray
                        })
                        // console.log(this.state.listRecord);
                    })).catch(function (error) {
                        console.log("axios request error");
                    });
            });
        });
        //null because not setstate before, log before axios get done (async)
        // console.log(this.state.listRecord);

    }
    render() {
        const { currentUser, listRecord } = this.state;
        return (
            <UserContext.Provider
                value={state = this.state}
            >
                {this.props.children}
            </ UserContext.Provider >
        );
    }
}

export default withFirebaseAuth({
    providers,
    firebaseAppAuth,
})(UserProvider);