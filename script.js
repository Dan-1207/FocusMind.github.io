const estudiantesRegistrados = [
  { nombreCompleto: "mariana builes zea", identidad: "1027954959", grado: "11", grupo: "1" },
  { nombreCompleto: "maria jose guerrero zerpa", identidad: "1047516543", grado: "11", grupo: "1" },
  { nombreCompleto: "cristina turizo palencia", identidad: "1020114195", grado: "11", grupo: "1" },
  { nombreCompleto: "danna marquez palacios", identidad: "1091974877", grado: "11", grupo: "1" }
];

const usuariosInstitucionales = [
  { nombreCompleto: "javier gil", identidad: "1234567890", rol: "Docente", materia: "Media tecnica" },
  { nombreCompleto: "ignacio arias", identidad: "1098765432", rol: "Directivo", cargo: "Coordinador/a" },
  { nombreCompleto: "milena ruiz", identidad: "1022334455", rol: "Directivo", cargo: "Rector/a" }
];

function ocultarTodasLasSecciones() {
  const secciones = [
    'bienvenida', 'selectorRol', 'mainContainer',
    'mainDocente', 'mainDirectivo',
    'panelEstudiante', 'panelInstitucional'
  ];
  secciones.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

function mostrarSelectorRol() {
  ocultarTodasLasSecciones();
  document.getElementById('selectorRol').style.display = 'flex';
  document.getElementById('botonCerrarSesion').style.display = 'none';
}

function elegirRol(rol) {
  ocultarTodasLasSecciones();
  if (rol === "Estudiante") {
    document.getElementById('mainContainer').style.display = 'flex';
  } else if (rol === "Docente") {
    document.getElementById('mainDocente').style.display = 'flex';
  } else if (rol === "Directivo") {
    document.getElementById('mainDirectivo').style.display = 'flex';
  }
}

function cerrarSesion() {
  localStorage.clear();
  ocultarTodasLasSecciones();
  document.getElementById("bienvenida").style.display = "flex";
  document.getElementById("botonCerrarSesion").style.display = "none";
  window.scrollTo(0, 0);
}

function iniciarSesion() {
  const nombre = document.getElementById("nombre").value.trim().toLowerCase();
  const contrasena = document.getElementById("contrasena").value.trim();

  const estudiante = estudiantesRegistrados.find(est =>
    est.nombreCompleto.toLowerCase() === nombre && est.identidad === contrasena
  );

  if (estudiante) {
    localStorage.setItem("nombre", estudiante.nombreCompleto);
    localStorage.setItem("grado", estudiante.grado);
    localStorage.setItem("grupo", estudiante.grupo);
    localStorage.setItem("institucionalRol", "Estudiante");
    mostrarPerfilEstudiante(estudiante.nombreCompleto);
  } else {
    alert("Nombre o número de identidad incorrecto.");
  }
}
function toggleIdentidad(idCampo) {
  const campo = document.getElementById(idCampo);
  campo.type = campo.type === "password" ? "text" : "password";
}

function iniciarSesionInstitucional() {
  let nombre = "", identidad = "", rol = "";

  if (document.getElementById("mainDocente").style.display === "flex") {
    nombre = document.getElementById("nombreDocente").value.trim().toLowerCase();
    identidad = document.getElementById("identidadDocente").value.trim();
    rol = "Docente";
  }

  if (document.getElementById("mainDirectivo").style.display === "flex") {
    nombre = document.getElementById("nombreDirectivo").value.trim().toLowerCase();
    identidad = document.getElementById("identidadDirectivo").value.trim();
    rol = "Directivo";
  }

  const usuario = usuariosInstitucionales.find(u =>
    u.nombreCompleto.toLowerCase() === nombre && u.identidad === identidad && u.rol === rol
  );

  if (usuario) {
    localStorage.setItem("institucionalNombre", usuario.nombreCompleto);
    localStorage.setItem("institucionalRol", usuario.rol);
    localStorage.setItem("institucionalDato", usuario.rol === "Docente" ? usuario.materia : usuario.cargo);
    mostrarDashboardInstitucional();
  } else {
    alert("Nombre o número de identidad incorrecto para el rol seleccionado.");
  }
}

function mostrarPerfilEstudiante(nombre) {
  ocultarTodasLasSecciones();
  document.getElementById("panelEstudiante").style.display = "block";
  document.getElementById("barraSuperior").style.display = "flex";

  // Mostrar datos del estudiante
  const estudiante = estudiantesRegistrados.find(est => est.nombreCompleto === nombre);
  const grado = estudiante ? estudiante.grado : "";
  const grupo = estudiante ? estudiante.grupo : "";

  document.getElementById("estudianteNombre").textContent = nombre;
  document.getElementById("estudianteGrado").textContent = grado;
  document.getElementById("estudianteGrupo").textContent = grupo;

  cargarFotoPerfil(nombre, document.getElementById("fotoPerfilEstudiante"));

  // Obtener faltas
  const faltas = obtenerFaltas(nombre);
  const contenedor = document.getElementById("historialEstudiante");
  contenedor.innerHTML = "";

  // Detectar rol y si es otro perfil
  const rol = localStorage.getItem("institucionalRol");
  const esDocente = rol === "Docente";
  const esDirectivo = rol === "Directivo";
  const esEstudiante = rol === "Estudiante";
  const usuarioActual = localStorage.getItem("institucionalNombre") || localStorage.getItem("nombre");
  const esOtroPerfil = usuarioActual !== nombre;

  // Mostrar historial de faltas
  if (faltas.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.className = "tarjeta-falta sin-faltas";
    mensaje.innerHTML = `<p><strong>Aún no se han registrado faltas para este estudiante.</strong></p>`;
    contenedor.appendChild(mensaje);
  } else {
    faltas.forEach((falta, index) => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-falta";
      tarjeta.innerHTML = `
        <p><strong>Fecha:</strong> ${falta.fecha}</p>
        <p><strong>Motivo:</strong> ${falta.descripcion}</p>
        <p><strong>Profesor:</strong> ${falta.profesor}</p>
        <p><strong>Estado:</strong> ${falta.estado}</p>
      `;

      // Mostrar botón de editar si corresponde
      if  ((esDocente || esDirectivo) && falta.estado === "No solucionado") {
        const botonEditar = document.createElement("button");
        botonEditar.textContent = "Marcar como cumplida";
        botonEditar.className = "btn";
        botonEditar.onclick = () => editarEstadoFaltaCumplida(nombre, index);
        tarjeta.appendChild(botonEditar);
      }
      contenedor.appendChild(tarjeta);
    });
  }

  // Mostrar botón de agregar falta solo a institucionales viendo otro perfil
  if ((esDocente || esDirectivo) && esOtroPerfil) {
    const botonAgregar = document.createElement("button");
    botonAgregar.textContent = "Agregar falta";
    botonAgregar.className = "btn";
    botonAgregar.onclick = () => agregarFalta(nombre);
    contenedor.appendChild(botonAgregar);
  }
}

