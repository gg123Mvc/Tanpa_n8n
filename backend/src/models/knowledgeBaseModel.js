import supabase from '../config/database.js';

class KnowledgeBase {
  // Ambil semua data (untuk admin dashboard)
  static async getAll() {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('category', { ascending: true })
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // Ambil hanya data aktif (untuk AI Agent)
  static async getActive() {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('status', 'active')
      .order('category', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  // Ambil data berdasarkan ID
  static async getById(id) {
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  // Tambah data baru
  static async create(data) {
    const { category, title, content, status } = data;
    const { data: inserted, error } = await supabase
      .from('knowledge_base')
      .insert({ category, title, content, status: status || 'active' })
      .select('id')
      .single();
    if (error) throw error;
    return inserted.id;
  }

  // Update data
  static async update(id, data) {
    const { category, title, content, status } = data;
    const { error, count } = await supabase
      .from('knowledge_base')
      .update({ category, title, content, status })
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Hapus data
  static async delete(id) {
    const { error } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  // Ubah status (active/inactive)
  static async toggleStatus(id, status) {
    const { error } = await supabase
      .from('knowledge_base')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
    return true;
  }
}

export default KnowledgeBase;
