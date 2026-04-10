export default function ({ redirect }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user) return redirect('/')

  const tipo = user.tipo_usuario || ''
  const rol = user.role?.name || ''
  const allowed = ['Administrador', 'administrador', 'Super Admin']

  if (!allowed.includes(tipo) && !allowed.includes(rol)) {
    return redirect('/')
  }
}