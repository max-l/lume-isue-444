import { useState, useEffect, useReducer, useRef } from "react";
import { listify, group, sort } from 'radash'
import {
    all_species,
    fetchDomains,
    fetchParalogs,
    fetchOrthologs,
    searchAccessions,
    searchProteins,
    fetchRiboseq,
    fetchIDRs,
    fetchTranscripts,
    fetchProteinPDB,
    fetchProtPsms,
    fetchPsm,
    fetchGtex,
    fetchProtDetails,
    all_species_by_id, fetchDownloadFiles
} from "./rest.js";



export const useOpenProtConstants = () => {
    const species_by_sn = sn => all_species.find(s => s.sn === sn)
    return {
        all_species,
        species_by_sn
    }
}


export const useSpeciesSelect = ({species_sn, onSelectSpecies}) => {

    const {all_species, species_by_sn} = useOpenProtConstants()

    const [selectedSpecies, setSelectedSpecies] = useState(species_by_sn(species_sn || 'HS'))

    return {
        all_species,
        selectedSpecies,
        setSelectedSpecies: sn => {
            const species = species_by_sn(sn)
            setSelectedSpecies(species)
            if (onSelectSpecies) {
                onSelectSpecies(species)
            }
        }
    }
}


export const useDomains = protein_seq_id => {
    const [domains, setDomains] = useState({isReady: false, matches:[]})

    useEffect(() => {
        fetchDomains(protein_seq_id).then(res => setDomains({isReady: true, matches: res.matches}))
    }, [])

    return domains
}

export const useIdrs = protein_seq_id => {
    const [idrs, setIdr] = useState({is_ready:false, res:[]})

    useEffect(() => {
        fetchIDRs(protein_seq_id).then(res => setIdr({is_ready:true, res:CSVToJSON(res)}))
    }, [])

    return idrs
}

export const useConservation = ({species_sn, protein_seq_id, renderSpeciesCell}) => {

    const [orthologs, setOrthologs] = useState([])

    const [paralogs, setParalogs] = useState([])

    const emptyRow = [...Array(14)]
    function* tableifyOrthologs(orthologRows){

        const cellInfoFromRow = row => [
            row.sseq_a,
            row.pident,
            row.length,
            row.mismatch,
            row.gapopen,
            row.qstart,
            row.qend,
            row.sstart,
            row.send,
            row.evalue,
            row.bitscore,
            row.qcovs,
            row.qlen,
            row.slen
        ].map(content => ({content}))

        const orthologsEntries = group(orthologRows, row => row.subject_species_id)

        const orthologRowsForAllSpecies = all_species.map(s => {
            const speciesRows = orthologsEntries[s.id]
            if(speciesRows) {
                return [s.id, speciesRows]
            }
            return [s.id, null]
        })


        for (const t of orthologRowsForAllSpecies) {

            const [subject_species_id, group_of_rows] = t

            const subject_species = all_species_by_id[subject_species_id]

            if(group_of_rows === null) {
                yield [
                    {
                        content: renderSpeciesCell(subject_species)
                    },
                    ...[...Array(14)].map(z => ({content: null}))
                ]
                continue
            }

            const [firstRow, ...remainingRows] = sort(group_of_rows, row => row.bitscore, true)

            yield [
                {
                    rowSpan: group_of_rows.length,
                    content: renderSpeciesCell(subject_species)
                },
                ...cellInfoFromRow(firstRow)
            ]
            for (const row of remainingRows) {
                yield [
                    null,
                    ...cellInfoFromRow(row)
                ]
            }
        }
    }


    useEffect(() => {
        fetchOrthologs(species_sn, protein_seq_id).then(res => {
            setOrthologs(Array.from(tableifyOrthologs(res)))
        })
        fetchParalogs(species_sn, protein_seq_id).then(res => setParalogs(res))
    }, [])


    return {orthologs, paralogs}
}

/*
export const useAccessionSearchInput = () => {

    const [accessions, setAccessions] = useState([])

    const comboboxProps = useCombobox({
      onInputValueChange: ({inputValue}) =>
          searchAccessions("SC", inputValue).then(res => {
              if(res.detail == "Not Found") {
                  setAccessions([])
              }
              else {
                  setAccessions(res)
              }
          }),
      items: accessions,
      itemToString:
          accession => accession ? accession.text : '',
      onSelect: selectedItem => {
          debugger
          console.log(selectedItem)
      },
      onChange: e => {
          debugger
          console.log(e)
      }
    })

    return {
        ...comboboxProps,
        accessions
    }
}
*/



