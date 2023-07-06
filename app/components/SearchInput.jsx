import { useState } from "react";
import {SpinnerSvg} from "../widgets/Spinner.jsx";


export default ({species_sn, onSearchClick, query, inProgress}) => {
    const [searchQuery, setSearchQuery] = useState(query || "")

    const handleEnterKeyDown = (event) => {
        if (event.key === 'Enter') {
            onSearchClick(species_sn, searchQuery)
        }
    }

    const iconInButton = () => {
        if(inProgress) {
            return <SpinnerSvg svgClasses={"w-4 h-4"}/>
        }

        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
    }

    return <div className="flex items-center">
        <label htmlFor="simple-search" className="sr-only">Search</label>
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg aria-hidden="true" className="w-5 h-5 text-gray-500" fill="currentColor"
                     viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                    />
                </svg>
            </div>
            <input
                className="bg-gray-50 border border-blue-800 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                placeholder="gene, transcript, or protein accession"
                value={searchQuery}
                onKeyDown={handleEnterKeyDown}
                onChange={e => setSearchQuery(e.target.value)}
            />
        </div>
        <button
            className="p-2.5 ml-2 text-sm font-medium text-white bg-cyan-500 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300"
            onClick={() => onSearchClick(species_sn, searchQuery)}
        >
            {iconInButton()}
            <span className="sr-only">Search</span>
        </button>
    </div>
}