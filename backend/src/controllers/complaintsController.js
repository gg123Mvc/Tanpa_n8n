import supabase from '../config/database.js';
import { successResponse, errorResponse, ERROR_CODES } from '../utils/errors.js';

// Get All Complaints with Filters and Stats
export const getComplaints = async (req, res) => {
  try {
    const { status, category, date, search } = req.query;

    // 1. Get stats
    const { data: allComplaints, error: statsError } = await supabase
      .from('complaints')
      .select('status, created_at');

    if (statsError) throw statsError;

    const today = new Date().toISOString().slice(0, 10);
    const stats = {
      total: allComplaints.length,
      today: allComplaints.filter(c => c.created_at?.slice(0, 10) === today).length,
      pending: allComplaints.filter(c => c.status === 'Menunggu').length,
      processing: allComplaints.filter(c => c.status === 'Diproses').length,
      completed: allComplaints.filter(c => c.status === 'Selesai').length,
      rejected: allComplaints.filter(c => c.status === 'Ditolak').length,
    };

    // 2. Query for table list with join
    let query = supabase
      .from('complaints')
      .select('*, users ( full_name, email )')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (date) query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
    if (search) query = query.or(`ticket_number.ilike.%${search}%`);

    const { data: complaints, error: listError } = await query;
    if (listError) throw listError;

    // Flatten user join
    const flatComplaints = (complaints || []).map(c => ({
      ...c,
      full_name: c.users?.full_name || null,
      email: c.users?.email || null,
      users: undefined
    }));

    successResponse(res, { stats, complaints: flatComplaints }, 'Berhasil mengambil data pengaduan');
  } catch (error) {
    console.error('Error fetching complaints:', error);
    errorResponse(res, 'Gagal mengambil data pengaduan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Get Complaint Detail with Logs
export const getComplaintDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: complaint, error: compError } = await supabase
      .from('complaints')
      .select('*, users ( full_name, email )')
      .eq('id', id)
      .maybeSingle();

    if (compError) throw compError;

    if (!complaint) {
      return errorResponse(res, 'Pengaduan tidak ditemukan', ERROR_CODES.NOT_FOUND);
    }

    // Get logs (jika tabel complaint_logs ada)
    const { data: logs } = await supabase
      .from('complaint_logs')
      .select('*')
      .eq('complaint_id', id)
      .order('handled_at', { ascending: false });

    const result = {
      ...complaint,
      full_name: complaint.users?.full_name || null,
      email: complaint.users?.email || null,
      users: undefined,
      logs: logs || []
    };

    successResponse(res, result, 'Berhasil mengambil detail pengaduan');
  } catch (error) {
    console.error('Error fetching complaint detail:', error);
    errorResponse(res, 'Gagal mengambil detail pengaduan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Update Complaint Status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_note } = req.body;
    const adminName = req.user?.full_name || req.user?.username || 'Admin';

    if (!status) {
      return errorResponse(res, 'Status harus diisi', ERROR_CODES.VALIDATION_ERROR);
    }

    const { error: updateError } = await supabase
      .from('complaints')
      .update({
        status,
        admin_note: admin_note || null,
        handled_by: adminName,
        handled_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Insert log (best effort, jika tabel ada)
    await supabase.from('complaint_logs').insert({
      complaint_id: parseInt(id),
      status,
      admin_note: admin_note || null,
      handled_by: adminName
    }).then(() => {}).catch(() => {});

    successResponse(res, null, 'Status pengaduan berhasil diperbarui');
  } catch (error) {
    console.error('Error updating complaint status:', error);
    errorResponse(res, 'Gagal mengupdate status pengaduan', ERROR_CODES.INTERNAL_ERROR);
  }
};

// Delete Complaint
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (error) throw error;

    successResponse(res, null, 'Pengaduan berhasil dihapus');
  } catch (error) {
    console.error('Error deleting complaint:', error);
    errorResponse(res, 'Gagal menghapus pengaduan', ERROR_CODES.INTERNAL_ERROR);
  }
};
