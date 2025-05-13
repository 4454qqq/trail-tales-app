import { Stack } from "expo-router";
import { useEffect } from "react";
import {
    api,
    setAuthHeader,
    storeDataToAS,
    removeValueFromAS,
    getItemFromAS,
} from "../utiles/utile";

export default function RootLayout() {
    useEffect(() => {
        setAuthHeader();
    }, []);

    return (
        <Stack>
            <Stack.Screen name="(tab)" options={{ headerShown: false }} ></Stack.Screen>
            <Stack.Screen name="logDetails" options={{ headerShown: false }}></Stack.Screen>
            <Stack.Screen name="login" options={{ title: 'login' }}></Stack.Screen>
            <Stack.Screen name="register" options={{ title: 'register' }}></Stack.Screen>
        </Stack>
    )
}