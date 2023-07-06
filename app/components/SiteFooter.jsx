
export default ({}) => {
    return <footer className="bg-gray-200 p-4 mt-5 w-full bottom-0">
        <div className="grid grid-cols-4">
            <div className="col-span-2">
                <span className="text-sm ml-3">OpenProt is supported by</span>
                <div className="grid grid-cols-4">
                    <img className="m-auto" src="/img/CRC_Logo.png" width="200"/>                    
                    <img className="m-auto" src="/img/udes.svg" width="160"/>
                    <img className="m-auto" src="/img/digital_alliance.svg" width="400"/>                   
                </div>

            </div>
            <div>site map</div>
            <div>how to cite</div>
        </div>
    </footer>
}