function editarEstadoFaltaCumplida(nombreEstudiante, indexFalta) {
  const faltas = obtenerFaltas(nombreEstudiante);
  const falta = faltas[indexFalta];

  if (falta.estado === "Cumplida") {
    alert("Esta falta ya está marcada como cumplida.");
    return;
  }

  const confirmar = confirm("¿Deseas marcar esta falta como cumplida?");
  if (!confirmar) return;

  falta.estado = "Cumplida";
  localStorage.setItem(`faltas_${nombreEstudiante}`, JSON.stringify(faltas));
  mostrarPerfilEstudiante(nombreEstudiante);
}

function mostrarDashboardInstitucional() {
  ocultarTodasLasSecciones();
  document.getElementById("panelInstitucional").style.display = "block";
  document.getElementById("barraSuperior").style.display = "flex";

  const nombre = localStorage.getItem("institucionalNombre");
  const rol = localStorage.getItem("institucionalRol");
  const dato = localStorage.getItem("institucionalDato");

  document.getElementById("institucionalNombre").textContent = nombre;
  document.getElementById("institucionalRol").textContent = rol;
  document.getElementById("institucionalDato").textContent = dato;

  cargarFotoPerfil(nombre, document.getElementById("fotoPerfilInstitucional"));
  mostrarFaltasReportadasPorInstitucional();

}

function buscarEstudiantes() {
  const nombre = document.getElementById("nombreBuscar").value.trim().toLowerCase();
  const grado = document.getElementById("gradoBuscar").value;
  const grupo = document.getElementById("grupoBuscar").value;

  const resultados = estudiantesRegistrados.filter(est => {
    const coincideNombre = nombre ? est.nombreCompleto.toLowerCase().includes(nombre) : true;
    const coincideGrado = grado ? est.grado === grado : true;
    const coincideGrupo = grupo ? est.grupo === grupo : true;
    return coincideNombre && coincideGrado && coincideGrupo;
  });

  const lista = document.getElementById("listaEstudiantes");
  lista.innerHTML = "";

  if (resultados.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.className = "tarjeta-falta sin-faltas";
    mensaje.textContent = "No se encontraron estudiantes con esos criterios.";
    lista.appendChild(mensaje);
    return;
  }

  resultados.forEach(est => {
    const item = document.createElement("div");
    item.className = "tarjeta-falta";
    item.innerHTML = `
      <p><strong>Nombre:</strong> ${est.nombreCompleto}</p>
      <p><strong>Grado:</strong> ${est.grado}</p>
      <p><strong>Grupo:</strong> ${est.grupo}</p>
    `;
    item.onclick = () => mostrarPerfilEstudiante(est.nombreCompleto);
    lista.appendChild(item);
  });
}

