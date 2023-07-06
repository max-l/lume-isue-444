
export default ({label, value, onChange}) => {
    if (!onChange) {
        onChange = () => {}
    }
    const id = `cb-${label}`
    return <div className="flex items-center mb-4">
        <input
            id={id}
            type="checkbox"
            checked={value}
            onChange={e => onChange(e)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label className="ml-2 my-4 text-sm font-medium text-gray-900" htmlFor={id}>
            {label}
        </label>
    </div>
}