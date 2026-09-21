import Link from 'next/link'

export const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <span className="text-lg font-bold text-orange-500">MasterOnline</span>
            <p className="mt-2 text-sm text-gray-600">
              Online service booking platform
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-800">Services</h3>
            <ul className="mt-2 space-y-1">
              <li><Link href="/categories" className="text-sm text-gray-600 hover:text-orange-500">All Categories</Link></li>
              <li><Link href="/masters" className="text-sm text-gray-600 hover:text-orange-500">Find a Master</Link></li>
              <li><Link href="/orders/create" className="text-sm text-gray-600 hover:text-orange-500">Create Order</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-gray-800">Account</h3>
            <ul className="mt-2 space-y-1">
              <li><Link href="/login" className="text-sm text-gray-600 hover:text-orange-500">Log in</Link></li>
              <li><Link href="/register" className="text-sm text-gray-600 hover:text-orange-500">Sign up</Link></li>
              <li><Link href="/profile" className="text-sm text-gray-600 hover:text-orange-500">Profile</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4 text-center text-sm text-gray-500">
          © 2026 MasterOnline. All rights reserved.
        </div>
      </div>
    </footer>
  )
}