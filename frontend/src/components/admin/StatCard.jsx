import { Link } from 'react-router-dom';

export default function StatCard({ label, value, icon: Icon, colorClass, link }) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4 hover:shadow-md transition cursor-default">
      <div className={`p-3 rounded-lg ${colorClass || 'bg-blue-50 text-blue-600'}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return link ? <Link to={link} className="block no-underline">{content}</Link> : content;
}
