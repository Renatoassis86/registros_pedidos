import { supabase } from './supabase';

export function generateProtocol(prefix: 'ORD' | 'TK' = 'ORD') {
    // Retornamos vazio para que o gatilho (trigger) do banco de dados 
    // gere o protocolo sequencial automático: PREFIX-YYYYMMDD-NNNN
    return '';
}

export async function getSchoolContext() {
    // 1. Verificar LocalStorage (Fallback do Portal Escola)
    if (typeof window !== 'undefined') {
        const localId = localStorage.getItem('school_portal_id');
        const localName = localStorage.getItem('school_portal_name');
        if (localId) {
            return { id: localId, name: localName || 'Escola' };
        }
    }

    // 2. Verificar Autenticação Padrão
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('school_id, schools(name)')
            .eq('id', user.id)
            .single();

        if (profile?.school_id) {
            return {
                id: profile.school_id,
                name: (profile.schools as any)?.name || 'Escola'
            };
        }
    }

    return null;
}
