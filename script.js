
const firebaseConfig = {
  apiKey: "AIzaSyDnj6j9d75BJ0hXCSw5wkkUI31SyYZHTg8",
  authDomain: "mis-notas-e79f7.firebaseapp.com",
  projectId: "mis-notas-e79f7",
  storageBucket: "mis-notas-e79f7.firebasestorage.app",
  messagingSenderId: "373191322131",
  appId: "1:373191322131:web:ed903ad5e4d934b630ade6",
  measurementId: "G-JXVZJCEBPM"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ==========================================
// ELEMENTOS DEL DOM
// ==========================================

const authSection = document.getElementById('auth-section');
const notesSection = document.getElementById('notes-section');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const alertContainer = document.getElementById('alert-container');
const notesContainer = document.getElementById('notes-container');
const notesLoading = document.getElementById('notes-loading');

// Botones
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const addNoteBtn = document.getElementById('add-note-btn');

// Campos de entrada
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');

// ==========================================
// VARIABLES GLOBALES
// ==========================================

let currentUser = null;

// ==========================================
// FUNCIONES DE UTILIDAD
// ==========================================

function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function formatDate(timestamp) {
    if (!timestamp) return 'Fecha no disponible';
    
    return new Date(timestamp.toDate()).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==========================================
// FUNCIONES DE AUTENTICACIÓN
// ==========================================

async function loginUser() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAlert('Por favor completa todos los campos');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Por favor ingresa un email válido');
        return;
    }

    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'Iniciando...';
        
        await auth.signInWithEmailAndPassword(email, password);
        showAlert('¡Inicio de sesión exitoso!', 'success');
        
        emailInput.value = '';
        passwordInput.value = '';
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        handleAuthError(error);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Iniciar Sesión';
    }
}

async function registerUser() {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAlert('Por favor completa todos los campos');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Por favor ingresa un email válido');
        return;
    }

    if (password.length < 6) {
        showAlert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        registerBtn.disabled = true;
        registerBtn.textContent = 'Registrando...';
        
        console.log('Iniciando registro para:', email);
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('Usuario creado en Auth:', userCredential.user.uid);
        
        // Crear documento de usuario en la estructura existente
        await createUserDocument(userCredential.user);
        
        showAlert('¡Registro exitoso! Bienvenido/a', 'success');
        
        emailInput.value = '';
        passwordInput.value = '';
        
    } catch (error) {
        console.error('Error completo al registrarse:', error);
        handleAuthError(error);
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Registrarse';
    }
}

async function createUserDocument(user) {
    try {
        console.log('Creando documento para usuario:', user.uid);
        
        const userName = user.email.split('@')[0];
        
        const userData = {
            nombre: userName,
            email: user.email,
            rol: 'Estudiante'
        };
        
        console.log('Datos del usuario a guardar:', userData);
        
        await db.collection('usuarios').doc(user.uid).set(userData);
        
        console.log('✅ Documento de usuario creado exitosamente');
        
        // Verificar que se creó correctamente
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        if (userDoc.exists) {
            console.log('✅ Verificación: documento existe en Firestore');
            console.log('Datos guardados:', userDoc.data());
        } else {
            console.error('❌ Error: documento no encontrado después de crearlo');
        }
        
    } catch (error) {
        console.error('❌ Error detallado al crear documento de usuario:', error);
        console.error('Código de error:', error.code);
        console.error('Mensaje:', error.message);
        showAlert('Error al crear perfil de usuario: ' + error.message);
    }
}

