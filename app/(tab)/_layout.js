import { MaterialIcons } from "@expo/vector-icons";
import { router, Tabs } from 'expo-router';
import { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  ToastAndroid,
  TouchableWithoutFeedback
} from "react-native";
import { getItemFromAS } from '../../utiles/utile';

function PublishButton() {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

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
    <TouchableWithoutFeedback
      onPressIn={animateIn}
      onPressOut={animateOut}
      onPress={addButtonPress}
    >
      <Animated.View style={[styles.addButton, { transform: [{ scale: scaleValue }] }]}>
        <MaterialIcons name="add" size={30} color="white" />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: styles.tabBarText,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "blue",
        tabBarStyle: {
          height: 60,
          backgroundColor: "white",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="travel-explore" color={color} size={size} />
          ),
          tabBarLabel: '游记列表',
        }}
      />

      <Tabs.Screen
        name="logPublic"
        options={{
          tabBarLabel: "游记发布",
          tabBarButton: () => <PublishButton />, // 替代默认按钮
          tabBarStyle:{display: 'none'}
        }}
      />

      <Tabs.Screen
        name="myLog"
        options={{
          tabBarLabel: "我的游记",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#3498DB",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 5,
    alignSelf: "center",
    zIndex: 10,
    elevation: 5, // Android 阴影
    shadowColor: "#000", // iOS 阴影
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
