
// 🔐 CONFIGURACIÓN CENTRALIZADA DE SUPABASE
const SUPABASE_URL = "https://omdhohhwkhdxfejmbbsm.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZGhvaGh3a2hkeGZlam1iYnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODEyMzYsImV4cCI6MjA5NzU1NzIzNn0.AB8jbI7l3nh8BnjjhHd9LaP2d8sOoJUPX39SRIpRPNY";

// Inicialización global del cliente de Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Validador de Seguridad OWASP para páginas de Clientes/Bingo
 */
async function verificarAccesoCliente() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = "index.html";
        return null;
    }

    const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !perfil || !perfil.activo) {
        alert("🚨 Cuenta inactiva o inexistente.");
        await supabase.auth.signOut();
        window.location.href = "index.html";
        return null;
    }

    // Verificar expiración de tiempo contratado
    if (perfil.expiracion && new Date(perfil.expiracion) < new Date()) {
        alert("⌛ Tu suscripción ha vencido. Por favor, realiza una recarga.");
        window.location.href = "index.html";
        return null;
    }

    return perfil;
}

/**
 * Validador de Seguridad OWASP exclusivo para el Panel Administrativo
 */
async function verificarAccesoAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        window.location.href = "index.html";
        return null;
    }

    const { data: perfil, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (error || !perfil || (perfil.rol !== 'admin' && perfil.rol !== 'vendedor') || !perfil.activo) {
        alert("⛔ Acceso Denegado: No tienes permisos administrativos.");
        window.location.href = "index.html";
        return null;
    }

    return perfil;
}
