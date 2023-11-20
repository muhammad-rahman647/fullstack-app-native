import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  TextInput,
  View,
  Text,
  ActivityIndicator,
  Button,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StackScreens } from '../../App';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenState = {
  username: string;
  password: string;
  errors: { [key: string]: string };
  loading: boolean;
};
export default function Login({
  navigation,
}: NativeStackScreenProps<StackScreens, 'Login'>) {
  const [state, setState] = useState<LoginScreenState>({
    username: '',
    password: '',
    errors: {},
    loading: false,
  });

  const { username, password, errors, loading } = state;

  // Function to update state
  const updateState = (newState: Partial<LoginScreenState>) =>
    setState((prevState) => ({ ...prevState, ...newState }));

  const validate = () => {
    let isValid = true;
    let errors: { [key: string]: string } = {};

    if (!username) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    updateState({ errors });
    return isValid;
  };

  const handleLogin = async () => {
    try {
      if (validate()) {
        updateState({ loading: true });
        const body = JSON.stringify({ username, password });

        const response = await (
          await fetch('http://127.0.0.1:50000/auth/login', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body,
          })
        ).json();

        if (response.success) {
          await AsyncStorage.setItem('token', response.data.token);
          updateState({ loading: false });
          navigation.replace('App');
        } else {
          Alert.alert(response.message);
          updateState({ loading: false });
        }
      }
    } catch (error) {
      updateState({ loading: true });
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => updateState({ username: text })}
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.error}>{errors.username}</Text>}
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => updateState({ password: text })}
        secureTextEntry
      />
      {errors.password && (
        <View>
          <Text style={styles.error}>{errors.password}</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}
    </View>
  );
}

// Styling for the login screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '85%',
    height: 50,
    borderWidth: 1,
    borderColor: '#4CAF50', // Green border color (customize as needed)
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: '#333', // Text color
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
