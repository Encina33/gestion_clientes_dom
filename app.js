// ---- Estado ----
let clientes = [];
let clienteEditandoId = null;

// ---- Elementos ----
const form = document.getElementById("formCliente");
const tabla = document.getElementById("tabla");
const mensaje = document.getElementById("mensaje");

const modal = document.getElementById("modal");
const formEditar = document.getElementById("formEditar");
const mensajeEditar = document.getElementById("mensajeEditar");

const temaToggle = document.getElementById("temaToggle");
const btnSubmit = document.getElementById("btnSubmit");
const btnReset = document.getElementById("btnReset");

// ---- Utils ----
function showMsg(el, text, type = "success") {
  el.textContent = text;
  el.className = "";
  el.classList.add("msg-show", type === "success" ? "msg-success" : "msg-error");
  setTimeout(() => el.classList.remove("msg-show"), 2500);
}
function limpiarMensajes() { mensaje.className = ""; mensajeEditar.className = ""; }
function setFieldState(inputEl, errorEl, ok, msg = "") {
  inputEl.classList.remove("error", "valid");
  inputEl.classList.add(ok ? "valid" : "error");
  inputEl.setAttribute("aria-invalid", ok ? "false" : "true");
  errorEl.textContent = ok ? "" : msg;
}

// ---- Reglas ----
// Nombre: letras (incluye acentos), espacios y apóstrofos; min 2
const nombreRegex = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ'´` ]{2,}$/;
// Email: patrón razonable (no RFC completo)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Teléfono: España e internacional (permite +, espacios y guiones). Longitud mínima 7 dígitos
const telRegex = /^\+?\d(?:[\d -]{6,}\d)?$/;

// ---- Validaciones por campo----
function validarNombre(nombre) {
  if (!nombre.trim()) return { ok: false, msg: "El nombre no puede estar vacío." };
  if (!nombreRegex.test(nombre)) return { ok: false, msg: "Usa solo letras y espacios (mín. 2)." };
  return { ok: true };
}
function validarEmailAlta(email) {
  if (!email.trim()) return { ok: false, msg: "El email es obligatorio." };
  if (!emailRegex.test(email)) return { ok: false, msg: "Formato de email inválido." };
  if (clientes.some(c => c.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, msg: "Ese email ya existe. Debe ser único." };
  }
  return { ok: true };
}
function validarTelefono(telefono) {
  if (!telefono.trim()) return { ok: false, msg: "El teléfono es obligatorio." };
  if (!telRegex.test(telefono)) return { ok: false, msg: "Formato de teléfono inválido." };
  return { ok: true };
}

// ---- Validaciones por campo (edición) ----
function validarEmailEdicion(email, idActual) {
  if (!email.trim()) return { ok: false, msg: "El email es obligatorio." };
  if (!emailRegex.test(email)) return { ok: false, msg: "Formato de email inválido." };
  const duplicado = clientes.find(c => c.email.toLowerCase() === email.toLowerCase() && c.id !== idActual);
  if (duplicado) return { ok: false, msg: "Ese email ya lo usa otro cliente." };
  return { ok: true };
}

