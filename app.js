// ---- Estado ----
let clientes = [];
let clienteEditandoId = null;

// ---- elementos ----
const form = document.getElementById("formCliente");
const tabla = document.getElementById("tablaClientes");
const modal = document.getElementById("modal");
const formEditar = document.getElementById("formEditar");
const mensajeEditar = document.getElementById("mensajeEditar");
const btnSubmit = document.getElementById("btnSubmit");

// ---- reglas ----
const nombreRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'´` ]{2,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const telRegex = /^\+?\d(?:[\d -]{6,}\d)?$/;

// ---- validaciones ----
function validarNombre(nombre) {
  if (!nombre.trim()) return { ok: false, msg: "El nombre no puede estar vacío." };
  if (!nombreRegex.test(nombre)) return { ok: false, msg: "Usa solo letras y espacios (mín. 2)." };
  return { ok: true };
}

// ---- validación de email de alta ----
function validarEmailAlta(email) {
  if (!email.trim()) return { ok: false, msg: "El email es obligatorio." };
  if (!emailRegex.test(email)) return { ok: false, msg: "Formato de email inválido." };
  if (clientes.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, msg: "Ese email ya existe. Debe ser único." };
  }
  return { ok: true };
}

// ---- validación de teléfono ----
function validarTelefono(telefono) {
  if (!telefono.trim()) return { ok: false, msg: "El teléfono es obligatorio." };
  if (!telRegex.test(telefono)) return { ok: false, msg: "Formato de teléfono inválido." };
  return { ok: true };
}

// ---- validación de email de edición ----
function validarEmailEdicion(email, idActual) {
  if (!email.trim()) return { ok: false, msg: "El email es obligatorio." };
  if (!emailRegex.test(email)) return { ok: false, msg: "Formato de email inválido." };
  const duplicado = clientes.find(c => c.email.toLowerCase() === email.toLowerCase() && c.id !== idActual);
  if (duplicado) return { ok: false, msg: "Ese email ya lo usa otro cliente." };
  return { ok: true };
}

// ---- helpers ----
function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ---- establecer estado de campo ----
function setFieldState(el, errEl, ok, msg) {
  if (ok) {
    el.classList.add("valid");
    el.classList.remove("error");
    el.setAttribute("aria-invalid", "false");
    errEl.textContent = "";
  } else {
    el.classList.add("error");
    el.classList.remove("valid");
    el.setAttribute("aria-invalid", "true");
    errEl.textContent = msg;
  }
}

// ---- deshabilitar/habilitar botón de envío ----
function toggleSubmit() {
  const n = document.getElementById("nombre").classList.contains("valid");
  const e = document.getElementById("email").classList.contains("valid");
  const t = document.getElementById("telefono").classList.contains("valid");
  btnSubmit.disabled = !(n && e && t);
}

// ---- mostrar mensaje ----
function showMsg(target, text, type) {
  target.textContent = text;
  target.className = type;
}

// ---- limpiar mensajes ----
function limpiarMensajes() {
  mensajeEditar.textContent = "";
}

