import { supabase } from './supabase';

export async function uploadAttachment(file: File, orderId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${orderId}-${Math.random()}.${fileExt}`;
    const filePath = `orders/${orderId}/${fileName}`;

    // 1. Upload para o Bucket 'attachments'
    const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 2. Registrar na tabela 'order_attachments'
    const { data, error: dbError } = await supabase
        .from('order_attachments')
        .insert({
            order_id: orderId,
            file_path: filePath,
            file_type: file.type,
            description: file.name
        })
        .select()
        .single();

    if (dbError) throw dbError;
    return data;
}

export async function queueEmail(orderId: string, subject: string, body: string, schoolId: string) {
    const { error } = await supabase.from('email_outbox').insert({
        order_id: orderId,
        from_school_id: schoolId,
        subject,
        body,
        status: 'queued'
    });

    return !error;
}
