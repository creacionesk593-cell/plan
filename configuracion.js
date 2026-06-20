// 🔐 CONFIGURACIÓN CENTRALIZADA DE SUPABASE
const SUPABASE_URL = "https://ucakdjketghwimjxxuie.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjYWtkamtldGdod2ltanh4dWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODQ4NjksImV4cCI6MjA5NzU2MDg2OX0.FRAS_QgF9MdZ2UgEypX3lzLwuNJ494RbLmCHC-_NTUM";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Filtro de Seguridad OWASP para el Panel Administrativo / Vendedores
 */
async function verificarAccesoAdmin() {
    const { data: { session }, error: errAuth } = await supabase.auth.getSession();
    if (errAuth || !session) {
        window.location.href = "index.html";
        return null;
    }

    // Comprobación en base de datos en tiempo real (evita falsificación de tokens locales)
    const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !perfil || (perfil.rol !== 'admin' && perfil.rol !== 'vendedor') || !perfil.activo) {
        alert("⛔ Acceso Denegado: No posee privilegios administrativos.");
        await supabase.auth.signOut();
        window.location.href = "index.html";
        return null;
    }
    return perfil;
}

/**
 * Filtro de Seguridad para el Software Operativo de Clientes (App)
 */
async function verificarAccesoCliente() {
    const { data: { session }, error: errAuth } = await supabase.auth.getSession();
    if (errAuth || !session) {
        window.location.href = "index.html";
        return null;
    }

    const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !perfil || !perfil.activo) {
        alert("🚨 Cuenta inactiva o suspendida.");
        await supabase.auth.signOut();
        window.location.href = "index.html";
        return null;
    }

    // Validación OWASP para control de suscripciones por tiempo
    if (perfil.expiracion && new Date(perfil.expiracion) < new Date()) {
        alert("⌛ Su suscripción a TuBingo Pro ha caducado.");
        window.location.href = "index.html";
        return null;
    }
    return perfil;
}
