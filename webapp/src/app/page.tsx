import { ContentUpload } from '../components/ContentUpload'
import { HealthDashboard } from '../components/HealthDashboard'

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-8">Wrale Radiate Management</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Content Management</h2>
          <ContentUpload />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Display Health</h2>
          <HealthDashboard />
        </section>
      </div>
    </main>
  )
}
