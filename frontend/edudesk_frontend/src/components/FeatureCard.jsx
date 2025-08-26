import React from 'react';

const FeatureCard = ({ icon: Icon, title, description, colorClass = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-600/20 text-blue-400 border-blue-500/50",
    purple: "bg-purple-600/20 text-purple-400 border-purple-500/50",
    green: "bg-green-600/20 text-green-400 border-green-500/50",
    orange: "bg-orange-600/20 text-orange-400 border-orange-500/50"
  };

  const bgColor = colorClasses[colorClass].split(' ')[0];
  const textColor = colorClasses[colorClass].split(' ')[1];
  const borderColor = colorClasses[colorClass].split(' ')[2];

  return (
    <div className={`bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-${borderColor} transition-all hover:transform hover:scale-105`}>
      <div className={`${bgColor} p-3 rounded-lg w-fit mb-4`}>
        <Icon className={`h-6 w-6 ${textColor}`} />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeatureCard;
