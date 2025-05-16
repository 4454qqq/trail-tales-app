import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { api } from '../utiles/utile';
import { router } from "expo-router";
export default function Register() {
    const [username, setUsername] = useState();
    const [password, setPassword] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [errorMessage, setErrorMessage] = useState("");
    // 处理限流操作
    const [isRegisterDisabled, setIsRegisterDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);


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

    // 处理限流禁用提交按钮的倒计时效果
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdown === 0 && isRegisterDisabled) {
            setIsRegisterDisabled(false);
            setErrorMessage("");
        }
        return () => clearTimeout(timer);
    }, [countdown, isRegisterDisabled]);

    const handleReigster = async () => {
        console.log(handleTotalCheck(), password)
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
                    // 默认错误信息
                    let message = "注册失败，请稍后再试";

                    if (err.response) {
                        const resData = err.response.data;

                        if (resData.status === "error") {
                            // 限流提示
                            if (err.response.status === 429 && resData.retryAfter) {
                                const hours = Math.ceil(resData.retryAfter / 60);
                                message = `${resData.message}，请在 ${hours} 小时后再试`;
                                console.log(message);
                                
                                setIsRegisterDisabled(true);
                                setCountdown(resData.retryAfter);
                            }
                            // 登录失败提示，包含剩余尝试次数
                            else if (resData.message && resData.remainingAttempts !== undefined) {
                                message = `${resData.message}，剩余尝试次数：${resData.remainingAttempts}`;
                            } else if (resData.message) {
                                message = resData.message;
                            }
                        }
                    }
                    setErrorMessage(message);
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
                <TouchableOpacity style={[styles.registerButton, isRegisterDisabled && styles.disabledButton]} onPress={handleReigster} disabled={isRegisterDisabled}>
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
        disabledButton: {
        backgroundColor: '#cccccc',
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