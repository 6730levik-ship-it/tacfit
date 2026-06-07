import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { colors, fonts } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import NutritionScreen from '../screens/NutritionScreen';
import RunScreen from '../screens/RunScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  Dashboard: '🏠',
  Workout: '🏋️',
  Run: '🏃',
  Nutrition: '🥗',
  Profile: '👤',
};

function MainTabs({ user }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 72,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: String(fonts.bold), marginTop: 2 },
      })}
    >
      <Tab.Screen name="Dashboard" options={{ title: 'ראשי' }}>
        {props => <DashboardScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Workout" options={{ title: 'אימון' }}>
        {props => <WorkoutScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Run" options={{ title: 'ריצה' }}>
        {props => <RunScreen {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Nutrition" options={{ title: 'תזונה' }}>
        {props => <NutritionScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ title: 'פרופיל' }}>
        {props => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator({ user }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main">
          {props => <MainTabs {...props} user={user} />}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