const searchReducer = (state, action) => {

    switch (action.type) {
        case "init":
            return {}
        case "resultsReceived": {
            return {
                ...state,
                genes: action.genes,
                transcripts: action.transcripts,
                transcript_translations: action.transcript_translations,
                proteins: action.proteins
            }
        }
    }
}


const searchFiltersReducer = (state, action) => {

    switch (action.type) {
        case "init":
            return {
                a: null,
                t: null,
                e: null,
                d: null,
                _query_trigger: 0,
                _search_criterias_versions: 0
            }
        case "a":
            return {
                ...state,
                _query_trigger: state._query_trigger + 1,
                a: action.value
            }
        case "t":
            return {
                ...state,
                t: action.value,
                _search_criterias_versions: state._search_criterias_versions + 1
            }
        case "s":
            return {
                ...state,
                s: action.value,
                _search_criterias_versions: state._search_criterias_versions + 1
            }
        case "e":
            return {
                ...state,
                e: action.value,
                _search_criterias_versions: state._search_criterias_versions + 1
            }
        case "d":
            return {
                ...state,
                d: action.value,
                _search_criterias_versions: state._search_criterias_versions + 1
            }
        default:
            throw Error(`unknown action type ${action.type}`)
    }
}

const encodeQueryAsPath = searchFilters => {

    const pathVars =
        listify(searchFilters, (k, v) => {
            if(k.startsWith("_")) {
                return null
            }
            if(v === "All") {
                return null
            }
            if(v === "No Filter") {
                return null
            }
            if(v === "") {
                return null
            }
            return v === null ? null : `${k}/${v}`
        })
        .filter(i => i)

    if(pathVars.length === 0) {
        return ""
    }
    else {
        return  "/" + pathVars.join("/")
    }
}



export const useSeachProteins = ({species_sn}) => {

    const [queryInProgress, setQueryInProgress] = useState(false)

    const [proteinQueryResult, setProteinQueryResult] = useState(null)

    const [searchFilters, searchFiltersDispatcher] = useReducer(
        searchFiltersReducer,
        searchFiltersReducer(null, {type: 'init'})
    )

    useEffect(() => {
        if(searchFilters._query_trigger > 0) {
            const ec = encodeQueryAsPath(searchFilters)
            setQueryInProgress(true)
            searchProteins(species_sn, ec).then(res => {

                const query = searchFilters.a ? searchFilters.a.toUpperCase() : ""

                res.forEach(row => {

                    const isExactMatch =
                        row.searchable_accessions.p.find(a => query === a) ||
                        row.searchable_accessions.t.find(a => query === a) ||
                        row.searchable_accessions.g.find(a => query === a) ? 1 : 0

                    row.sort_key = isExactMatch * 100000 + row.combined_evidence_score
                })

                setProteinQueryResult(sort(
                    res,
                    row => row.sort_key,
                    true
                ))
                setQueryInProgress(false)
            })
        }
    }, [`${searchFilters._query_trigger}-${searchFilters._search_criterias_versions}`])


    return {
        proteinQueryResult,
        setAccessionPattern: p => searchFiltersDispatcher({type: "a", value: p}),
        accessionPattern: searchFilters.a,
        setProteinType: t => searchFiltersDispatcher({type: "t", value: t}),
        proteinType: searchFilters.t,
        setExperimentalEvidence: e => searchFiltersDispatcher({type: "e", value: e}),
        experimentalEvidence: searchFilters.e,
        setWithDomains: d => searchFiltersDispatcher({type: "d", value: d}),
        withDomains: searchFilters.d,
        setAnnotationSource: s => searchFiltersDispatcher({type: "s", value: s}),
        annotationSource: searchFilters.s,
        queryInProgress
    }
}
export const useFetchProtPsms = ({species_sn, protein_seq_id}) => {
    
    const [response, setResponse] = useState({isReady: false, prot_psms: []})
    
    useEffect(() => {
        fetchProtPsms(species_sn, protein_seq_id).then(res => {
            
            setResponse({isReady: true, prot_psms: res})
            
        })
    }, [])

    return {
        ...response
    }
}

export const useFetchPsm = () => {

    const [response, setResponse] = useState({isReady: false, psm: {}})

    return {
        ...response,
        fetchPsm:(species_sn, psm_id) => {
            fetchPsm(species_sn, psm_id).then(res => {
            setResponse({isReady: true, psm: res})
            })
        }
    }
}

