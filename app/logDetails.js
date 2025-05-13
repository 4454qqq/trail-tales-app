import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
export default function Details() {
  const params = useLocalSearchParams();
  const log = JSON.parse(params.log || "{}");
  
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>details</Text>
    </View>
  );
}
