import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";

export default ({sidebarItems, sidebarPanel, children}) => <div className="flex flex-col h-screen justify-between">
    <SiteHeader/>
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" style={{marginTop: 50}}>
        <div className="h-full px-3 py-4 overflow-y-auto bg-white">
            {
                    sidebarPanel && sidebarPanel
            }
            {
                sidebarItems && <ul className="space-y-2 font-medium">
                {
                    sidebarItems.map((item, idx) =>
                        <li key={`k-${idx}`}>
                        <a href="#"
                           className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100 ">
                            {item}
                        </a>
                        </li>
                    )
                }
                </ul>
            }
        </div>
    </aside>
    <div className="p-4 sm:ml-64 mb-auto">
        <div className="grid grid-cols-1 gap-4 mb-4">
            {children}
        </div>
    </div>
    <SiteFooter/>
</div>