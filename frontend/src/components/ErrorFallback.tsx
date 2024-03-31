export default function ErrorFallback({ error }: { error: Error }) {
  return (

    <div>
      <h1>Something went wrong:</h1>
      <pre>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  )
}
