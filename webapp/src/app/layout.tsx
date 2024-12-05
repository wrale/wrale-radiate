import './globals.css'

export const metadata = {
  title: 'Wrale Radiate',
  description: 'Digital Signage Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
