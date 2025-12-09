// src/modules/evaluaciones/TablaEvaluaciones.jsx
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

function TablaEvaluaciones({ rows, loading, onEdit, onDelete, isEditing, editedData, onRowChange, courseStatus }) {
  const { user } = useAuth();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estudiante</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Nota (0-10)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Asistencia %</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((r) => {
            const userRole = r.usuario_rol_en_curso;
            const canEdit = (user?.rol === 'admin' || userRole === 'docente_principal' || userRole === 'encargado') && courseStatus !== 'finalizado';

            // Get current editing values or fall back to original
            const currentNota = editedData?.[r.id_inscripcion]?.nota_final ?? r.nota_final ?? '';
            const currentAsis = editedData?.[r.id_inscripcion]?.asistencia ?? r.asistencia ?? '';

            return (
              <tr key={r.id_inscripcion} className="hover:bg-gray-50 align-middle">
                <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">
                  {r.usuario_nombre && r.usuario_apellido
                    ? `${r.usuario_nombre} ${r.usuario_apellido} (${r.cedula_usuario})`
                    : r.cedula_usuario}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {r.curso_nombre || r.id_curso}
                </td>

                {/* NOTA */}
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {isEditing && canEdit ? (
                    <input
                      type="number"
                      min="0" max="10" step="0.01"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={currentNota}
                      onChange={(e) => onRowChange(r.id_inscripcion, 'nota_final', e.target.value)}
                    />
                  ) : (
                    currentNota || '-'
                  )}
                </td>

                {/* ASISTENCIA */}
                <td className="px-6 py-4 text-sm text-gray-500">
                  {isEditing && canEdit ? (
                    <input
                      type="number"
                      min="0" max="100"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={currentAsis}
                      onChange={(e) => onRowChange(r.id_inscripcion, 'asistencia', e.target.value)}
                    />
                  ) : (
                    currentAsis ? `${currentAsis}%` : '-'
                  )}
                </td>

                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.estado === 'aprobado' ? 'bg-green-100 text-green-800' :
                    r.estado === 'reprobado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                    {r.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* Hide individual edit button if in bulk edit mode */}
                    {!isEditing && (
                      <button
                        onClick={() => onEdit(r)}
                        title={canEdit ? "Editar Individual" : `Rol ${userRole} no puede editar`}
                        disabled={!canEdit}
                        className={`p-2 rounded bg-blue-600 text-white transition 
                          ${canEdit ? 'hover:bg-blue-700 shadow-sm' : 'opacity-50 cursor-not-allowed'}
                        `}
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
                    )}

                    {/* Delete button only for admin, regardless of edit mode usually, but maybe hide during edit? keep it. */}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(r.id_inscripcion)}
                        className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition"
                        title="Eliminar"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {!rows.length && !loading && (
            <tr>
              <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                Sin resultados
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td className="px-6 py-8 text-center text-gray-500" colSpan={6}>
                <div className="flex justify-center items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Cargando...
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaEvaluaciones;