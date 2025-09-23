// RUTA: backend/src/models/User.js
import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    rol: { type: DataTypes.ENUM('usuario', 'admin'), allowNull: false, defaultValue: 'usuario' },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true, validate: { isEmail: true } },
    telefono: { type: DataTypes.STRING(30) },
    passwordHash: { type: DataTypes.STRING(120), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true }
  });

  // Métodos de instancia para password
  User.prototype.setPassword = async function (plain) {
    this.passwordHash = await bcrypt.hash(plain, 10);
  };

  User.prototype.validatePassword = async function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
  };

  return User;
};