export const useFetchGtex = ({transcript, paintSvg}) => {

    const [gtext_data, set_gtext_data] = useState(null)

    const [svgNode, setSVGNode] = useState(null)

    const [isLoading, setIsLoading] = useState(false)

    const [counter, setCounter] = useState(0)

    const incCounter = () => setCounter(counter + 1)

    useEffect(() => {
        fetchGtex(transcript.transcript_id).then(res => {
            setIsLoading(true)
            set_gtext_data(res)
            incCounter()
            setIsLoading(false)
        })
    }, [transcript.transcript_id])

    useEffect(() => {
        if(svgNode !== null && gtext_data !== null) {
            paintSvg(svgNode, gtext_data, accessionFromServer => `${transcript.accession}`)
        }
    }, [counter])

    return {
        setSVGNode,
        isLoading
    }
}

export const useFetchProtDetails = ({species_sn, protein_seq_id}) => {

    const [response, setResponse] = useState({isReady: false, data: {}})

    useEffect(() => {
        fetchProtDetails(species_sn, protein_seq_id).then(res => setResponse({isReady: true, data: res}))
    }, [])

    return {
        ...response
    }
}

export const useFetchProteinTranscripts = ({species_sn, protein_seq_id}) => {

    const [response, setResponse] = useState({isReady: false, rows: []})

    useEffect(() => {
        fetchTranscripts(species_sn, protein_seq_id).then(res => setResponse({isReady: true, rows: res}))
    }, [])

    return {
        ...response
    }
}

export const useFetchRiboseqData =
    ({species_sn, protein_seq_id, renderStudy, renderSamples}) => {

    function* tableify({
        studies_by_id, price_detected_tts, sample_data_by_price_data_id,
        transcript_accessions, transcript_translation_accessions
    }){

        const _renderStudy = study_id => renderStudy(studies_by_id[study_id])
        const renderAnnotationSource = row => row.annotation_source === "e" ? "Ensembl" : "Refseq"
        const renderCodon = row => row.codon
        const renderType = row => row.type
        const startScore = row => row.start_score
        const rangeScore = row => row.range_score
        const pValue = row => row.pvalue
        const samples = row =>
            renderSamples(sample_data_by_price_data_id[row.r_price_data_id])
        const totalValue = row => row.total_value
        const transcriptProtein = row =>
            `${transcript_accessions[row.transcript_id]} : ${transcript_translation_accessions[row.transcript_translation_id]}`
        const percent = row => `${row.percent} %`

        const cellInfoFromRow = row => [
            renderAnnotationSource,
            renderCodon,
            renderType,
            startScore,
            rangeScore,
            pValue,
            samples,
            totalValue,
            transcriptProtein,
            percent
        ].map(f => ({content: f(row)}))

        for (const [study_id, group_of_rows] of Object.entries(group(price_detected_tts, row => row.study_id))) {
            const [firstRow, ...remainingRows] = group_of_rows
            yield [
                {
                    rowSpan: group_of_rows.length,
                    content: _renderStudy(study_id)
                },
                ...cellInfoFromRow(firstRow)
            ]
            for (const row of remainingRows) {
                yield [
                    null,
                    ...cellInfoFromRow(row)
                ]
            }
        }
    }

    const [data, setData] = useState({isReady: false, rows: []})

    useEffect(() => {
        fetchRiboseq(species_sn, protein_seq_id).then(res => {
            setData({
                isReady: true,
                rows: Array.from(tableify(res))
            })
        })
    },[])

    return data
}

const CSVToJSON = (data, delimiter = ',') => {
    const titles = data.slice(0, data.indexOf('\n')).split(delimiter);
    return data
      .slice(data.indexOf('\n') + 1)
      .split('\n')
      .map(v => {
        const values = v.split(delimiter);
        return titles.reduce(
          (obj, title, index) => ((obj[title] = values[index]), obj),
          {}
        );
      });
  };

export const use3DMolViewer = ({protein_seq_id}) => {
    const viewerElementRef = useRef()
    const [pdbNotFound, setPdbNotFound] = useState(false)

    useEffect(() => {
        const element = viewerElementRef.current
        const viewer = $3Dmol.createViewer(element)
        //const pdb = "https://api.openprot.org/api/2.0/files/predicted_structures/2265166.pdb"
        //const pdb = "https://files.rcsb.org/view/2POR.pdb"//
        fetchProteinPDB(protein_seq_id).then(res => {
            if(res.pdbExists) {
                res.pdbAsText.then(pdbText => {
                    viewer.addModel(pdbText, "pdb" )
                    viewer.setStyle({}, {cartoon: {colorscheme:{prop: 'b', gradient:'linear', min: 0, max: 100, colors: ["#FF7D45", "#FF7D45", "#FF7D45", "#FF7D45", "#FF7D45","#FFDB13", "#FFDB13","#55CAF9", "#55CAF9", "#0053D6"]}}})
                    viewer.render()
                    const canvas = element.getElementsByTagName("canvas")[0]
                    canvas.style.position = null
                })
            }
            else {
                setPdbNotFound(true)
            }
        })
    }, [])

    return {
        viewerElementRef,
        pdbNotFound
    }
}