// ---- pintar tabla ----
function pintarTabla() {
  tabla.innerHTML = "";

  if (clientes.length === 0) {
    tabla.innerHTML = `<tr><td colspan="5" style="color: var(--muted)">Aún no hay clientes. Añade el primero arriba 👆</td></tr>`;
    return;
  }

  // ---- pintar filas de la tabla ----
  clientes.forEach((cliente, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${cliente.nombre}</td>
      <td><span class="badge">${cliente.email}</span></td>
      <td>${cliente.telefono}</td>
      <td>
        <button class="btn ghost" data-edit="${cliente.id}">Editar</button>
        <button class="btn danger" data-del="${cliente.id}">Eliminar</button>
      </td>
    `;
    tabla.appendChild(tr);
  });

  tabla.querySelectorAll("[data-edit]").forEach(btn =>
    btn.addEventListener("click", () => editar(+btn.dataset.edit))
  );

  tabla.querySelectorAll("[data-del]").forEach(btn =>
    btn.addEventListener("click", () => eliminar(+btn.dataset.del))
  );
}

// ---- alta ----
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombreEl = document.getElementById("nombre");
  const emailEl = document.getElementById("email");
  const telEl = document.getElementById("telefono");

  const vNombre = validarNombre(nombreEl.value);
  const vEmail = validarEmailAlta(emailEl.value);
  const vTel = validarTelefono(telEl.value);

  setFieldState(nombreEl, errNombre, vNombre.ok, vNombre.msg);
  setFieldState(emailEl, errEmail, vEmail.ok, vEmail.msg);
  setFieldState(telEl, errTelefono, vTel.ok, vTel.msg);

  if (!vNombre.ok || !vEmail.ok || !vTel.ok) return;

  clientes.push({
    id: Date.now(),
    nombre: nombreEl.value.trim(),
    email: emailEl.value.trim(),
    telefono: telEl.value.trim()
  });

  form.reset();
  btnSubmit.disabled = true;
  pintarTabla();
});

// ---- validación en tiempo real ----
document.getElementById("nombre").addEventListener("input", debounce(() => {
  const el = nombre, err = errNombre;
  const v = validarNombre(el.value);
  setFieldState(el, err, v.ok, v.msg);
  toggleSubmit();
}));

// ---- validación de email en tiempo real ----
document.getElementById("email").addEventListener("input", debounce(() => {
  const el = email, err = errEmail;
  const v = validarEmailAlta(el.value);
  setFieldState(el, err, v.ok, v.msg);
  toggleSubmit();
}));

// ---- validación de teléfono en tiempo real ----
document.getElementById("telefono").addEventListener("input", debounce(() => {
  const el = telefono, err = errTelefono;
  const v = validarTelefono(el.value);
  setFieldState(el, err, v.ok, v.msg);
  toggleSubmit();
}));

// ---- eliminar cliente ----
function eliminar(id) {
  clientes = clientes.filter(c => c.id !== id);
  pintarTabla();
}

// ---- editar cliente ----
function editar(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;

  clienteEditandoId = id;

  editNombre.value = c.nombre;
  editEmail.value = c.email;
  editTelefono.value = c.telefono;

  ["errEditNombre","errEditEmail","errEditTelefono"].forEach(id => {
    document.getElementById(id).textContent = "";
  });

  if (modal.showModal) modal.showModal();
  else modal.setAttribute("open", "");
}

// ---- validación de nombre en edición ----
editNombre.addEventListener("input", debounce(() => {
  const v = validarNombre(editNombre.value);
  setFieldState(editNombre, errEditNombre, v.ok, v.msg);
}));

editEmail.addEventListener("input", debounce(() => {
  const v = validarEmailEdicion(editEmail.value, clienteEditandoId);
  setFieldState(editEmail, errEditEmail, v.ok, v.msg);
}));

editTelefono.addEventListener("input", debounce(() => {
  const v = validarTelefono(editTelefono.value);
  setFieldState(editTelefono, errEditTelefono, v.ok, v.msg);
}));

// ---- guardar edición ----
formEditar.addEventListener("submit", (e) => {
  e.preventDefault();

  const vNombre = validarNombre(editNombre.value);
  const vEmail = validarEmailEdicion(editEmail.value, clienteEditandoId);
  const vTel = validarTelefono(editTelefono.value);

  setFieldState(editNombre, errEditNombre, vNombre.ok, vNombre.msg);
  setFieldState(editEmail, errEditEmail, vEmail.ok, vEmail.msg);
  setFieldState(editTelefono, errEditTelefono, vTel.ok, vTel.msg);

  if (!vNombre.ok || !vEmail.ok || !vTel.ok) return;

  const idx = clientes.findIndex(c => c.id === clienteEditandoId);
  clientes[idx] = {
    ...clientes[idx],
    nombre: editNombre.value.trim(),
    email: editEmail.value.trim(),
    telefono: editTelefono.value.trim()
  };

  modal.close();
  pintarTabla();
});

// ---- cancelar edición ----
cancelar.addEventListener("click", () => modal.close());

// ---- inicializar ----
pintarTabla();
