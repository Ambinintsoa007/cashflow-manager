type Props = {
  title: string
  amount: string
  description: string
}

export default function SummaryCard({
  title,
  amount,
  description,
}: Props) {
  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-gray-500">
          Current total
        </p>

        <p className="mt-3 break-words text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {amount}
        </p>
      </div>
    </div>
  )
}