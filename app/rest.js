import {objectify, sort} from 'radash'


const apiHost = window.openprot_api_host

const apiVersion = "2.0"

export const all_species = [
        {sn: "HS", id:  2,
            cn: "Human",
            sc: "Homo Sapiens"},
        {sn: "PT", id:  18,
            cn: "Chimp",
            sc: "Pan troglodytes"},
        {sn: "RN", id:  13,
            cn: "Rat",
            sc: "Rattus norvegicus"},            
        {sn: "MM", id:  11,
            cn: "Mouse",
            sc: "Mus musculus"},
        {sn: "BT", id:  16,
            cn: "Cow",
            sc: "Bos taurus"},
        {sn: "OA", id:  20,
            cn: "Sheep",
            sc: "Ovis aries"},            
        {sn: "XT", id:  5,
            cn: "Xenopus",
            sc: "Xenopus tropicalis"},
        {sn: "DR", id:  6,
            cn: "Zebrafish",
            sc: "Danio rerio"},
        {sn: "DM", id:  14,
            cn: "Fruitfly",
            sc: "Drosophila melanogaster"},
        {sn: "CE", id:  15,
            cn: "Roundworm",
            sc: "Caenorhabditis elegans"},
        {sn: "AT", id:  29,
            cn: "Arabidopsis thaliana",
            sc: "Arabidopsis thaliana"},
        {sn: "SC", id:  1,
            cn: "Yeast S288c",
            sc: "Saccharomyces cerevisiae S288c"}
    ]


export const all_species_by_sn = objectify(all_species, s => s.sn)

export const all_species_by_id = objectify(all_species, s => s.id)

const speciesQuery = species_sn => path =>
    fetch(`${apiHost}/api/${apiVersion}/${species_sn}${path}`).then(res => res.json())

export const fetchDomains = protein_seq_id =>
    fetch(`${apiHost}/api/${apiVersion}/proteins/${protein_seq_id}/domains`).then(res => res.json())

export const fetchIDRs = protein_seq_id =>
    fetch(`${apiHost}/api/${apiVersion}/files/IDR_predictions/${protein_seq_id}.csv`).then(res => res.text())

export const getPdbUrl = protein_seq_id => {
    return `${apiHost}/api/${apiVersion}/files/predicted_structures/${protein_seq_id}.pdb`
}
    
export const searchAccessions = (species_sn, query) =>
    speciesQuery(species_sn)(`/pre_search_by_accession/${query}`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }
            return res.map(a => {
                const [text, type_prefix] = a
                switch (type_prefix) {
                    case "g": return {text, type: "gene"}
                    case "t": return {text, type: "transcript"}
                    case "p": return {text, type: "protein"}
                }
        })
        }
    )


export const searchProteins = (species_sn, path_encoded_query) =>
    speciesQuery(species_sn)(`/search_proteins${path_encoded_query}`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            return res.map(prot_row => {
                const [p, t, g] = prot_row.searchable_accessions.split(";").map(s => s.substring(2, s.length))
                prot_row.searchable_accessions = {
                    p: sort(p.split(","), i => i),
                    t: sort(t.split(","), i => i),
                    g: sort(g.split(","), i => i)
                }
                return  prot_row
            })
        }
    )

export const fetchOrthologs = (species_sn, protein_seq_id) =>
    speciesQuery(species_sn)(`/proteins/${protein_seq_id}/orthologs`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            res.forEach(o => {
                o.subject_species_sn = all_species_by_id[o.subject_species_id].sn
            })

            return res
        }
    )

export const fetchParalogs = (species_sn, protein_seq_id) =>
    speciesQuery(species_sn)(`/proteins/${protein_seq_id}/paralogs`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            return res
        }
    )


export const fetchRiboseq = (species_sn, protein_seq_id) =>
    speciesQuery(species_sn)(`/proteins/${protein_seq_id}/riboseq`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            return res
        }
    )


export const fetchTranscripts = (species_sn, protein_seq_id) =>
    speciesQuery(species_sn)(`/proteins/${protein_seq_id}/transcripts`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            return res
        }
    )


export const fetchProtPsms = (species_sn, protein_seq_id) =>
    speciesQuery(species_sn)(`/proteins/${protein_seq_id}/prot_psms`).then(
        res => {
            
            if (res.details === "Not Found") {
                return []
            }

            return res
        }
    )


export const fetchPsm = (species_sn, psm_id) => 
    speciesQuery(species_sn)(`/psms/${psm_id}`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            return res
        }
    )

export const fetchProtDetails = (species_sn, protein_seq_id) => 
    speciesQuery(species_sn)(`/proteins/${protein_seq_id}/details`).then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            return res
        }
    )

export const fetchGtex = (transcript_id) => 
    fetch(`${apiHost}/api/2.0/gtex/${transcript_id}`).then(
        res => {
            if (res.details === "Not Found") {
                return {}
            }

            return res.json()
        }).then(res => {

            const z = res
            const correctedGtex = JSON.parse(
                z.gtex
                .replaceAll('"', '')
                .replaceAll("'", '"')
                .replaceAll("(", "[")
                .replaceAll(")", "]")
            ) // TODO: store valid JSON instead...

            z.gtex = correctedGtex

            return z
        }
    )

export const fetchProteinPDB = (protein_seq_id) =>
    fetch(`${apiHost}/api/2.0/files/predicted_structures/${protein_seq_id}.pdb`).then(res =>{
        if(res.ok) {
            return {pdbExists: true, pdbAsText: res.text()}
        }
        else {
            return {pdbExists: false, pdbAsText: null}
        }
    })

export const fetchDownloadFiles = species_sn =>
    speciesQuery(species_sn)("/downloads").then(
        res => {
            if (res.details === "Not Found") {
                return []
            }

            res.forEach(f => {
                f.readmeUrl = `${apiHost}/api/2.0/${species_sn}/downloads/${f.fileName}.readme.html`
                f.zipUrl = `${apiHost}/api/2.0/${species_sn}/downloads/${f.fileName}.zip`
                f.fetchReadme = () => fetch(f.readmeUrl).then(res => res.text())
            })

            return res
        }
    )