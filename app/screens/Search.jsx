import React, { useEffect, useState, useContext, useReducer } from "react";
import {useLoaderData, useNavigate} from "react-router-dom";
import ScreenWithSidebar from "../components/ScreenWithSidebar.jsx";
import SearchInput from "../components/SearchInput.jsx";
import ProteinTable from "../components/ProteinTable.jsx";
import SpeciesSelect from "../components/SpeciesSelect.jsx";
import {OpenProtGlobalContext} from "../../main.jsx";
import Select from "../widgets/Select.jsx";
import Checkbox from "../widgets/Checkbox.jsx";
import {useSeachProteins} from "../hooks.js";
import {SpinnerLayer} from "../widgets/Spinner.jsx";


const Search = ({}) => {

    const species_sn = useLoaderData()

    const navigate = useNavigate()

    const {
        proteinQueryResult,
        setAccessionPattern,
        proteinType,
        setProteinType,
        setExperimentalEvidence,
        experimentalEvidence,
        setWithDomains,
        withDomains,
        annotationSource,
        setAnnotationSource,
        queryInProgress
    } = useSeachProteins({species_sn})

    const {globalState} = useContext(OpenProtGlobalContext)

    useEffect(() => {
        if(globalState.lastQuery) {
            setAccessionPattern(globalState.lastQuery)
        }
    }, [])

    const SidebarPanel = () =>
            <div className="grid gap-1 mb-2 md:grid-cols-1">
                <span className="text-sm">Filters</span>
                <SpeciesSelect
                    species_sn={species_sn}
                    onSelectSpecies={species => navigate(`/proteins/${species.sn}`)}
                />
                <Select
                    label="Experimental Evidence"
                    onChange={e => setExperimentalEvidence(e.target.value)}
                    value={experimentalEvidence}
                >
                    <option value={null}>No Filter</option>
                    <option value={2}>Mass Spectrometry</option>
                    <option value={1}>RiboSeq</option>
                    <option value={3}>Mass Spec & RiboSeq</option>
                </Select>
                <Select
                    label="Protein Type"
                    onChange={e => setProteinType(e.target.value)}
                    value={proteinType}
                >
                    <option value={null}>All</option>
                    <option value={0}>reference</option>
                    <option value={1}>novel isoform</option>
                    <option value={2}>altProts</option>
                </Select>
                <Select
                    label="Annotation"
                    onChange={e => setAnnotationSource(e.target.value)}
                    value={annotationSource}
                >
                    <option value={"a"}>All</option>
                    <option value={"e"}>Ensembl</option>
                    <option value={"r"}>Refseq</option>
                </Select>
                <Checkbox
                    label={"With Predicted Domains"}
                    value={withDomains !== null}
                    onChange={
                        e => setWithDomains(e.target.checked ? 'y' : null)
                    }
                />
            </div>

    const renderSearchResults = () => {

        if(proteinQueryResult === null) {
            return null
        }

        if(proteinQueryResult.length === 0) {
            return <div>No proteins found</div>
        }

        return <div>
            <ProteinTable species_sn={species_sn} proteinQueryResult={proteinQueryResult} queryInProgress={queryInProgress}/>
            { queryInProgress && <SpinnerLayer svgClasses={"w-40 h-40"}/>}
        </div>
    }

    return (
        <ScreenWithSidebar
            sidebarPanel={<SidebarPanel/>}
        >
            <div className="grid grid-cols-1">
                <SearchInput
                    query={globalState.lastQuery} species_sn={species_sn}
                    onSearchClick={(sn, accession_pattern) => {
                        setAccessionPattern(accession_pattern)
                    }}
                    inProgress={queryInProgress}
                />
            </div>
            <div className="grid grid-cols-1">
                {renderSearchResults()}
            </div>
        </ScreenWithSidebar>
    )
}

export default Search
