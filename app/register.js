import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { api, storeDataToAS } from '../utiles/utile';
import { router } from "expo-router";
export default function Register() {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [errorMessage, setErrorMessage] = useState("");

    const handleTotalCheck = () => {
        if (!username) {
            setErrorMessage("用户名不能为空");
        } else if (!password) {
            setErrorMessage("密码不能为空");
        } else if (confirmPassword != password) {
            setErrorMessage("两次输入的密码不一致");
        } else {
            setErrorMessage("");
            return true;
        }
        return false;
    };
    const handleReigster = async () => {
        console.log(handleTotalCheck(),password)
        if (handleTotalCheck()) {
            
            await api
                .post(
                    "/login/register",
                    {
                        username: username,
                        password: password,
                    }
                )
                .then((res) => {
                    console.log("提交成功:", res.data.message);
                    // 提交成功后跳转到登录页面
                    router.push("login");
                })
                .catch((err) => {
                    console.log("提交失败:", err.response.data.message);
                    setErrorMessage(err.response.data.message);
                });
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.appName}>Trail Tales Register</Text>

            {/* 输入框和按钮的容器 */}
            <View style={styles.formContainer}>
                {/* 用户名输入框 */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请输入用户名"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>

                {/* 密码输入框 */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请输入密码"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                    />
                </View>

                {/* 确认密码输入框 */}
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请确认密码"
                        placeholderTextColor="#888"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true}
                    />
                </View>

                {/* 注册按钮 */}
                <TouchableOpacity style={styles.registerButton} onPress={handleReigster}>
                    <Text style={styles.buttonText}>注册</Text>
                </TouchableOpacity>

                {/* 错误信息 */}
                <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
        </View>
    )
}

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
    registerButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#28a745',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 10,
    },
});