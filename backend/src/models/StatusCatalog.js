// RUTA: backend/src/models/StatusCatalog.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  return sequelize.define('StatusCatalog', {
    code: { type: DataTypes.STRING(40), primaryKey: true },
    label: { type: DataTypes.STRING(120), allowNull: false },
    isFinal: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};
