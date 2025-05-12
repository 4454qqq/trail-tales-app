import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export default function TabLayout() {
  return (
    <Tabs initialRouteName='index'
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: styles.tabBarText,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "blue",
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="travel-explore" color={color} size={size} />),
          tabBarLabel: '游记列表'
        }} />
      <Tabs.Screen
        name="logPublic"
        options={{
          tabBarLabel: "游记发布",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="library-add" color={color} size={size} />
          ),
          // tabBarButton: () => <PublishButton />,
          tabBarStyle: { display: "none" },
        }} />
      <Tabs.Screen
        name="myLog"
        options={{
          tabBarLabel: "我的游记",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  tabBarIcon: {
   fontSize: 12
  },
});
