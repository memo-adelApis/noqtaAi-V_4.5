import React from "react";

export default function StatCard({ title, value, icon: Icon, colorClass, details }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4 space-x-reverse">
            <div className={`p-3 rounded-full ${colorClass}`}>
                <Icon className="text-white" size={24} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {details && <p className="text-xs text-gray-400">{details}</p>}
            </div>
        </div>
    );
}
