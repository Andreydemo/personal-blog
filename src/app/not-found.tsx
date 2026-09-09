import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p>
        Nothing lives at this address. Head back to the{' '}
        <Link href="/" className="underline">
          home page
        </Link>
        .
      </p>
    </div>
  )
}
