export const metadata = {
  title: 'Privacy Policy',
  description: 'How Firefly collects, uses, and protects your data.'
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-gray-700 leading-relaxed">
        <p>
          We respect your privacy. This page explains, in plain language, what
          data Firefly may collect and how it is used to provide the service.
        </p>
        <p>
          - Account data: If you sign in, we store minimal profile information
          (e.g., email, user ID) needed for authentication and syncing tasks.
        </p>
        <p>
          - App usage: We may store task titles and related settings you enter to
          enable features like timers, history, and suggestions. Content you
          enter remains yours.
        </p>
        <p>
          - Analytics: We may use privacy-friendly analytics to understand
          aggregate usage only. No personal data is sold or shared with third
          parties for advertising.
        </p>
        <p>
          - Security: We use industry-standard measures to protect your data.
          Contact us if you have any concerns or requests for deletion.
        </p>
        <p>
          This page may be updated as the product evolves. If you have
          questions, reach out to the project maintainers.
        </p>
      </div>
    </main>
  )
}
