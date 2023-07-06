import { useState, useEffect } from "react";
import {useLoaderData} from "react-router-dom";
import ScreenWithSidebar from "../components/ScreenWithSidebar.jsx";
import DomainsTile from "../components/DomainsTile.jsx";
import SpectrumViewer from "../components/SpectrumViewer.jsx";
import ConservationTile from "../components/ConservationTile.jsx";
import RiboseqTile from "../components/RiboseqTile.jsx";
import IdrViewer from "../components/IdrViewer.jsx";
import ProteinTranscriptsTile from "../components/ProteinTranscriptsTile.jsx";
import PdbViewer from "../components/PdbViewer.jsx";
import TrackViewer from "../components/TrackViewer.jsx";
import {useFetchProtDetails} from "../hooks.js";

const panelNames = [
    "Genome Browser",
    "Mass Spectrometry",
    "Structure Prediction",
    "Transcripts",
    "Riboseq",
    "Protein Info",
    "Transcripts",
    "Conservation",
    "Domains"
]

export default ({}) => {

    const [species_sn, protein] = useLoaderData()

    const [trackViewerArgs, setTrackViewerArgs] = useState({isReady: false})

    const [displayProtDetails, setDisplayProtDetails] = useState({
        coord: null,
        gene: null,
        accession:null,
        type:null
    })
    
    const {isReady, data:protDetails} = useFetchProtDetails({species_sn, protein_seq_id:protein.protein_seq_id})
    
    useEffect(() => {
        if(isReady) {
            if(protDetails.length > 0) {
                const [firstRow, ] = protDetails
                setTrackViewerArgs({
                    chrom: firstRow.location_chr,
                    regionStart: firstRow.location_start,
                    regionEnd: firstRow.location_end,
                    strand: firstRow.strand
                })
                setDisplayProtDetails({
                    gene:firstRow.gene_symbol,
                    accession:firstRow.accession,
                    type:firstRow.type,
                    sequence_length_weight:`${firstRow.sequence.length} (${(firstRow.weight/1000).toFixed(2)}kDa)`,
                    coord:`chr${firstRow.location_chr}:${firstRow.location_start}-${firstRow.location_end}`
                })
            }
        }
    }, [isReady])
    

    const [selectedPanelName, setSelectedPanelName] = useState(panelNames[0])

    const visiblePanel = () => {
        switch (selectedPanelName) {
            case "Genome Browser":
                return <TrackViewer
                    argsReady={isReady}
                    chrom={trackViewerArgs.chrom}
                    regionStart={trackViewerArgs.regionStart}
                    regionEnd={trackViewerArgs.regionEnd + 10000}
                    strand={trackViewerArgs.strand}
                />
            case "Domains":
                return <DomainsTile protein_seq_id={protein.protein_seq_id}/>
            case "Mass Spectrometry":
                return <SpectrumViewer species_sn={species_sn} protein_seq_id={protein.protein_seq_id}/>
            case "Conservation":
                return <ConservationTile species_sn={species_sn} protein_seq_id={protein.protein_seq_id}/>
            case "Riboseq":
                return <RiboseqTile species_sn={species_sn} protein_seq_id={protein.protein_seq_id}/>
            case "Disordered Regions":
                return <IdrViewer protein_seq_id={protein.protein_seq_id}/>
            case "Structure Prediction":
                return <PdbViewer protein_seq_id={protein.protein_seq_id}/>
            case "Transcripts":
                return <ProteinTranscriptsTile species_sn={species_sn} protein_seq_id={protein.protein_seq_id}/>
            default:
                return <div>
                    <h1>{selectedPanelName}</h1>
                </div>
        }
    }

    const PanelItem = ({label}) =>
            <li>
                <a href="#"
                   className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                   onClick={() => setSelectedPanelName(label)}
                >
                    {label}
                </a>
            </li>

    const SidebarPanel = () =>
        <ul className="space-y-2 font-medium">
            <PanelItem label={"Genome Browser"}/>
            <PanelItem label={"Transcripts"}/>
            <PanelItem label={"Mass Spectrometry"}/>
            <PanelItem label={"Domains"}/>
            <PanelItem label={"Conservation"}/>
            <PanelItem label={"Riboseq"}/>
            <PanelItem label={"Disordered Regions"}/>
            <PanelItem label={"Structure Prediction"}/>
        </ul>

    const specieFullName = {'HS':"Homo sapiens"}
    const typeFullName = {'reference': 'RefProt', 'cryptic':'AltProt', 'isoform':'Novel Isoform'}

    const decoratedlist = (label, data) =>
        <div className="flex">
            <div className="m-1 w-1/3 pr-2 text-right border-r-2 border-slate-400 font-bold">
                {label}
            </div>
            <div className="m-auto ml-2">{data}</div>
        </div>
    return (
        <ScreenWithSidebar
            sidebarPanel={<SidebarPanel/>}
        >
            <div>
                <div className="text-xl font-bold">{displayProtDetails.accession}</div>
                <div className="columns-2">
                        {decoratedlist('Type', typeFullName[displayProtDetails.type])} 
                        {decoratedlist('Gene', displayProtDetails.gene)}
                        {decoratedlist('Organism', specieFullName[species_sn])}
                        {decoratedlist('Genomic Coordinates', displayProtDetails.coord)}
                        {decoratedlist('Amino Acids', displayProtDetails.sequence_length_weight)}
                </div>
            </div>
            {visiblePanel()}
        </ScreenWithSidebar>
    )
    
}
