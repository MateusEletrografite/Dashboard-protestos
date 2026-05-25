import { DashboardDataProvider } from './context/DashboardDataContext'
import { AppShell } from './layouts/AppShell'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <DashboardDataProvider>
      <AppShell>
        <DashboardPage />
      </AppShell>
    </DashboardDataProvider>
  )
}

export default App
