const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ttkqufmepaypahrmfkjx.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0a3F1Zm1lcGF5cGFocm1ma2p4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkzNzE4MywiZXhwIjoyMDg3NTEzMTgzfQ.aGGrGezswZ1s8Pk1rKmaHF2I_NG1mk9f3BSy_pZ4R9U';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    console.log('Iniciando criação do gestor administrativo...');

    const { data, error } = await supabase.auth.admin.createUser({
        email: 'renato.consultoria@cidadeviva.org',
        password: 'educationadmin2026',
        email_confirm: true,
        user_metadata: {
            full_name: 'Renato Assis',
            role: 'admin'
        }
    });

    if (error) {
        console.error('Erro ao criar usuário:', error.message);
        process.exit(1);
    }

    console.log('Usuário Auth criado com sucesso:', data.user.id);
    console.log('O trigger deve ter criado o perfil automaticamente.');
    process.exit(0);
}

createAdmin();
