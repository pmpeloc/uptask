const Usuario = require('../models/Usuario');
const Proyecto = require('../models/Proyecto');
const Tarea = require('../models/Tarea');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});

// Crea y firma un JWT
const crearToken = (usuario, secreta, expiresIn) => {  
  const { id, email } = usuario;
  return jwt.sign({id, email}, secreta, {expiresIn});
};

const resolvers = {
  Query: {
    obtenerProyectos: async (_, {}, ctx) => {
      const proyectos = await Proyecto.find({creador: ctx.usuario.id});
      return proyectos;
    },
    obtenerTareas: async (_, {input}, ctx) => {
      const tareas = await Tarea.find({creador: ctx.usuario.id}).where('proyecto').equals(input.proyecto);
      return tareas;
    }
  },
  Mutation: {
    // USUARIOS
    crearUsuario: async (_, {input}) => {
      const { email, password } = input;
      const existeUsuario = await Usuario.findOne({email});
      // Si el usuario existe
      if (existeUsuario) {
        throw new Error('El usuario ya está registrado');
      }
      // Guardar el nuevo usuario
      try {
        // Hashear password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);            

        // Registrar el nuevo usuario
        const nuevoUsuario = new Usuario(input);
        nuevoUsuario.save();
        return 'Usuario creado correctamente.';
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_, {input}) => {
      const { email, password } = input;
      // Si el usuario existe
      const existeUsuario = await Usuario.findOne({email});
      // Si el usuario no existe
      if (!existeUsuario) {
        throw new Error('No existe ningún usuario registrado con el email: ' + email);
      }
      // Si el password es correcto
      const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
      console.log(passwordCorrecto);
      // Si el password no es correcto
      if (!passwordCorrecto) {
        throw new Error('El password no es correcto');
      }
      // Dar acceso a al App
      return {
        token: crearToken(existeUsuario, process.env.SECRETA, '2hr')
      }
    },
    // PROYECTOS
    nuevoProyecto: async (_, {input}, ctx) => {      
      try {
        const proyecto = new Proyecto(input);
        // asociar el creador
        proyecto.creador = ctx.usuario.id;
        // almacenar en la BD
        const resultado = await proyecto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProyecto: async (_, {id, input}, ctx) => {
      // revisar si el proyecto existe o no
      let proyecto = await Proyecto.findById(id);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }
      // verificar que la persona que lo esta editando es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes los permisos para editar este proyecto');
      }
      // guardar el proyecto
      proyecto = await Proyecto.findOneAndUpdate({_id: id}, input, {new: true});
      return proyecto;
    },
    eliminarProyecto: async (_, {id}, ctx) => {
      // revisar si el proyecto existe o no
      let proyecto = await Proyecto.findById(id);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }
      // verificar que la persona que lo esta eliminando es el creador
      if (proyecto.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes los permisos para eliminar este proyecto');
      }
      // Eliminar el proyecto
      await Proyecto.findOneAndDelete({_id: id});
      return 'Proyecto eliminado exitosamente.';
    },
    // TAREAS
    nuevaTarea: async (_, {input}, ctx) => {
      try {
        const tarea = new Tarea(input);
        tarea.creador = ctx.usuario.id;
        const resultado = await tarea.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarTarea: async (_, {id, input, estado}, ctx) => {
      // Si la tarea existe o no
      let tarea = await Tarea.findById(id);
      if (!tarea) {
        throw new Error('Tarea no encontrada');
      }
      // Si la persona que edita es el creador
      if (tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes los permisos para editar esta tarea');
      }
      // Asignar el estado
      input.estado = true;
      // Guardar y retornar la tarea
      tarea = await Tarea.findOneAndUpdate({_id: id}, input, {new: true});
      return tarea;
    },
    eliminarTarea: async (_, {id}, ctx) => {
      // revisar si la tarea existe o no
      let tarea = await Tarea.findById(id);
      if (!tarea) {
        throw new Error('Tarea no encontrada');
      }
      // verificar que la persona que la esta eliminando es el creador
      if (tarea.creador.toString() !== ctx.usuario.id) {
        throw new Error('No tienes los permisos para eliminar esta tarea');
      }
      // Eliminar la tarea
      await Tarea.findOneAndDelete({_id: id});
      return 'Tarea eliminada exitosamente.';
    }
  }
};

module.exports = resolvers;