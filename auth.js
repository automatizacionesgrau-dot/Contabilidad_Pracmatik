/**
 * CRM Pracmatik - Authentication Module
 * Gestión de usuarios, sesiones y control de acceso
 */
const Auth = {
    USERS_KEY: 'crm_users',
    SESSION_KEY: 'crm_session',

    // Configuración de acceso por rol
    ACCESS_CONFIG: {
        admin: ['crm', 'clientes', 'leads', 'proyectos', 'comercial', 'dashboard', 'usuarios', 'index', 'config'],
        usuario: ['crm', 'clientes', 'leads', 'proyectos', 'comercial', 'config']
    },

    // Usuario admin por defecto
    defaultUsers: [
        {
            email: 'albert@pracmatik.com',
            password: 'admin123',
            role: 'admin',
            name: 'Albert',
            createdAt: new Date().toISOString()
        }
    ],

    /**
     * Inicializar el sistema de autenticación
     */
    init() {
        const users = localStorage.getItem(this.USERS_KEY);
        if (!users) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify(this.defaultUsers));
        }
    },

    /**
     * Verificar credenciales y crear sesión
     */
    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const session = {
                email: user.email,
                name: user.name,
                role: user.role,
                loginAt: new Date().toISOString()
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, user: session };
        }

        return { success: false, error: 'Credenciales incorrectas' };
    },

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'login.html';
    },

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    /**
     * Verificar si el usuario tiene acceso a una sección
     */
    hasAccess(section) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const allowedSections = this.ACCESS_CONFIG[user.role] || [];
        return allowedSections.includes(section);
    },

    /**
     * Proteger una página (redirigir si no hay acceso)
     */
    protect(section) {
        this.init();
        const user = this.getCurrentUser();

        if (!user) {
            window.location.href = 'login.html';
            return false;
        }

        if (!this.hasAccess(section)) {
            alert('⚠️ No tienes acceso a esta sección');
            window.location.href = 'crm.html';
            return false;
        }

        return true;
    },

    // ========== Funciones de Admin ==========

    /**
     * Obtener todos los usuarios
     */
    getAllUsers() {
        const users = localStorage.getItem(this.USERS_KEY);
        return users ? JSON.parse(users) : [];
    },

    /**
     * Añadir nuevo usuario
     */
    addUser(userData) {
        const users = this.getAllUsers();

        // Verificar si ya existe
        if (users.find(u => u.email === userData.email)) {
            return { success: false, error: 'El email ya está registrado' };
        }

        users.push({
            ...userData,
            createdAt: new Date().toISOString()
        });

        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return { success: true };
    },

    /**
     * Actualizar usuario
     */
    updateUser(email, data) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.email === email);

        if (index === -1) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // Solo verificar cambio de email si se proporciona un nuevo email diferente
        if (data.email && data.email !== email) {
            // Verificar que el nuevo email no existe ya
            if (users.find(u => u.email === data.email)) {
                return { success: false, error: 'El email ya está en uso' };
            }
        }

        users[index] = { ...users[index], ...data };
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return { success: true };
    },

    /**
     * Eliminar usuario
     */
    deleteUser(email) {
        // No permitir eliminar admin original
        if (email === 'albert@pracmatik.com') {
            return { success: false, error: 'No se puede eliminar al administrador principal' };
        }

        const users = this.getAllUsers().filter(u => u.email !== email);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        return { success: true };
    },

    /**
     * Verificar si el usuario actual es admin
     */
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.role === 'admin';
    }
};

// Auto-inicializar al cargar
Auth.init();
