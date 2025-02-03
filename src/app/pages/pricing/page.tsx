import { Check } from 'lucide-react'
import Link from 'next/link'

const tiers = [
  {
    name: 'Starter',
    id: 'tier-starter',
    href: '#',
    priceMonthly: '$99',
    description: 'Perfect for small fleets just getting started with management software.',
    features: [
      'Up to 10 vehicles',
      'Real-time GPS tracking',
      'Basic maintenance scheduling',
      'Fuel consumption tracking',
      'Email support',
    ],
  },
  {
    name: 'Professional',
    id: 'tier-professional',
    href: '#',
    priceMonthly: '$199',
    description: 'Ideal for growing fleets with advanced management needs.',
    features: [
      'Up to 50 vehicles',
      'Advanced analytics dashboard',
      'Driver safety monitoring',
      'Automated maintenance alerts',
      'Route optimization',
      'Priority email and phone support',
    ],
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: 'Custom',
    description: 'Tailored solutions for large fleets with complex requirements.',
    features: [
      'Unlimited vehicles',
      'Custom integrations',
      'Advanced reporting and analytics',
      'Dedicated account manager',
      'API access',
      '24/7 premium support',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="bg-dark">
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-5xl font-extrabold text-gray-light sm:text-center">Pricing Plans</h1>
          <p className="mt-5 text-xl text-gray-muted sm:text-center">
            Choose the perfect plan for your fleet management needs
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => (
            <div key={tier.id} className="border border-dark-border rounded-lg shadow-sm divide-y divide-dark-border">
              <div className="p-6">
                <h2 className="text-2xl font-semibold leading-6 text-gray-light">{tier.name}</h2>
                <p className="mt-4 text-sm text-gray-muted">{tier.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-light">{tier.priceMonthly}</span>
                  {tier.name !== 'Enterprise' && <span className="text-base font-medium text-gray-muted">/mo</span>}
                </p>
                <Link
                  href={tier.href}
                  className="mt-8 block w-full bg-primaryaccent border border-transparent rounded-md py-2 text-sm font-semibold text-dark text-center hover:bg-opacity-90"
                >
                  {tier.name === 'Enterprise' ? 'Contact sales' : 'Start your trial'}
                </Link>
              </div>
              <div className="pt-6 pb-8 px-6">
                <h3 className="text-xs font-medium text-gray-light tracking-wide uppercase">What's included</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex space-x-3">
                      <Check className="flex-shrink-0 h-5 w-5 text-primaryaccent" aria-hidden="true" />
                      <span className="text-sm text-gray-muted">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-light">Frequently asked questions</h2>
        <div className="mt-12">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:grid-cols-3">
            {[
              {
                question: "What's the best pricing plan for my fleet?",
                answer:
                  "The best plan depends on your fleet size and management needs. Our Starter plan is great for small fleets, while larger operations may benefit from our Professional or Enterprise plans. Contact our sales team for personalized recommendations.",
              },
              {
                question: "Can I change my plan later?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
              },
              {
                question: "Is there a free trial available?",
                answer:
                  "Yes, we offer a 14-day free trial for our Starter and Professional plans. This allows you to explore our features and determine the best fit for your fleet.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, as well as PayPal. For Enterprise plans, we also offer invoicing options.",
              },
              {
                question: "Is there a long-term contract?",
                answer:
                  "Our Starter and Professional plans are billed monthly with no long-term commitment. Enterprise plans may have custom contract terms.",
              },
              {
                question: "How does the Enterprise plan differ?",
                answer:
                  "The Enterprise plan offers customized solutions, unlimited vehicle tracking, advanced integrations, and dedicated support. It's tailored to meet the complex needs of large fleets.",
              },
            ].map((faq) => (
              <div key={faq.question}>
                <dt className="text-lg leading-6 font-medium text-gray-light">{faq.question}</dt>
                <dd className="mt-2 text-base text-gray-muted">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-dark-hover">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-light sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-primaryaccent">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-dark bg-primaryaccent hover:bg-opacity-90"
              >
                Get started
              </a>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a
                href="#"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primaryaccent bg-dark hover:bg-dark-hover"
              >
                Contact sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

