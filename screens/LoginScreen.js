import React, { Component } from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "native-base";
import * as firebase from 'firebase';
import { Constants } from 'expo'
import { Container, Item as FormItem, Input, Button, Header, Label, Form, Body, Title  } from 'native-base';
import * as Expo from "expo";


class LoginScreen extends Component {
  constructor(props) {
    super(props);
    //Firebase.init()
    this.state = {
      email: "",
      password: "",
      user: null,
      isReady: false
    };


    this.signUp = this.signUp.bind(this);
    this.login = this.login.bind(this);
    this.signUpUser = this.signUpUser.bind(this);
  }

  async componentDidMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Ionicons: require("native-base/Fonts/Ionicons.ttf")
    });


    //Setting the state to true when font is loaded.
    this.setState({ isReady: true });

    await firebase.auth().onAuthStateChanged(user => {
      // Cada vez que nos loggeemos o nos salgamos, el user tendrá información.
      if (user !== null) {
        this.setState({ user: user });
      } else {
        this.setState(
          { user: null }
        )
      }
    });
  }


  async signUp() {
    console.log("email : " + this.state.email);
    console.log("pass : " + this.state.password);
    console.log(firebase.auth().isSignInWithEmailLink);
    try {
      await firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password);

      this.setState({
        user: true
      });
      setTimeout(() => {
        this.props.navigation.navigate("Home");
      }, 1500);
    } catch (error) {
      this.setState({
        response: error.toString()
      });
    }
  }
  /*
    onLoginGoogle = () => {
      GoogleSignin.signIn().then((data) => {
        const credential = fire.auth().GoogleAuthProvider.credential(data.idToken, data.accessToken);
  
        return fire.auth().signInWithCredential(credential);
      })
  
    }*/
  signUpUser = (email, password) => {
    try {
      if (this.state.password.length < 6) {
        alert("Enter at least 6 characters")
        return;
      }

      firebase.auth().onAuthStateChanged(function (user) {
        firebase.auth().createUserWithEmailAndPassword(email, password);
        user.sendEmailVerification();
      });


      this.setState({
        user: true
      })
      console.log("success");

    } catch (error) {
      console.log("error");
    }

  }

  async login() {
    try {
      await firebase.auth().onAuthStateChanged(user => {
        // Cada vez que nos loggeemos o nos salgamos, el user tendrá información.
        if (user === null) {

          try {
            firebase
              .auth()
              .signInWithEmailAndPassword(this.state.email, this.state.password);
            this.setState({
              user: user
            });
            console.log("logged in");
            this.props.navigation.navigate('Home');
          } catch (error) {
            console.log("error");
          }

        }
      });
    } catch (error) {
      console.log("error");

    }

  }


  async logout() {

    try {
      await firebase.auth().signOut();
      console.log("logged out");
      this.setState({
        user: null
      })

      this.props.navigation.navigate('Home');


    } catch (error) {
      console.log("error");
    }

  }
  /*
  onPressSignIn() {
    this.setState({
      user: true
    });
    this.props.navigation.navigate('Home');
  }*/

  render() {
    if (this.state.isReady) {
      return this.state.user === null ? (
        <Container style={{ paddingTop: Constants.statusBarHeight }}>
          <Header>
            <Body>
              <Title>Login / Logout</Title>
            </Body>
          </Header>

          <View style={{ flex: 1 }}>

            <Form>
              <FormItem floatingLabel>
                <Label>Email</Label>
                <Input label="Email"
                  onChangeText={email => this.setState({ email })} value={this.state.email} />
              </FormItem>
              <FormItem floatingLabel last regular>
                <Label>Password</Label>
                <Input label="Password"
                  onChangeText={password => this.setState({ password })}
                  value={this.state.password} />
              </FormItem>

            </Form>

            <Button onPress={() => this.login()} ><Text>Login</Text></Button>
            <Button onPress={() => this.signUpUser(this.state.email, this.state.password)}><Text>Sign up</Text></Button>
          </View>


        </Container>
      ) : (

          <Container style={styles.container}>
            <View style={{ flex: 1 }}>
              <Button onPress={() => this.logout()}><Text>Log Out</Text></Button>
            </View>

          </Container>

        );
    } else {
      return <Expo.AppLoading />;
    }




  }
}

export default LoginScreen;


const styles = StyleSheet.create({
  container: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"

  },
  form: {
    flex: 1
  }
});