async function logoutUser() {
    try {
        await auth.signOut();
        showAlert('Sesión cerrada exitosamente', 'success');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        showAlert('Error al cerrar sesión');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function handleAuthError(error) {
    let message = 'Error desconocido';
    
    switch (error.code) {
        case 'auth/user-not-found':
            message = 'No existe una cuenta con este email';
            break;
        case 'auth/wrong-password':
            message = 'Contraseña incorrecta';
            break;
        case 'auth/email-already-in-use':
            message = 'Ya existe una cuenta con este email';
            break;
        case 'auth/weak-password':
            message = 'La contraseña es muy débil';
            break;
        case 'auth/invalid-email':
            message = 'Email inválido';
            break;
        case 'auth/too-many-requests':
            message = 'Demasiados intentos. Intenta más tarde';
            break;
        default:
            message = error.message;
    }
    
    showAlert(message);
}

// ==========================================
// FUNCIONES DE GESTIÓN DE TAREAS (ADAPTADO)
// ==========================================

async function addNote() {
    const titulo = noteTitleInput.value.trim();
    const contenido = noteContentInput.value.trim();

    if (!titulo || !contenido) {
        showAlert('Por favor completa el título y contenido de la nota');
        return;
    }

    if (!currentUser) {
        showAlert('Debes iniciar sesión para agregar notas');
        return;
    }

    try {
        addNoteBtn.disabled = true;
        addNoteBtn.textContent = 'Agregando...';
        
        // Agregar tarea a la subcolección del usuario
        await db.collection('usuarios')
                .doc(currentUser.uid)
                .collection('tareas')
                .add({
                    titulo: titulo,
                    contenido: contenido,
                    estado: 'pendiente',
                    fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
                    fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
                });

        noteTitleInput.value = '';
        noteContentInput.value = '';
        
        showAlert('¡Tarea agregada exitosamente!', 'success');
        
    } catch (error) {
        console.error('Error al agregar tarea:', error);
        showAlert('Error al agregar la tarea: ' + error.message);
    } finally {
        addNoteBtn.disabled = false;
        addNoteBtn.textContent = 'Agregar Tarea';
    }
}

async function deleteNote(noteId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        return;
    }

    try {
        await db.collection('usuarios')
                .doc(currentUser.uid)
                .collection('tareas')
                .doc(noteId)
                .delete();
        showAlert('Tarea eliminada exitosamente', 'success');
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        showAlert('Error al eliminar la tarea: ' + error.message);
    }
}

async function editNote(noteId, currentTitle, currentContent) {
    const newTitle = prompt('Nuevo título:', currentTitle);
    if (newTitle === null) return;

    const newContent = prompt('Nuevo contenido:', currentContent);
    if (newContent === null) return;

    if (!newTitle.trim() || !newContent.trim()) {
        showAlert('El título y contenido no pueden estar vacíos');
        return;
    }

    try {
        await db.collection('usuarios')
                .doc(currentUser.uid)
                .collection('tareas')
                .doc(noteId)
                .update({
                    titulo: newTitle.trim(),
                    contenido: newContent.trim(),
                    fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
                });
        
        showAlert('Tarea actualizada exitosamente', 'success');
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        showAlert('Error al actualizar la tarea: ' + error.message);
    }
}

async function toggleTaskStatus(noteId, currentStatus) {
    const newStatus = currentStatus === 'pendiente' ? 'completada' : 'pendiente';
    
    try {
        await db.collection('usuarios')
                .doc(currentUser.uid)
                .collection('tareas')
                .doc(noteId)
                .update({
                    estado: newStatus,
                    fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
                });
        
        showAlert(`Tarea marcada como ${newStatus}`, 'success');
    } catch (error) {
        console.error('Error al cambiar estado:', error);
        showAlert('Error al cambiar el estado de la tarea');
    }
}

function renderNote(doc) {
    const task = doc.data();
    const taskId = doc.id;

    const safeTitle = escapeHtml(task.titulo);
    const safeContent = escapeHtml(task.contenido || 'Sin contenido');
    
    const titleForOnClick = safeTitle.replace(/'/g, "\\'");
    const contentForOnClick = safeContent.replace(/'/g, "\\'");
    
    const statusIcon = task.estado === 'completada' ? '✅' : '⏳';
    const statusClass = task.estado === 'completada' ? 'completed' : 'pending';

    return `
        <div class="note-card ${statusClass}">
            <div class="note-title">${statusIcon} ${safeTitle}</div>
            <div class="note-content">${safeContent}</div>
            <div class="note-date">
                Estado: <strong>${task.estado}</strong><br>
                Creada: ${formatDate(task.fechaCreacion)}
                ${task.fechaModificacion && 
                  task.fechaModificacion.seconds !== task.fechaCreacion?.seconds ? 
                  `<br>Modificada: ${formatDate(task.fechaModificacion)}` : ''}
            </div>
            <div class="note-actions">
                <button class="btn btn-primary btn-small" 
                        onclick="toggleTaskStatus('${taskId}', '${task.estado}')">
                    ${task.estado === 'pendiente' ? '✅ Completar' : '⏳ Pendiente'}
                </button>
                <button class="btn btn-primary btn-small" 
                        onclick="editNote('${taskId}', '${titleForOnClick}', '${contentForOnClick}')">
                    ✏️ Editar
                </button>
                <button class="btn btn-danger btn-small" 
                        onclick="deleteNote('${taskId}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `;
}

function loadUserNotes() {
    if (!currentUser) {
        console.log('❌ No hay usuario actual, no se pueden cargar tareas');
        return;
    }

    console.log('📋 Cargando tareas para usuario:', currentUser.uid);
    notesLoading.style.display = 'block';
    notesContainer.innerHTML = '';

    // Verificar primero si el documento del usuario existe
    db.collection('usuarios').doc(currentUser.uid).get()
        .then((userDoc) => {
            if (!userDoc.exists) {
                console.log('⚠️ Documento de usuario no existe, creándolo...');
                return createUserDocument(currentUser);
            } else {
                console.log('✅ Documento de usuario existe:', userDoc.data());
            }
        })
        .then(() => {
            // Ahora intentar cargar las tareas
            console.log('🔍 Consultando tareas en: usuarios/' + currentUser.uid + '/tareas');
            
            const unsubscribe = db.collection('usuarios')
                .doc(currentUser.uid)
                .collection('tareas')
                .orderBy('fechaCreacion', 'desc')
                .onSnapshot((snapshot) => {
                    console.log('📥 Snapshot recibido, documentos:', snapshot.size);
                    notesLoading.style.display = 'none';
                    
                    if (snapshot.empty) {
                        console.log('📝 No hay tareas para mostrar');
                        notesContainer.innerHTML = `
                            <div class="empty-state">
                                📋 No tienes tareas aún.<br>
                                ¡Agrega tu primera tarea usando el formulario de arriba!
                            </div>
                        `;
                        return;
                    }

                    console.log('✅ Renderizando', snapshot.docs.length, 'tareas');
                    const notesHTML = snapshot.docs.map(doc => {
                        console.log('Tarea:', doc.id, doc.data());
                        return renderNote(doc);
                    }).join('');
                    notesContainer.innerHTML = notesHTML;
                    
                }, (error) => {
                    console.error('❌ Error detallado al cargar tareas:', error);
                    console.error('Código:', error.code);
                    console.error('Mensaje:', error.message);
                    notesLoading.style.display = 'none';
                    showAlert('Error al cargar las tareas: ' + error.message);
                });

            window.notesUnsubscribe = unsubscribe;
        })
        .catch((error) => {
            console.error('❌ Error al verificar/crear usuario:', error);
            notesLoading.style.display = 'none';
            showAlert('Error al configurar usuario: ' + error.message);
        });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

loginBtn.addEventListener('click', loginUser);
registerBtn.addEventListener('click', registerUser);
logoutBtn.addEventListener('click', logoutUser);
addNoteBtn.addEventListener('click', addNote);

emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        passwordInput.focus();
    }
});

passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginUser();
    }
});

noteTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        noteContentInput.focus();
    }
});

noteContentInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        addNote();
    }
});

// ==========================================
// OBSERVER DE AUTENTICACIÓN
// ==========================================

auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;
        userEmail.textContent = user.email;
        
        authSection.classList.add('hide');
        userInfo.classList.add('show');
        notesSection.classList.add('show');
        
        emailInput.value = '';
        passwordInput.value = '';

        loadUserNotes();
        
        console.log('Usuario autenticado:', user.email);
        
    } else {
        currentUser = null;
        
        authSection.classList.remove('hide');
        userInfo.classList.remove('show');
        notesSection.classList.remove('show');
        
        notesContainer.innerHTML = '';
        
        if (window.notesUnsubscribe) {
            window.notesUnsubscribe();
            window.notesUnsubscribe = null;
        }
        
        console.log('Usuario desautenticado');
    }
});

// ==========================================
// FUNCIONES GLOBALES
// ==========================================

window.deleteNote = deleteNote;
window.editNote = editNote;
window.toggleTaskStatus = toggleTaskStatus;

