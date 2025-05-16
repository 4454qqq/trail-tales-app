import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { api, storeDataToAS } from '../utiles/utile';
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    // 处理限流操作
    const [isLoginDisabled, setIsLoginDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);


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

    // // 处理限流禁用提交按钮的倒计时效果
    // useEffect(() => {
    //     let timer;
    //     if (countdown > 0) {
    //         timer = setTimeout(() => {
    //             setCountdown(countdown - 1);
    //         }, 1000);
    //     } else if (countdown === 0 && isLoginDisabled) {
    //         setIsLoginDisabled(false);
    //         setErrorMessage("");
    //     }
    //     return () => clearTimeout(timer);
    // }, [countdown, isLoginDisabled]);

    // 加载保存的限流状态
    useEffect(() => {
        const loadRateLimitStatus = async () => {
            try {
                const saved = await AsyncStorage.getItem('@login_rate_limit');
                if (saved) {
                    const { expiresAt } = JSON.parse(saved);
                    const remainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));

                    if (remainingSeconds > 0) {
                        setIsLoginDisabled(true);
                        setCountdown(remainingSeconds);
                    } else {
                        await AsyncStorage.removeItem('@login_rate_limit');
                    }
                }
            } catch (e) {
                console.error('加载限流状态失败:', e);
            }
        };

        loadRateLimitStatus();
    }, []);

    // 处理倒计时
    useEffect(() => {
        let loginTimer;
        if (countdown > 0) {
            loginTimer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(loginTimer);
                        setIsLoginDisabled(false);
                        setErrorMessage("")
                        AsyncStorage.removeItem('@login_rate_limit');
                        return 0;
                    }
                    else{
                        setErrorMessage("操作频繁")
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(loginTimer);
    }, [countdown]);

    // 保存限流状态
    const saveRateLimitStatus = async (retryAfterSeconds) => {
        const expiresAt = Date.now() + (retryAfterSeconds * 1000);
        try {
            await AsyncStorage.setItem('@login_rate_limit', JSON.stringify({ expiresAt }));
            setIsLoginDisabled(true);
            setCountdown(retryAfterSeconds);
        } catch (e) {
            console.error('保存限流状态失败:', e);
        }
    };

    // 格式化时间显示
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}小时${minutes}分${secs}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        }
        return `${secs}秒`;
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
                .catch(async (err) => {
                    console.log(err);
                    console.log("提交失败:", err.response.data.message);
                    // 默认错误信息
                    let message = "登录失败，请稍后再试";

                    if (err.response) {
                        const resData = err.response.data;

                        if (resData.status === "error") {
                            // 限流提示
                            if (err.response.status === 429 && resData.retryAfter) {
                                // const mins = Math.ceil(resData.retryAfter / 60);
                                // message = `${resData.message}，请在 ${mins} 分钟后再试`;
                                // setIsLoginDisabled(true);
                                // setCountdown(resData.retryAfter);                              
                                await saveRateLimitStatus(Math.ceil(resData.retryAfter / 60) * 60);
                                message = '操作频繁';
                            }
                            // 登录失败提示，包含剩余尝试次数
                            else if (resData.message && resData.remainingAttempts !== undefined) {
                                message = `${resData.message}，剩余尝试次数：${resData.remainingAttempts - 1}`;
                            } else if (resData.message) {
                                message = resData.message;
                            }
                        }
                    }

                    setErrorMessage(message);
                    // setErrorMessage(err.response.data.message);
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
                <View style={{ ...styles.inputWrapper, marginBottom: 10 }}>
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
                <View style={{ alignItems: "center", marginBottom: 10 }}>
                    <Text style={{ color: "red" }}>{errorMessage}
                        {isLoginDisabled && countdown > 0 &&
                            ` (${formatTime(countdown)}后重试)`}</Text>
                </View>

                {/* 登录按钮 */}
                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        isLoginDisabled && styles.disabledButton
                    ]}
                    onPress={handleLogin}
                    disabled={isLoginDisabled}
                >
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
    disabledButton: {
        backgroundColor: '#cccccc',
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