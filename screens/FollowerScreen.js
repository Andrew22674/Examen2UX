import React, { Component } from "react";
import { View, StyleSheet} from "react-native";
import * as firebase from "firebase";
import { Ionicons } from '@expo/vector-icons';
import { Constants } from 'expo'
import * as Expo from "expo";
import { YellowBox } from 'react-native';
import _ from 'lodash';


YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
    if (message.indexOf('Setting a timer') <= -1) {
        _console.warn(message);
    }
};

import {
    Button,
    Card,
    Content,
    Picker,
    CardItem,
    Container,
    Left,
    Right,
    Thumbnail,
    List,
    ListItem,
    Body,
    Form,
    Title,
    Header,
    Text,
    DeckSwiper,
} from "native-base";

class FollowerScreen extends Component {
    constructor(props) {
        super(props);
        this.classes = props.classes;

        this.state = {
            posts: [],
            visibility: "PUBLIC",
            public: true,
            private: false,
            follower: false,
            isReady: false,
            mensajes: [],
            user: null,
            selected: "followers"
        };

        this.likePost = this.likePost.bind(this);
        this.followUser = this.followUser.bind(this);
        this.onValueChange = this.onValueChange.bind(this);

    }

    followUser(userToFollow) {
        var userId = firebase.auth().currentUser.uid;
        var ref = firebase.database().ref().child("users/" + userId + "/");

        ref.once("value").then(function (snapshot) {
            if (snapshot.child(userToFollow).exists()) {
                alert("Unfollowed user");
                ref.child(userToFollow).remove();
            } else {
                if (userToFollow != userId) {
                    alert("Followed user");
                    //console.log("user is not followed");
                    ref.child(userToFollow).set(true);
                } else {
                    alert("Can't follow yourself");
                    // console.log("can't follow yourself");
                }

            }
        });
    }




    async componentDidMount() {
        //let currentComponent = this;

        await Expo.Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
            Ionicons: require("native-base/Fonts/Ionicons.ttf")
        });


        this.setState({ isReady: true });


        try {
            await firebase.auth().onAuthStateChanged(user => {
                if (user) {
                    this.setState({ user: user });
                } else {
                    this.setState(
                        { user: null }
                    )
                }
            });
        } catch (error) {
            console.log("error");
        }


        if (this.state.user) {
            try {
                var userId = firebase.auth().currentUser.uid;
                var ref = firebase.database().ref().child("users/" + userId);

                ref.on("value", (snapshot) => {
                    let list = [];
                    snapshot.forEach((childSnapshot) => {
                        var key = childSnapshot.key;
                        //console.log();
                        console.log("key de followed user: " + key);

                        var messagesRef = firebase.database().ref().child("user-posts").child(key).child("followers");

                        messagesRef.on("value", (snapshot) => {
                            if (snapshot.exists()) {
                                console.log("exists");

                                snapshot.forEach((childSnapshot) => {
                                    console.log(childSnapshot.val());
                                    list.push(childSnapshot.val());
                                    this.setState({
                                        mensajes: list
                                    })
                                });
                            } else {
                                console.log("not exists");
                            }
                        });

                    })
                });
            } catch (error) {
                console.log("error");
            }
        }








    }

    onValueChange(value) {
        this.setState({
            selected: value
        });
    }



    likePost(messageID, postUserId, tipoAcceso) {
        var userId = firebase.auth().currentUser.uid;
        //var refNumLikes = fire.database().ref().child("messages/" + messageID + "/likes");
        var ref = firebase.database().ref().child("messages/" + messageID + "/likes");
        var ref2 = firebase.database().ref().child("user-posts/" + postUserId + "/" + tipoAcceso + "/" + messageID + "/likes");

        console.log(messageID);
        console.log("like");


        //ref("-messages/"+ "-likes/-userIDs"+ userId).update(ref("-messages/"+ "-likes/-userIDs"+ userId) === false ? ( console.log("false") ) : (console.log("true")));
        ref.once("value")
            .then(function (snapshot) {
                //console.log(snapshot.child("userIDs").child(userId).exists() ? ("user likes exists") : ("does not exist"));
                var contador = snapshot.child("cont").val();
                if (snapshot.child("userIDs").child(userId).exists()) {
                    console.log("user like exists");
                    ref.child("userIDs").child(userId).remove();
                    contador = contador - 1;
                    ref.update({ cont: contador });

                    ref2.child("userIDs").child(userId).remove();
                    ref2.update({ cont: contador });

                    //cont--
                } else {
                    contador = contador + 1;
                    console.log("user like does not exist");
                    ref.child("userIDs").child(userId).set(true);
                    ref.update({ cont: contador });

                    ref2.child("userIDs").child(userId).set(true);
                    ref2.update({ cont: contador });
                }

                console.log("Cont likes: " + contador);

            });
    }


    render() {


        let data = this.state.mensajes.map((item) => {
            return (

                <Card key={item.idMensaje}>

                    <CardItem >
                        <Left>
                            <Thumbnail source={{ uri: 'https://cdn1.iconfinder.com/data/icons/social-messaging-productivity-1-1/128/gender-male2-512.png' }} />
                            <Body >
                                <Text>{item.titulo}</Text>
                                <Text note>date</Text>
                            </Body>
                        </Left>
                    </CardItem>

                    <CardItem>
                        <Body>
                            <Text > {item.mensaje}</Text>
                        </Body>
                    </CardItem>

                    <CardItem>
                        <Left>
                            <Button transparent onPress={() => this.likePost(item.idMensaje, item.userId, item.acceso)}>
                                <Ionicons name="md-thumbs-up" size={30} color="blue" />
                                <Text> {item.likes.cont} likes </Text>
                            </Button>
                        </Left>
                        <Right>
                            <Button transparent onPress={() => this.followUser(item.userId)}>
                                <Ionicons name="md-person-add" size={30} color="blue" />
                                <Text> Follow User </Text>
                            </Button>
                        </Right>
                    </CardItem>
                </Card>

            )
        })



        if (this.state.isReady) {
            if (this.state.user !== null) {
                return (
                    <Container style={{ paddingTop: Constants.statusBarHeight }}>
                        <Header>
                            <Body>
                                <Title>Posts</Title>
                            </Body>
                            <Right>
                                <Form>
                                    <Picker
                                        note
                                        mode="dropdown"
                                        style={{ width: 120 }}
                                        selectedValue={this.state.selected}
                                        onValueChange={this.onValueChange.bind(this)}
                                    >
                                        <Picker.Item label="public" value="public" />
                                        <Picker.Item label="private" value="private" />
                                        <Picker.Item label="followers" value="followers" />
                                    </Picker>
                                </Form>
                            </Right>
                        </Header>
                        <Content >

                            {data}

                        </Content>
                    </Container>)
            } else {
                return (
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'red'
                    }}>
                        <Text >
                            Not logged in.
            </Text>
                    </View>)
            }
        }
        else {
            return <Expo.AppLoading />;
        }

    }
}

export default FollowerScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center"
    }
});
