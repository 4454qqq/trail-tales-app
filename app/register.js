import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../utiles/utile';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState("");
    const [isRegisterDisabled, setIsRegisterDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // 加载保存的限流状态
    useEffect(() => {
        const loadRateLimitStatus = async () => {
            try {
                const saved = await AsyncStorage.getItem('@register_rate_limit');
                if (saved) {
                    const { expiresAt } = JSON.parse(saved);
                    const remainingSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
                    
                    if (remainingSeconds > 0) {
                        setIsRegisterDisabled(true);
                        setCountdown(remainingSeconds);
                    } else {
                        await AsyncStorage.removeItem('@register_rate_limit');
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
        let registerTimer;
        if (countdown > 0) {
            registerTimer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(registerTimer);
                        setIsRegisterDisabled(false);
                        setErrorMessage("")
                        AsyncStorage.removeItem('@register_rate_limit');
                        return 0;
                    }
                    else{
                        setErrorMessage('注册已上限')
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(registerTimer);
    }, [countdown]);

    // 保存限流状态
    const saveRateLimitStatus = async (retryAfterSeconds) => {
        const expiresAt = Date.now() + (retryAfterSeconds * 1000);
        try {
            await AsyncStorage.setItem('@register_rate_limit', JSON.stringify({ expiresAt }));
            setIsRegisterDisabled(true);
            setCountdown(retryAfterSeconds);
        } catch (e) {
            console.error('保存限流状态失败:', e);
        }
    };

    const handleTotalCheck = () => {
        if (!username) {
            setErrorMessage("用户名不能为空");
            return false;
        } else if (!password) {
            setErrorMessage("密码不能为空");
            return false;
        } else if (confirmPassword !== password) {
            setErrorMessage("两次输入的密码不一致");
            return false;
        }
        setErrorMessage("");
        return true;
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

    const handleRegister = async () => {
        if (handleTotalCheck()) {
            try {
                const res = await api.post("/login/register", {
                    username: username,
                    password: password,
                });
                
                console.log("提交成功:", res.data.message);
                router.push("login");
            } catch (err) {
                console.log("提交失败:", err.response?.data?.message);
                let message = "注册失败，请稍后再试";

                if (err.response) {
                    const resData = err.response.data;

                    if (resData.status === "error") {
                        // 处理限流错误
                        if (err.response.status === 429 && resData.retryAfter) {
                            await saveRateLimitStatus(Math.ceil(resData.retryAfter / 60) * 60);
                            message = '注册已上限';
                        } 
                        // 其他错误
                        else if (resData.message) {
                            message = resData.message;
                        }
                    }
                }
                
                setErrorMessage(message);
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.appName}>Trail Tales Register</Text>

            <View style={styles.formContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请输入用户名"
                        placeholderTextColor="#888"
                        value={username}
                        onChangeText={setUsername}
                        editable={!isRegisterDisabled}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请输入密码"
                        placeholderTextColor="#888"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={true}
                        editable={!isRegisterDisabled}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="请确认密码"
                        placeholderTextColor="#888"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={true}
                        editable={!isRegisterDisabled}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.registerButton, isRegisterDisabled && styles.disabledButton]} 
                    onPress={handleRegister} 
                    disabled={isRegisterDisabled}
                >
                    <Text style={styles.buttonText}>注册</Text>
                </TouchableOpacity>

                <Text style={styles.errorText}>
                    {errorMessage}
                    {isRegisterDisabled && countdown > 0 &&
                        ` (${formatTime(countdown)}后重试)`}
                </Text>
            </View>
        </View>
    );
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
        width: '80%',
        maxWidth: 400,
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