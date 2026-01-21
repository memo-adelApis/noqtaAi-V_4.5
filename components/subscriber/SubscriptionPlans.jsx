"use client";

import { CheckCircle } from "lucide-react";

export default function SubscriptionPlans({ plans }) {
  const scrollToForm = (planType) => {
    const formElement = document.getElementById(`payment-form-${planType}`);
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <div 
          key={plan.type}
          className={`bg-gray-900 rounded-xl border p-6 relative ${
            plan.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-800'
          }`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                الأكثر شعبية
              </span>
            </div>
          )}
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {plan.price} ريال
            </div>
            <p className="text-gray-400 text-sm">{plan.duration}</p>
          </div>

          <ul className="space-y-3 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => scrollToForm(plan.type)}
            className={`w-full py-3 rounded-lg font-medium transition ${
              plan.popular 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            اختيار هذه الخطة
          </button>
        </div>
      ))}
    </div>
  );
}