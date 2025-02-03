'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Send, CheckCircle } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevState => ({ ...prevState, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prevErrors => ({ ...prevErrors, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (validateForm()) {
      setIsSubmitting(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', phone: '', company: '', message: '' })
    }
  }

  return (
    <div className="bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-extrabold text-gray-light">Get in touch</h2>
            <p className="mt-4 text-lg text-gray-muted">
              We'd love to hear from you. Our friendly team is always here to chat.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-center">
                <Phone className="h-6 w-6 text-primaryaccent" />
                <span className="ml-3 text-base text-gray-muted">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-6 w-6 text-primaryaccent" />
                <span className="ml-3 text-base text-gray-muted">contact@fleetmaster.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-6 w-6 text-primaryaccent" />
                <span className="ml-3 text-base text-gray-muted">123 Fleet Street, Los Angeles, CA 90001</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 mt-8 lg:mt-0">
            {isSubmitted ? (
              <div className="bg-dark-hover rounded-lg p-8 text-center">
                <CheckCircle className="h-16 w-16 text-primaryaccent mx-auto" />
                <h3 className="mt-4 text-2xl font-semibold text-gray-light">Thank you for your message!</h3>
                <p className="mt-2 text-gray-muted">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-light">
                    Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`py-3 px-4 block w-full shadow-sm bg-dark-hover text-gray-light border-dark-border rounded-md focus:ring-primaryaccent focus:border-primaryaccent ${
                        errors.name ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-light">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`py-3 px-4 block w-full shadow-sm bg-dark-hover text-gray-light border-dark-border rounded-md focus:ring-primaryaccent focus:border-primaryaccent ${
                        errors.email ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-light">
                    Phone (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="py-3 px-4 block w-full shadow-sm bg-dark-hover text-gray-light border-dark-border rounded-md focus:ring-primaryaccent focus:border-primaryaccent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-light">
                    Company (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="company"
                      id="company"
                      autoComplete="organization"
                      value={formData.company}
                      onChange={handleChange}
                      className="py-3 px-4 block w-full shadow-sm bg-dark-hover text-gray-light border-dark-border rounded-md focus:ring-primaryaccent focus:border-primaryaccent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-light">
                    Message
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className={`py-3 px-4 block w-full shadow-sm bg-dark-hover text-gray-light border-dark-border rounded-md focus:ring-primaryaccent focus:border-primaryaccent ${
                        errors.message ? 'border-red-500' : ''
                      }`}
                    ></textarea>
                    {errors.message && <p className="mt-2 text-sm text-red-500">{errors.message}</p>}
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-dark bg-primaryaccent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primaryaccent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 -mr-1 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

