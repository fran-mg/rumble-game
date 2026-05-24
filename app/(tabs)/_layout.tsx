import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import React from "react";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="decks"
        options={{
          title: "Decks",
          tabBarIcon: ({ color }) => <TabBarIcon name="clone" color={color} />,
        }}
      />
      <Tabs.Screen
        name="database-test"
        options={{
          title: "DB",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="database" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="round-test"
        options={{
          title: "Round Test",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="check-square-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="match-test"
        options={{
          title: "Match Test",
          tabBarIcon: ({ color }) => <TabBarIcon name="anchor" color={color} />,
        }}
      />
    </Tabs>
  );
}