const lista = document.getElementById("listaEstudiantes");
lista.innerHTML = "";

resultados.forEach(est => {
  const item = document.createElement("div");
  item.className = "tarjeta-falta";
  item.textContent = est.nombreCompleto;
  item.onclick = () => verPerfilEstudiante(est.nombreCompleto);
  lista.appendChild(item);
});

function verPerfilEstudiante(nombreBuscado) {
  const estudiante = estudiantesRegistrados.find(est => est.nombreCompleto === nombreBuscado);
  if (!estudiante) return;

  mostrarPerfilEstudiante(estudiante.nombreCompleto);
}

function obtenerFaltas(nombreEstudiante) {
  return JSON.parse(localStorage.getItem(`faltas_${nombreEstudiante}`)) || [];
}

function agregarFalta(nombreEstudiante) {
  const contenedor = document.getElementById("historialEstudiante");

  const formulario = document.createElement("div");
  formulario.className = "formulario-falta";
  formulario.innerHTML = `
    <h4>Nueva falta</h4>
    <textarea id="descripcionFalta" placeholder="Motivo de la falta"></textarea>
    <input type="text" id="profesorFalta" placeholder="Profesor que reporta">
    <button class="btn" onclick="guardarFalta('${nombreEstudiante}')">Guardar falta</button>
  `;
  contenedor.appendChild(formulario);
}

function guardarFalta(nombreEstudiante) {
  const descripcion = document.getElementById("descripcionFalta").value.trim();
  const profesor = localStorage.getItem("institucionalNombre"); // ← cambio aquí

  if (!descripcion || !profesor) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const nuevaFalta = {
    fecha: new Date().toLocaleDateString(),
    descripcion,
    profesor,
    estado: "No solucionado"
  };

  const faltas = obtenerFaltas(nombreEstudiante);
  faltas.push(nuevaFalta);
  localStorage.setItem(`faltas_${nombreEstudiante}`, JSON.stringify(faltas));

  mostrarPerfilEstudiante(nombreEstudiante);
}

function mostrarFaltasReportadasPorInstitucional() {
  const nombreInstitucional = localStorage.getItem("institucionalNombre");
  const contenedor = document.getElementById("listaEstudiantes");
  contenedor.innerHTML = "";

  let totalFaltas = 0;

  estudiantesRegistrados.forEach(est => {
    const faltas = obtenerFaltas(est.nombreCompleto);
    const faltasReportadas = faltas.filter(f => f.profesor === nombreInstitucional);

    if (faltasReportadas.length > 0) {
      const bloque = document.createElement("div");
      bloque.className = "tarjeta-falta";
      bloque.innerHTML = `<h4>${est.nombreCompleto}</h4>`;

      faltasReportadas.forEach(falta => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-falta";
        tarjeta.innerHTML = `
          <p><strong>Fecha:</strong> ${falta.fecha}</p>
          <p><strong>Motivo:</strong> ${falta.descripcion}</p>
          <p><strong>Estado:</strong> ${falta.estado}</p>
        `;
        bloque.appendChild(tarjeta);
      });

      contenedor.appendChild(bloque);
      totalFaltas += faltasReportadas.length;
    }
  });

  if (totalFaltas === 0) {
    const mensaje = document.createElement("div");
    mensaje.className = "tarjeta-falta sin-faltas";
    mensaje.textContent = "No has reportado ninguna falta aún.";
    contenedor.appendChild(mensaje);
  }
}


function editarEstadoFaltaCumplida(nombreEstudiante, indexFalta) {
  const faltas = obtenerFaltas(nombreEstudiante);
  const falta = faltas[indexFalta];

  if (falta.estado === "Cumplida") {
    alert("Esta falta ya está marcada como cumplida.");
    return;
  }

  const confirmar = confirm("¿Deseas marcar esta falta como cumplida?");
  if (!confirmar) return;

  falta.estado = "Cumplida";
  localStorage.setItem(`faltas_${nombreEstudiante}`, JSON.stringify(faltas));
  mostrarPerfilEstudiante(nombreEstudiante);
}

function cargarFotoPerfil(nombre, elementoImg) {
  if (!nombre) {
    elementoImg.src = "imgperfiles_default.png";
    return;
  }

  const nombreNormalizado = nombre.toLowerCase().replace(/\s+/g, "-");
  const ruta = `imgperfiles_${nombreNormalizado}.png`;

  elementoImg.onerror = () => {
    elementoImg.src = "imgperfiles_default.png";
  };

  elementoImg.src = ruta;
}