const downloadsReducer = (state, action) => {


    const filterTableData = nextState => {


        const r = ({
            ...nextState,
            selectedSpeciesInfo: {
                ...nextState.selectedSpeciesInfo,
                tableData: Array.from(tableifyDownloadFiles(nextState.selectedSpeciesInfo.fileList.filter(
                    f => {
                        const s = nextState.filters.annotationSources
                        //console.log([s, f.annotationSources])
                        if (s !== "a" && f.annotationSources !== s) {
                            //console.log("o1", f)
                            return false
                        }
                        const pt = nextState.filters.proteinTypes
                        //console.log("in", f.proteinTypes, pt)
                        if(f.proteinTypes !== pt.value) {
                            //console.log(["o2", f.proteinTypes, pt, f.proteinTypes !== pt.value, `${f.proteinTypes}` === `${pt.value}`])
                            return false
                        }
                        return true
                    }
                )))
            }
        })

        return r
    }

    const availableAnnotationSourcesOptions = [
        {value: "a", label: "All"},
        {value: "e", label: "Ensembl"},
        {value: "r", label: "Refseq"}
    ]

    const availableProteinTypesOptions = [
        {value: "altprots+isoforms", label: "Altprots and Isoforms"},
        {value: "refprots", label: "RefProts"},
        {value: "refprots+altprots+isoforms", label: "Altprots, Isoforms and Refprots"}
    ]

    switch (action.type) {
        case "init":
            return {
                isReady: false,
                isLoading: false,
                filters: {
                    annotationSources: "a",
                    proteinTypes: "refprots+altprots+isoforms"
                },
                availableAnnotationSourcesOptions,
                availableProteinTypesOptions,
                selectedSpeciesInfo: {}
            }
        case "setIsLoading":
            return {
                ...state,
                isLoading: true
            }
        case "receiveSelectedSpeciesInfo":
            return filterTableData({
                ...state,
                isReady: true,
                isLoading: false,
                selectedSpeciesInfo: {
                    species_sn: action.species_sn,
                    fileList: action.fileList
                }
            })
        case 'setAnnotationSource':

            const nextAvailableProtTypesOptions =
                action.code === "a" ?
                    availableProteinTypesOptions :
                    [availableProteinTypesOptions[0]]

            const nextSelectedProteinType =
                action.code === "a" ?
                    state.filters.proteinTypes :
                    nextAvailableProtTypesOptions[0]

            return filterTableData({
                ...state,
                filters: {
                    //...state.filters,
                    proteinTypes: nextSelectedProteinType,
                    annotationSources: action.code
                },
                availableProteinTypesOptions: nextAvailableProtTypesOptions
            })
        case 'setProteinTypes':
            return filterTableData({
                ...state,
                filters: {
                    ...state.filters,
                    proteinTypes: action.proteinTypes
                }
            })
        default:
            throw Error(`unknown action type ${action.type}`)
    }
}


function* tableifyDownloadFiles(downloadFiles){

    const groupedByAnnotations = sort(
        listify(group(downloadFiles, f => f.annotationSources), (k, v) => [k, v]),
        g => g[0]
    )

    for (const t of groupedByAnnotations) {

        const [annotations, filesInAnnotations] = t

        const [firstRow, ...remainingRows] = filesInAnnotations

        yield {
            hasFirstCol: true,
            firstColRowSpan: filesInAnnotations.length,
            file: firstRow
        }

        for (const row of remainingRows) {
            yield {
                hasFirstCol: false,
                file: row
            }
        }
    }
}


export const useDownloads = ({species_sn}) => {

    const [selectedSpeciesSn, setSelectedSpeciesSn] = useState(species_sn)

    const [downloads, downloadsDispatcher] = useReducer(
        downloadsReducer,
        downloadsReducer(null, {type: 'init'})
    )

    useEffect(() => {
        downloadsDispatcher({type: 'setIsLoading'})
        fetchDownloadFiles(selectedSpeciesSn).then(fileList => {
            downloadsDispatcher({
                type: 'receiveSelectedSpeciesInfo',
                species_sn: 'HS',
                fileList: fileList
            })
        })
    }, [selectedSpeciesSn])

    return {
        selectedSpeciesSn,
        setSelectedSpeciesSn,
        downloads,
        setAnnotationSource: code =>
            downloadsDispatcher({
                type: 'setAnnotationSource',
                code
            }),
        setProteinTypes: proteinTypes =>
            downloadsDispatcher({
                type: 'setProteinTypes',
                proteinTypes
            })
    }
}