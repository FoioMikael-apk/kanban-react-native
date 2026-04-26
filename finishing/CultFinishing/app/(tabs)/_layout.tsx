import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0079BF',
        tabBarInactiveTintColor: '#A1A1AA',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#F4F5F7',
          elevation: 0,
          shadowOpacity: 0,
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quadro',
          tabBarIcon: ({ color }) => <Feather size={24} name="trello" color={color} />,
        }}
      />
      <Tabs.Screen
        name="agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <Feather size={24} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="concluidos"
        options={{
          title: 'Concluídos',
          tabBarIcon: ({ color }) => <Feather size={24} name="check-circle" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
