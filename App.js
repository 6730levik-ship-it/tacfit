import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from './src/screens/LoginScreen';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {user ? (
        <AppNavigator user={user} />
      ) : (
        <LoginScreen onLogin={setUser} />
      )}
    </SafeAreaProvider>
  );
}
