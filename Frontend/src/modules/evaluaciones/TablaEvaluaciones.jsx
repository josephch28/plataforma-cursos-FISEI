// src/modules/evaluaciones/TablaEvaluaciones.jsx
function TablaEvaluaciones({ rows, loading, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* ... Thead code (lines 5-13) ... */}
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((r) => {
            
            // 🟢 1. Lógica de restricción de edición
            const userRole = r.usuario_rol_en_curso;
            // Solo se permite editar al Docente Principal o a los Encargados
            const canEdit = userRole === 'docente_principal' || userRole === 'encargado';

            return (
              <tr key={r.id_inscripcion} className="hover:bg-gray-50 align-middle">
                <td className="px-4 py-3 text-sm text-gray-900 truncate">
                  {r.usuario_nombre && r.usuario_apellido
                    ? `${r.usuario_nombre} ${r.usuario_apellido} (${r.cedula_usuario})`
                    : r.cedula_usuario}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {r.curso_nombre || r.id_curso}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.nota_final ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.asistencia ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.estado}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(r)}
                      title={canEdit ? "Editar" : `Rol ${userRole} no puede editar`}
                      // 🟢 2. Aplicar las restricciones de estilo y lógica
                      disabled={!canEdit}
                      className={`p-2 rounded bg-blue-600 text-white transition 
                        ${canEdit ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* ... onDelete Button code ... */}
                  </div>
                </td>
              </tr>
            );
          })}
          {!rows.length && !loading && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                Sin resultados
              </td>
            </tr>
          )}
          {loading && (
            <tr>
              <td className="px-4 py-8 text-center text-gray-500" colSpan={6}>
                Buscando...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TablaEvaluaciones;