import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { api, storeDataToAS } from '../utiles/utile';
import { router } from "expo-router";

const LoginScreen = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState("");

    const handleInputUsername = (text) => {
        setUsername(text);
    };

    const handleInputPassword = (text) => {
        setPassword(text);
    };

    const handleCheck = () => {
        if (!username) {
            setErrorMessage("用户名不能为空");
            return false;
        } else if (!password) {
            setErrorMessage("密码不能为空");
            return false;
        } else {
            setErrorMessage("");
            return true;
        }
    };

    const handleLogin = async () => {
        if (handleCheck()) {
            await api
                .post(
                    "/login/login",
                    {
                        username: username,
                        password: password,
                    }
                )
                .then(async (res) => {
                    console.log(res.data.data.token);
                    console.log(res.data.data.userInfo);
                    await storeDataToAS("token", res.data.data.token);
                    await storeDataToAS(
                        "userInfo",
                        JSON.stringify(res.data.data.userInfo)
                    );
                    router.push('(tab)')
                })
                .catch((err) => {
                    console.log(err);
                    console.log("提交失败:", err.response.data.message);
                    setErrorMessage(err.response.data.message);
                });
        }
    };

    return (
        <View style={styles.container}>

            <Text style={styles.appName}>Trail Tales Login</Text>

            {/* 输入框和按钮的容器 */}
            <View style={styles.formContainer}>
                {/* 用户名输入框 */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请输入用户名"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={handleInputUsername}
                    />
                    {username.length > 0 && (
                        <TouchableOpacity onPress={() => setUsername("")} style={styles.clearButton}>
                            <MaterialIcons
                                name="cancel"
                                size={24}
                                color="#989797"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {/* 密码输入框 */}
                <View style={{...styles.inputWrapper, marginBottom:10}}>
                    <TextInput
                        style={styles.input}
                        placeholder="请输入密码"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={handleInputPassword}
                        secureTextEntry={true}
                    />
                    {password.length > 0 && (
                        <TouchableOpacity onPress={() => setPassword("")} style={styles.clearButton}>
                            <MaterialIcons
                                name="cancel"
                                size={24}
                                color="#989797"
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ alignItems: "center", marginBottom:10 }}>
                    <Text style={{ color: "red" }}>{errorMessage}</Text>
                </View>

                {/* 登录按钮 */}
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.buttonText}>登录</Text>
                </TouchableOpacity>

                {/* 注册按钮 */}
                <TouchableOpacity style={styles.registerButton} onPress={() => router.push("register")}>
                    <Text style={styles.buttonText}>注册</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 40,
        color: '#333',
    },
    formContainer: {
        width: '80%', // 设置宽度为屏幕宽度的 80%
        maxWidth: 400, // 最大宽度限制为 400px，防止在大屏幕上显得过大
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 25,
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#333',
        fontSize: 16,
        paddingHorizontal: 10,
    },
    clearButton: {
        padding: 10,
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#007bff',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    registerButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#28a745',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default LoginScreen;