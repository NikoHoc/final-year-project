export const formatDate = (dateString?: string) => {
    if (!dateString) return "Mei 2026";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
};