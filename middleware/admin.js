export default function ({ store, redirect }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  if (!user) {
    return redirect('/')
  }

  const role = user.role?.name || user.roleName || ''
  const allowed = ['administrador', 'Super Admin']

  if (!allowed.includes(role)) {
    return redirect('/')
  }
}