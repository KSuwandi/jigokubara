export default function StatCard({ title, value, color = 'text-white' }) {
  return (
    <div className="bg-[#111111] border border-[#7A0019]/30 rounded-3xl p-6">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className={`text-4xl font-bold mt-3 ${color}`}>{value}</h2>
    </div>
  );
}
