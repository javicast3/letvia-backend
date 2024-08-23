import { log } from 'console';
import mongoose from 'mongoose';
const uri = process.env.MONGO_URI;

if (!uri) throw new Error('Error al conectar con la Base de Datos');

export const dbConnect = () => {
  mongoose
    .connect(uri)
    .then(() => {
      log('Conexion con la DB establecida');
    })
    .catch((error) => {
      log('Error al conectarse a la DB: ', error.message);
    });
};
