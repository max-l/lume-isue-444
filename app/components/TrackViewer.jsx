import React, { useState, useEffect, useRef } from 'react'


const TrackViewer = ({onClose, title, argsReady, chrom, regionStart, regionEnd, strand}) => {

    const trackIFrameParentElement = useRef()

    const [iFrameReady, setIFrameReady] = useState(false)

    useEffect(() => {

        const iFrame = document.getElementById("trackFrame")

        iFrame.onload = function() {
            setIFrameReady(true)
        }

    },[])

    const tracker = () => [`${argsReady}-${iFrameReady}`]

    useEffect(() => {
        if(argsReady && iFrameReady) {
            const iFrame = document.getElementById("trackFrame")
            const data = {
                chrom,
                regionStart,
                regionEnd,
                strand
            }
            iFrame.contentWindow.postMessage(JSON.stringify(data), "*")
        }

    }, tracker())

    const iframe = `<iframe id="trackFrame"  height="800" style="width: 100%;" src="/jbrowse" allowtransparency="true"/>`

    return <div className="grid-cols-1">
        <div ref={trackIFrameParentElement} dangerouslySetInnerHTML={ {__html:  iframe}} />
    </div>
}

export default TrackViewer
