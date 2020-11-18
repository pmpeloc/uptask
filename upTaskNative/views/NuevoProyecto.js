import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { Container, Button, Text, H1, Form, Item, Input, Toast } from 'native-base';
import { gql, useMutation } from '@apollo/client';
import globalStyles from '../styles/global';

const NUEVO_PROYECTO = gql`
    mutation nuevoProyecto($input: ProyectoInput) {
        nuevoProyecto(input: $input) {
            nombre
            id
        }
    }
`;

// Actualizar el cache
const OBTENER_PROYECTOS = gql`
    query obtenerProyectos {
        obtenerProyectos {
            id
            nombre
        }
    }
`;

const NuevoProyecto = () => {

    // Navigation
    const navigation = useNavigation();

    // State del formulario
    const [mensaje, guardarMensaje] = useState(null);
    const [nombre, guardarNombre] = useState('');

    // Apollo
    const [nuevoProyecto] = useMutation(NUEVO_PROYECTO, {
        update(cache, {data: {nuevoProyecto}}) {
            const { obtenerProyectos } = cache.readQuery({query: OBTENER_PROYECTOS})
            cache.writeQuery({
                query: OBTENER_PROYECTOS,
                data: {obtenerProyectos: obtenerProyectos.concat([nuevoProyecto])}
            });
        }
    });

    // Validar crear proyecto
    const handleSubmit = async () => {
        if (nombre === '') {
            guardarMensaje('El Nombre del Proyecto es obligatorio');
            return;
        }
        // Guardar el proyecto en la BD
        try {
            const { data } = await nuevoProyecto({
                variables: {
                    input: {
                        nombre
                    }
                }
            });
            guardarMensaje('¡Proyecto creado exitosamente!');
            navigation.navigate('Proyectos');
        } catch (error) {
            // console.log(error);
            guardarMensaje(error.message.replace('GraphQL error:', ''));
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
        <Container style={[globalStyles.contenedor, {backgroundColor: '#e84347'}]}>        
            <View style={globalStyles.contenido}>
                <H1 style={globalStyles.subtitulo}>Nuevo Proyecto</H1>
                <Form>
                    <Item inlineLabel last style={globalStyles.input}>
                        <Input
                            placeholder="Nombre del Proyecto"
                            onChangeText={texto => guardarNombre(texto)}
                        />
                    </Item>
                </Form>
                <Button
                    style={[globalStyles.boton, {marginTop: 30}]}
                    square
                    block
                    onPress={() => handleSubmit()}
                >
                <Text style={globalStyles.botonTexto}>Crear Proyecto</Text>
            </Button>
            {mensaje && mostrarAlerta()}
            </View>                
        </Container>
    );
}
 
export default NuevoProyecto;