

export default ({label, onChange, value, children}) =>
    <>
        <label className="block mb-1 mt-2 text-sm font-medium text-gray-900">{label}</label>
        <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            onChange={onChange}
            value={value}
        >
            {children}
        </select>
    </>