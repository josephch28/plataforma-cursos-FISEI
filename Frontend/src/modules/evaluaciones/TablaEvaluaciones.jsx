// src/modules/evaluaciones/TablaEvaluaciones.jsx
function TablaEvaluaciones({ rows, loading, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 min-w-[120px] text-left text-xs font-medium text-gray-500 uppercase">Cédula</th>
            <th className="px-4 py-3 min-w-[80px] text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-4 py-3 min-w-[60px] text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
            <th className="px-4 py-3 min-w-[80px] text-left text-xs font-medium text-gray-500 uppercase">Asistencia</th>
            <th className="px-4 py-3 min-w-[100px] text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((r) => (
            <tr key={r.id_inscripcion} className="hover:bg-gray-50 align-middle">
              <td className="px-4 py-3 text-sm text-gray-900 truncate">{r.cedula_usuario}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.id_curso}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.nota_final ?? '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.asistencia ?? '-'}</td>
              <td className="px-4 py-3 text-sm text-gray-500">{r.estado}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(r)}
                    title="Editar"
                    className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(r.id_inscripcion)}
                    title="Eliminar"
                    className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
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