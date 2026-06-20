// 🔐 CONFIGURACIÓN CENTRALIZADA DE SUPABASE
const SUPABASE_URL = "https://ucakdjketghwimjxxuie.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYWtkamtldGdod2ltanh4dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODQ4NjksImV4cCI6MjA5NzU2MDg2OX0.FRAS_QgF9MdZ2UgEypX3lzLwuNJ494RbLmCHC-_NTUM";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function obtenerUsuarioLocal() {
    const sesion = localStorage.getItem('usuario_bingo');
    return sesion ? JSON.parse(sesion) : null;
}

async function verificarAccesoAdmin() {
    const usuario = obtenerUsuarioLocal();
    if (!usuario) { window.location.href = "index.html"; return null; }

    // Validación en tiempo real contra tu tabla perfiles
    const { data: perfil, error } = await supabase.from('perfiles').select('*').eq('id', usuario.id).single();
    if (error || !perfil || (perfil.rol !== 'admin' && perfil.rol !== 'vendedor') || !perfil.activo) {
        alert("⛔ Acceso Denegado.");
        localStorage.removeItem('usuario_bingo');
        window.location.href = "index.html";
        return null;
    }
    return perfil;
}

async function verificarAccesoCliente() {
    const usuario = obtenerUsuarioLocal();
    if (!usuario) { window.location.href = "index.html"; return null; }

    const { data: perfil, error } = await supabase.from('perfiles').select('*').eq('id', usuario.id).single();
    if (error || !perfil || !perfil.activo) {
        alert("🚨 Cuenta inactiva o suspendida.");
        localStorage.removeItem('usuario_bingo');
        window.location.href = "index.html";
        return null;
    }

    if (perfil.expiracion && new Date(perfil.expiracion) < new Date()) {
        alert("⌛ Su suscripción a TuBingo Pro ha caducado.");
        window.location.href = "index.html";
        return null;
    }
    return perfil;
}
