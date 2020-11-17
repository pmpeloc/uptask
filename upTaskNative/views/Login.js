import React, { useState } from 'react';
import { View } from 'react-native';
import { Container, Button, Text, H1, Input, Form, Item, Toast } from 'native-base';
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage';
import globalStyles from '../styles/global';

// Apollo
import { gql, useMutation } from '@apollo/client';

const AUTENTICAR_USUARIO = gql`
    mutation autenticarUsuario($input: AutenticarInput) {
        autenticarUsuario(input: $input) {
            token
        }
    }
`;

const Login = () => {

    // State del formulario
    const [email, guardarEmail] = useState('');
    const [password, guardarPassword] = useState('');
    const [mensaje, guardarMensaje] = useState(null);

    // React Navigation
    const navigation = useNavigation();

    // Mutation de Apollo
    const [autenticarUsuario] = useMutation(AUTENTICAR_USUARIO);

    // Cuando el usuario presiona en iniciar sesión
    const handleSubmit = async () => {
        // Validar
        if (email === '' || password === '') {
            // Mostrar error
            guardarMensaje('Todos los campos son obligatorios');
            return;
        }
        try {
            // autenticar el usuario
            const { data } = await autenticarUsuario({
                variables: {
                    input: {
                        email,
                        password
                    }
                }
            });
            const { token } = data.autenticarUsuario;
            // Colocar token en el storage
            await AsyncStorage.setItem('token', token);
            // Redireccionar a proyectos
            navigation.navigate('Proyectos');
        } catch (error) {
            // si hay un error mostrarlo
            guardarMensaje(error.message.replace('GraphQL error: ', ''));
        }
    };

    // Muestra un mensaje toast
    const mostrarAlerta = () => {
        Toast.show({
            text: mensaje,
            buttonText: 'OK',
            duration: 5000
        });
    };

    return (
        <Container style={[{backgroundColor: '#e84347'}, globalStyles.contenedor]}>
            <View style={globalStyles.contenido}>
                <H1 style={globalStyles.titulo}>UpTask</H1>
                <Form>
                    <Item inlineLabel last style={globalStyles.input}>
                        <Input
                            autoCompleteType="email"
                            placeholder="Email"
                            onChangeText={texto => guardarEmail(texto)}
                        />
                    </Item>
                    <Item inlineLabel last style={globalStyles.input}>
                        <Input
                            secureTextEntry={true}
                            placeholder="Password"
                            onChangeText={texto => guardarPassword(texto)}
                        />
                    </Item>
                </Form>
                <Button
                    square
                    block
                    style={globalStyles.boton}
                    onPress={() => handleSubmit()}
                >
                    <Text style={globalStyles.botonTexto}>Iniciar Sesión</Text>
                </Button>
                <Text 
                    style={globalStyles.enlace}
                    onPress={() => navigation.navigate('CrearCuenta')}
                >
                    Crear Cuenta
                </Text>
                {mensaje && mostrarAlerta()}
            </View>
        </Container>
    );
};
 
export default Login;