import { Link } from 'react-router-dom';

export default function StatCard({ label, value, icon: Icon, colorClass, link }) {
  const content = (
    <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6 flex items-center gap-4 hover:shadow-md transition cursor-default">
      <div className={`p-3 rounded-lg ${colorClass || 'bg-sage-50 text-teal-500'}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p className="text-sm font-medium text-sage-300">{label}</p>
        <p className="text-2xl font-bold text-teal-600">{value}</p>
      </div>
    </div>
  );

  return link ? <Link to={link} className="block no-underline">{content}</Link> : content;
}