// ---- Debounce helper ----
function debounce(fn, ms = 200) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// ---- Pintar tabla ----
function pintarTabla() {
  tabla.innerHTML = "";
  if (clientes.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" style="color: var(--muted)">Aún no hay clientes. Añade el primero arriba 👆</td>`;
    tabla.appendChild(tr);
    return;
  }
  clientes.forEach(cliente => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${cliente.nombre}</td>
      <td><span class="badge">${cliente.email}</span></td>
      <td>${cliente.telefono}</td>
      <td>
        <button class="btn ghost" aria-label="Editar ${cliente.nombre}" data-edit="${cliente.id}">Editar</button>
        <button class="btn danger" aria-label="Eliminar ${cliente.nombre}" data-del="${cliente.id}">Eliminar</button>
      </td>
    `;
    tabla.appendChild(tr);
  });
  tabla.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => editar(+btn.dataset.edit)));
  tabla.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => eliminar(+btn.dataset.del)));
}

// ---- Alta ----
form.addEventListener("submit", (e) => {
  e.preventDefault();
  limpiarMensajes();

  const nombreEl = document.getElementById("nombre");
  const emailEl = document.getElementById("email");
  const telEl = document.getElementById("telefono");
  const errNombre = document.getElementById("errNombre");
  const errEmail = document.getElementById("errEmail");
  const errTel = document.getElementById("errTelefono");

  const vNombre = validarNombre(nombreEl.value);
  const vEmail = validarEmailAlta(emailEl.value);
  const vTel = validarTelefono(telEl.value);

  setFieldState(nombreEl, errNombre, vNombre.ok, vNombre.msg);
  setFieldState(emailEl, errEmail, vEmail.ok, vEmail.msg);
  setFieldState(telEl, errTel, vTel.ok, vTel.msg);

  if (!vNombre.ok || !vEmail.ok || !vTel.ok) {
    showMsg(mensaje, "Revisa los campos marcados en rojo.", "error");
    return;
  }

  clientes.push({ id: Date.now(), nombre: nombreEl.value.trim(), email: emailEl.value.trim(), telefono: telEl.value.trim() });
  form.reset();
  btnSubmit.disabled = true; // vuelve a deshabilitar hasta que sea válido de nuevo
  showMsg(mensaje, "Cliente añadido correctamente ✅", "success");
  pintarTabla();
});

// ---- Validación en tiempo real (alta) ----
const rtNombre = debounce(() => {
  const el = document.getElementById("nombre"), err = document.getElementById("errNombre");
  const v = validarNombre(el.value);
  setFieldState(el, err, v.ok, v.msg);
  toggleSubmit();
});
const rtEmail = debounce(() => {
  const el = document.getElementById("email"), err = document.getElementById("errEmail");
  const v = validarEmailAlta(el.value);
  setFieldState(el, err, v.ok, v.msg);
  toggleSubmit();
});
const rtTel = debounce(() => {
  const el = document.getElementById("telefono"), err = document.getElementById("errTelefono");
  const v = validarTelefono(el.value);
  setFieldState(el, err, v.ok, v.msg);
  toggleSubmit();
});

document.getElementById("nombre").addEventListener("input", rtNombre);
document.getElementById("email").addEventListener("input", rtEmail);
document.getElementById("telefono").addEventListener("input", rtTel);

// ---- Reset ----
btnReset.addEventListener("click", () => {
  ["nombre","email","telefono"].forEach(id => {
    const el = document.getElementById(id);
    const err = document.getElementById(id === "nombre" ? "errNombre" : id === "email" ? "errEmail" : "errTelefono");
    setFieldState(el, err, true, "");
    el.classList.remove("valid", "error");
    el.setAttribute("aria-invalid", "false");
  });
  btnSubmit.disabled = true;
  limpiarMensajes();
});

// ---- Habilitar/deshabilitar submit ----
function toggleSubmit() {
  const n = document.getElementById("nombre").classList.contains("valid");
  const e = document.getElementById("email").classList.contains("valid");
  const t = document.getElementById("telefono").classList.contains("valid");
  btnSubmit.disabled = !(n && e && t);
}

// ---- Eliminar ----
function eliminar(id) {
  clientes = clientes.filter(c => c.id !== id);
  pintarTabla();
  showMsg(mensaje, "Cliente eliminado 🗑️", "success");
}

// ---- Editar ----
function editar(id) {
  const c = clientes.find(x => x.id === id);
  if (!c) return;
  clienteEditandoId = id;

  document.getElementById("editNombre").value = c.nombre;
  document.getElementById("editEmail").value = c.email;
  document.getElementById("editTelefono").value = c.telefono;

  // Limpiar errores previos
  ["errEditNombre","errEditEmail","errEditTelefono"].forEach(id => document.getElementById(id).textContent = "");
  ["editNombre","editEmail","editTelefono"].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove("valid","error");
    el.setAttribute("aria-invalid","false");
  });

  // Abrir modal
  if (typeof modal.showModal === "function") modal.showModal();
  else modal.setAttribute("open", "");
}

// ---- Validación en tiempo real (edición) ----
document.getElementById("editNombre").addEventListener("input", debounce(() => {
  const el = document.getElementById("editNombre");
  const err = document.getElementById("errEditNombre");
  const v = validarNombre(el.value);
  setFieldState(el, err, v.ok, v.msg);
}));

document.getElementById("editEmail").addEventListener("input", debounce(() => {
  const el = document.getElementById("editEmail");
  const err = document.getElementById("errEditEmail");
  const v = validarEmailEdicion(el.value, clienteEditandoId);
  setFieldState(el, err, v.ok, v.msg);
}));

document.getElementById("editTelefono").addEventListener("input", debounce(() => {
  const el = document.getElementById("editTelefono");
  const err = document.getElementById("errEditTelefono");
  const v = validarTelefono(el.value);
  setFieldState(el, err, v.ok, v.msg);
}));

// ---- Guardar edición ----
formEditar.addEventListener("submit", (e) => {
  e.preventDefault();
  limpiarMensajes();

  const nombreEl = document.getElementById("editNombre");
  const emailEl = document.getElementById("editEmail");
  const telEl = document.getElementById("editTelefono");

  const vNombre = validarNombre(nombreEl.value);
  const vEmail = validarEmailEdicion(emailEl.value, clienteEditandoId);
  const vTel = validarTelefono(telEl.value);

  setFieldState(nombreEl, document.getElementById("errEditNombre"), vNombre.ok, vNombre.msg);
  setFieldState(emailEl, document.getElementById("errEditEmail"), vEmail.ok, vEmail.msg);
  setFieldState(telEl, document.getElementById("errEditTelefono"), vTel.ok, vTel.msg);

  if (!vNombre.ok || !vEmail.ok || !vTel.ok) {
    showMsg(mensajeEditar, "Corrige los errores antes de guardar.", "error");
    return;
  }

  const idx = clientes.findIndex(c => c.id === clienteEditandoId);
  if (idx !== -1) {
    clientes[idx] = {
      ...clientes[idx],
      nombre: nombreEl.value.trim(),
      email: emailEl.value.trim(),
      telefono: telEl.value.trim()
    };
  }

  if (typeof modal.close === "function") modal.close();
  else modal.removeAttribute("open");

  showMsg(mensaje, "Cambios guardados ✨", "success");
  pintarTabla();
});

// ---- Cancelar edición ----
document.getElementById("cancelar").addEventListener("click", () => {
  if (typeof modal.close === "function") modal.close();
  else modal.removeAttribute("open");
});

// ---- Tema claro/oscuro ----
function updateThemeIcon() {
  temaToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
}
(function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved === "light") document.body.classList.add("light");
  updateThemeIcon();
})();
temaToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
  updateThemeIcon();
});

// ---- Inicial ----
pintarTabla();

