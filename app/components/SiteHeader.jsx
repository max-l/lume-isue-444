
export default ({}) => {

    const ulClass = "font-medium flex flex-col p-4 md:p-0 mt-4  md:flex-row md:space-x-8 md:mt-0 "

    const TopNavItem = ({label, href}) =>
        <li>
            <a className="block py-2 pl-3 pr-4 rounded md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 text-white"
                href={href}>
                {label}
            </a>
        </li>

    return <nav className="sticky top-0 z-50 bg-gradient-to-r from-blue-800 to-cyan-500">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
            <a href="/" className="flex items-center">
                <img src="/img/logo_white.png" className="h-12 mr-3"/>
            </a>
            <div className="hidden w-full md:block md:w-auto">
                <ul className={ulClass}>
                    <TopNavItem label="Downloads" href={"/downloads"}/>
                    <TopNavItem label="Documentation"/>
                    <TopNavItem label="Contact"/>
                </ul>
            </div>
        </div>
    </nav>
}
