export default function AdminDashboard() {
  return (
    <div className="grid md:grid-cols-4 gap-6">
      {[
        { title: "Total Products", value: 42 },
        { title: "New Enquiries", value: 18 },
        { title: "Gallery Items", value: 25 },
        { title: "Pending Quotes", value: 7 },
      ].map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl p-6 shadow"
        >
          <p className="text-sm text-gray-500">{card.title}</p>
          <h2 className="text-2xl font-semibold mt-2">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
