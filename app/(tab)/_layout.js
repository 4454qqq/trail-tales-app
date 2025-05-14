import { router, Tabs } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, View, ToastAndroid, TouchableWithoutFeedback } from "react-native";
import { getItemFromAS } from '../../utiles/utile'

function PublishButton() {
  const addButtonPress = async () => {
    let user = await getItemFromAS("userInfo");
    user = JSON.parse(user);
    if (user) {
      router.push("logPublic");
    } else {
      ToastAndroid.show("请先登录~", ToastAndroid.SHORT);
    }
  };
  return (
    <TouchableWithoutFeedback onPress={addButtonPress}>
      <View style={styles.addButton}>
        <MaterialIcons name="add" size={32} color="white" />
      </View>
    </TouchableWithoutFeedback>
  );
}

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
          // tabBarIcon: ({ color, size }) => (
          //   <MaterialIcons name="library-add" color={color} size={size} />
          // ),
          tabBarButton: () => <PublishButton />,
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
  addButton: {
    width: 40,
    paddingVertical: 5,
    borderRadius: 50,
    backgroundColor: "#3498DB",
    alignItems: "center",
    margin: 2,
    marginLeft:48,
    marginTop:5
  },
});
