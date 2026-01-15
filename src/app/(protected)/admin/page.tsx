export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Total Stores</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Total Products</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Revenue</h2>
          <p className="text-3xl font-bold mt-2">$0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold">Categories</h2>
          <p className="text-3xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}