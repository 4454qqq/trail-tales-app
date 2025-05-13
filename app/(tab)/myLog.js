import { Text, View } from "react-native";
import { Link } from "expo-router";

export default function MyLog() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>我的游记</Text>
      <Link href={'login'}>Login</Link>
      <Link href={'register'}>register</Link>
    </View>
  );
}
